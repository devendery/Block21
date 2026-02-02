// server/src/index.ts - UNLIMITED VERSION
import http from "http";
import express from "express";
import cors from "cors";
import { Server, Room, Client } from "colyseus";
import { StateView, Encoder } from "@colyseus/schema";
import { GameState, Player, SnakeSegment, Food } from "./State";
import { SnakeLogic } from "./Snake";
import { AISnakeController } from "./AISnakeController";
import { PhysicsConfig, checkCircleCollision, calculateSnakeRadius } from "./Physics";
import { CollisionSystem } from "./CollisionSystem";
import { PersistenceSystem } from "./PersistenceSystem";
import { SERVER_CONSTANTS } from "./ServerConstants";

Encoder.BUFFER_SIZE = SERVER_CONSTANTS.ENCODER_BUFFER_SIZE;

class SpatialGrid {
  private cellSize: number;
  private cells: Map<string, Set<string>> = new Map();

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  clear() {
    this.cells.clear();
  }

  private key(cx: number, cy: number) {
    return `${cx},${cy}`;
  }

  insert(id: string, x: number, y: number) {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const k = this.key(cx, cy);
    let bucket = this.cells.get(k);
    if (!bucket) {
      bucket = new Set<string>();
      this.cells.set(k, bucket);
    }
    bucket.add(id);
  }

  query(x: number, y: number, radius: number): Set<string> {
    const result = new Set<string>();
    const minX = Math.floor((x - radius) / this.cellSize);
    const maxX = Math.floor((x + radius) / this.cellSize);
    const minY = Math.floor((y - radius) / this.cellSize);
    const maxY = Math.floor((y + radius) / this.cellSize);
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const bucket = this.cells.get(this.key(cx, cy));
        if (!bucket) continue;
        bucket.forEach((id) => result.add(id));
      }
    }
    return result;
  }
}

class Block21Room extends Room<GameState> {
  // Game Loop
  snakes: Map<string, SnakeLogic> = new Map();
  private aiSnakes: Map<string, AISnakeController> = new Map(); // AI snake controllers
  private collisionSystem!: CollisionSystem;
  private persistenceSystem!: PersistenceSystem;
  private clientViews: Map<string, StateView> = new Map();
  private clientAOI: Map<string, { players: Set<string>; food: Map<string, Food> }> = new Map();
  private playersGrid = new SpatialGrid(PhysicsConfig.AOI_RADIUS);
  private foodGrid = new SpatialGrid(PhysicsConfig.AOI_RADIUS);
  private tickCounter = 0;
  private readonly GRID_REBUILD_EVERY = SERVER_CONSTANTS.GRID_REBUILD_EVERY;

  private getAoiRadius(me: import("../../shared/schemas/GameState").Player) {
    const len = me.length || 0;
    const progress = Math.max(0, Math.min(1, len / SERVER_CONSTANTS.AOI_LENGTH_NORMALIZATION));
    const base = PhysicsConfig.AOI_RADIUS;
    const max = PhysicsConfig.AOI_RADIUS * 2;
    return base + (max - base) * Math.sqrt(progress);
  }

  onCreate (options: any) {
    console.log("Block21 Room Created! (UNLIMITED VERSION)");
    this.setState(new GameState());
    
    // Initialize systems
    this.collisionSystem = new CollisionSystem(this.state);
    this.persistenceSystem = new PersistenceSystem();

    // Message Handlers
    this.onMessage("input", (client, input) => {
      const snake = this.snakes.get(client.sessionId);
      if (!snake) return;
      snake.lastInput = input;
    });

    // ✅ SINGLE game loop
    this.setSimulationInterval(
      (deltaTime) => this.update(deltaTime),
      1000 / SERVER_CONSTANTS.TICK_RATE
    );

    // Initial Food Spawn (spread across infinite space)
    for (let i = 0; i < SERVER_CONSTANTS.INITIAL_FOOD_COUNT; i++) {
      this.spawnFood();
    }
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    
    // Create Player State
    const player = new Player();
    player.id = client.sessionId;
    
    // INFINITE MAP: Spawn anywhere (no boundaries)
    player.x = (Math.random() - 0.5) * SERVER_CONSTANTS.PLAYER_SPAWN_RANGE;
    player.y = (Math.random() - 0.5) * SERVER_CONSTANTS.PLAYER_SPAWN_RANGE;
   // player.angle = Math.random() * Math.PI * 2;
   // Line 114: Change from Math.random() * Math.PI * 2 to Math.PI / 2
    player.angle = Math.PI / 2; // Snake starts facing UP
    player.name = options.name || "Anonymous";
    player.radius = PhysicsConfig.BASE_RADIUS;
    
    // Assign Random Skin (0 to 5)
    player.skin = Math.floor(Math.random() * SERVER_CONSTANTS.SKIN_COUNT);
    
    this.state.players.set(client.sessionId, player);

    // Initialize Physics Logic for this player
    const snakeLogic = new SnakeLogic(player, this);
    snakeLogic.initSegments();
    this.snakes.set(client.sessionId, snakeLogic);
    this.collisionSystem.registerSnakeLogic(client.sessionId, snakeLogic);

    // Initialize AOI view for this client
    const view = new StateView();
    (client as any).view = view;
    this.clientViews.set(client.sessionId, view);
    this.clientAOI.set(client.sessionId, { 
      players: new Set([client.sessionId]), 
      food: new Map<string, Food>() 
    });
    
    // Always see yourself
    view.add(player);

    // Load saved progress
    const savedData = this.persistenceSystem.loadPlayer(client.sessionId);
    if (savedData) {
      console.log(`Loaded saved data for ${player.name}: highScore=${savedData.highScore}`);
    }

    // Welcome message
    client.send("welcome", {
      message: "Welcome to Worms Zone Unlimited!",
      features: ["infinite_map", "unlimited_growth", "persistent_progress"]
    });

    // Spawn AI snakes (1 player = 20 AI snakes)
    this.spawnAISnakes();
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    
    const player = this.state.players.get(client.sessionId);
    if (player) {
      // Save player progress
      this.persistenceSystem.savePlayer(player);
      
      // Convert snake to food on disconnect
      this.convertSnakeToFood(client.sessionId);
    }
    
    this.collisionSystem.unregisterSnakeLogic(client.sessionId);
    this.state.players.delete(client.sessionId);
    this.snakes.delete(client.sessionId);
    this.clientViews.delete(client.sessionId);
    this.clientAOI.delete(client.sessionId);
    
    // Clean up AI snakes when player leaves
    this.removeAllAISnakes();
  }

  onDispose() {
    console.log("room disposed");
    
    // Save all players before shutdown
    this.state.players.forEach(player => {
      this.persistenceSystem.savePlayer(player);
    });
    
    this.persistenceSystem.shutdown();
  }

  update(deltaTime: number) {
    const dt = deltaTime / 1000;
    this.tickCounter++;


    
    // Update all snakes
    this.snakes.forEach((snake, sessionId) => {
      if (!snake.player.alive) return;

      const input = snake.lastInput ?? {
        vector: snake.getDirectionVector(),
        boost: false
      };

      snake.update(dt, input);
      
      const seq = (input as any).seq;
      if (typeof seq === "number") {
        snake.player.lastAckInputSeq = seq;
      }
    });

    // Update AI snakes
    this.aiSnakes.forEach((aiController, aiId) => {
      const snake = this.snakes.get(aiId);
      if (!snake || !snake.player.alive) return;
      
      // Get AI decision and update the snake
      const aiInput = aiController.update(dt);
      snake.update(dt, aiInput);
    });

    // Update collision system
    this.collisionSystem.update();

    // Rebuild spatial grids periodically
    if (this.tickCounter % this.GRID_REBUILD_EVERY === 0) {
      this.playersGrid.clear();
      this.state.players.forEach((p, id) => {
        this.playersGrid.insert(id, p.x, p.y);
      });

      this.foodGrid.clear();
      this.state.food.forEach((f, id) => {
        this.foodGrid.insert(id, f.x, f.y);
      });
    }

    // AOI filtering per client
    this.clients.forEach((client) => {
      const myId = client.sessionId;
      const me = this.state.players.get(myId);
      const view = this.clientViews.get(myId);
      const aoi = this.clientAOI.get(myId);
      if (!me || !view || !aoi) return;

      const radius = this.getAoiRadius(me);
      const radiusSq = radius * radius;

      // Players in AOI
      const newPlayers = new Set<string>();
      const playerCandidates = this.playersGrid.query(me.x, me.y, radius);
      playerCandidates.forEach((pid) => {
        const p = this.state.players.get(pid);
        if (!p) return;
        
        if (!p.alive) {
          newPlayers.add(pid);
          return;
        }

        const dx = p.x - me.x;
        const dy = p.y - me.y;
        if ((dx * dx + dy * dy) <= radiusSq) {
          newPlayers.add(pid);
        }
      });
      newPlayers.add(myId);

      // Remove players no longer in AOI
      aoi.players.forEach((pid) => {
        if (newPlayers.has(pid)) return;
        const p = this.state.players.get(pid);
        if (p) view.remove(p);
      });
      
      // Update player chunk positions
  this.state.players.forEach((player, playerId) => {
    const chunkX = Math.floor(player.x / PhysicsConfig.CHUNK_SIZE);
    const chunkY = Math.floor(player.y / PhysicsConfig.CHUNK_SIZE);
    
    if (player.currentChunkX !== chunkX || player.currentChunkY !== chunkY) {
      player.currentChunkX = chunkX;
      player.currentChunkY = chunkY;
      // Could trigger chunk loading/unloading here
    }
  });

      // Add new players
      newPlayers.forEach((pid) => {
        if (aoi.players.has(pid)) return;
        const p = this.state.players.get(pid);
        if (p) view.add(p);
      });
      aoi.players = newPlayers;

      // Food in AOI
      const newFood = new Map<string, Food>();
      const foodAOIRadius = PhysicsConfig.AOI_RADIUS * SERVER_CONSTANTS.FOOD_AOI_SCALE;
      const foodRadiusSq = foodAOIRadius * foodAOIRadius;
      const foodCandidates = this.foodGrid.query(me.x, me.y, foodAOIRadius);
      
      foodCandidates.forEach((fid) => {
        const f = this.state.food.get(fid);
        if (!f) return;
        const dx = f.x - me.x;
        const dy = f.y - me.y;
        if ((dx * dx + dy * dy) <= foodRadiusSq) {
          newFood.set(fid, f);
        }
      });

      // Remove food no longer in AOI
      aoi.food.forEach((f, fid) => {
        if (newFood.has(fid)) return;
        view.remove(f);
      });

      // Add new food
      newFood.forEach((f, fid) => {
        if (aoi.food.has(fid)) return;
        view.add(f);
      });
      aoi.food = newFood;
    });

    // Auto-spawn food to maintain density
    if (this.state.food.size < SERVER_CONSTANTS.MIN_FOOD_COUNT) {
      this.spawnFood();
    }
  }

  spawnFood() {
    const food = new Food();
    
    // DYNAMIC BOUNDARY: Spawn only inside current boundary
    const currentBoundary = this.calculateCurrentBoundary();
    const boundaryMargin = currentBoundary * 0.9; // 90% of boundary to keep food away from edges
    
    if (this.state.players.size > 0) {
      const players = Array.from(this.state.players.values());
      const randomPlayer = players[Math.floor(Math.random() * players.length)];
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * SERVER_CONSTANTS.FOOD_SPAWN_NEAR_PLAYER_RANGE;
      
      // Ensure food spawns inside boundary
      food.x = randomPlayer.x + Math.cos(angle) * distance;
      food.y = randomPlayer.y + Math.sin(angle) * distance;
      
      // Clamp to boundary
      food.x = Math.max(-boundaryMargin, Math.min(boundaryMargin, food.x));
      food.y = Math.max(-boundaryMargin, Math.min(boundaryMargin, food.y));
    } else {
      // No players, spawn inside boundary
      food.x = (Math.random() - 0.5) * boundaryMargin;
      food.y = (Math.random() - 0.5) * boundaryMargin;
    }
    
    food.value = PhysicsConfig.FOOD_VALUE;
    const id = Math.random().toString(36).substr(2, SERVER_CONSTANTS.FOOD_ID_LENGTH);
    this.state.food.set(id, food);
    this.foodGrid.insert(id, food.x, food.y);
  }

  private spawnAISnakes() {
    // Remove any existing AI snakes first
    this.removeAllAISnakes();
    
    // Spawn 20 AI snakes for 1 player
    const aiSnakeCount = 20;
    
    for (let i = 0; i < aiSnakeCount; i++) {
      this.spawnSingleAISnake(i);
    }
    
    console.log(`Spawned ${aiSnakeCount} AI snakes`);
  }

  private spawnSingleAISnake(index: number) {
    // Create AI player state
    const player = new Player();
    player.id = `ai_${index}_${Date.now()}`;
    
    // Spawn AI snake in reasonable range
    player.x = (Math.random() - 0.5) * SERVER_CONSTANTS.PLAYER_SPAWN_RANGE;
    player.y = (Math.random() - 0.5) * SERVER_CONSTANTS.PLAYER_SPAWN_RANGE;
    player.angle = -Math.PI / 2; // Face UP like player snakes
    player.name = `AI_${Math.floor(Math.random() * 1000)}`;
    player.radius = PhysicsConfig.BASE_RADIUS;
    player.skin = Math.floor(Math.random() * SERVER_CONSTANTS.SKIN_COUNT);
    
    // Add to game state
    this.state.players.set(player.id, player);
    
    // Initialize snake logic
    const snakeLogic = new SnakeLogic(player, this);
    snakeLogic.initSegments();
    
    // Create AI controller
    const aiController = new AISnakeController(snakeLogic);
    
    // Register with collision system
    this.collisionSystem.registerSnakeLogic(player.id, snakeLogic);
    
    // Store references
    this.snakes.set(player.id, snakeLogic);
    this.aiSnakes.set(player.id, aiController);
  }

  private removeAllAISnakes() {
    // Remove all AI snakes from the game
    for (const [aiId, aiController] of this.aiSnakes) {
      this.state.players.delete(aiId);
      this.snakes.delete(aiId);
      this.collisionSystem.unregisterSnakeLogic(aiId);
    }
    this.aiSnakes.clear();
  }

  convertSnakeToFood(playerId: string) {
    const snakeLogic = this.snakes.get(playerId);
    if (!snakeLogic) return;

    // Convert 40% of snake to food (Worms Zone style)
    const pelletsToCreate = Math.max(
      1,
      Math.floor(snakeLogic.player.mass * SERVER_CONSTANTS.DISCONNECT_FOOD_FRACTION)
    );
    
    for (let i = 0; i < pelletsToCreate; i++) {
      const food = new Food();
      const angle = Math.random() * Math.PI * 2;
      const distance =
        Math.random() *
          (SERVER_CONSTANTS.DISCONNECT_FOOD_DISTANCE_MAX -
            SERVER_CONSTANTS.DISCONNECT_FOOD_DISTANCE_MIN) +
        SERVER_CONSTANTS.DISCONNECT_FOOD_DISTANCE_MIN;
      
      food.x = snakeLogic.player.x + Math.cos(angle) * distance;
      food.y = snakeLogic.player.y + Math.sin(angle) * distance;
      food.value = SERVER_CONSTANTS.DISCONNECT_FOOD_VALUE;
      
      const id = `dead_${playerId}_${i}_${Date.now()}`;
      this.state.food.set(id, food);
      this.foodGrid.insert(id, food.x, food.y);
    }
  }

  private calculateCurrentBoundary(): number {
    // Calculate average player mass for dynamic boundary
    const allPlayers = Array.from(this.state.players.values());
    if (allPlayers.length === 0) return 1000; // Default boundary
    
    const totalMass = allPlayers.reduce((sum: number, p: any) => sum + p.mass, 0);
    const averageMass = totalMass / allPlayers.length;
    
    // DEVELOPMENT: Start with very small boundary (1000 units)
    const DEV_BASE_BOUNDARY = 1000;
    const BASE_BOUNDARY = PhysicsConfig.UNIVERSE_LIMIT;
    const MAX_BOUNDARY = BASE_BOUNDARY * 3; // Maximum 3x expansion
    
    // Scale boundary based on average mass (more mass = larger world)
    const massScale = Math.min(3, 1 + (averageMass / 500)); // Faster scaling for development
    const dynamicBoundary = DEV_BASE_BOUNDARY * massScale;
    
    return Math.min(MAX_BOUNDARY, Math.max(DEV_BASE_BOUNDARY, dynamicBoundary));
  }
}

const app = express();
app.use(cors());
app.use(express.json());

const gameServer = new Server({
  server: http.createServer(app)
});

const roomName = process.env.BLOCK21_ROOM_NAME || "block21";
const region = process.env.BLOCK21_REGION || "local";
gameServer.define(roomName, Block21Room);

gameServer.listen(2567);
console.log(`🔄 UNLIMITED VERSION: Listening on ws://localhost:2567`);
console.log(`🌍 Features: Infinite Map | Unlimited Growth | 24/7 Play`);
