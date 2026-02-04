// server/src/index.ts
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
  private arenaTier = 1;
  private arenaRadius: number = SERVER_CONSTANTS.ARENA_TIER_RADII[1];

  getArenaRadius() {
    return this.arenaRadius;
  }

  getArenaCenter() {
    return { x: 0, y: 0 };
  }

  getArenaTier() {
    return this.arenaTier;
  }

  private getAoiRadius(me: import("../../shared/schemas/GameState").Player) {
    const len = me.length || 0;
    const progress = Math.max(0, Math.min(1, len / SERVER_CONSTANTS.AOI_LENGTH_NORMALIZATION));
    const base = PhysicsConfig.AOI_RADIUS;
    const max = PhysicsConfig.AOI_RADIUS * 2;
    return base + (max - base) * Math.sqrt(progress);
  }

  onCreate (options: any) {
    console.log("Block21 Room Created! (ARENA VERSION) with options:", options);
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

    const arena = this.computeArena();
    this.arenaTier = arena.tier;
    this.arenaRadius = arena.radius;
    this.spawnFood(this.getTargetFoodCount());
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    
    // Create Player State
    const player = new Player();
    player.id = client.sessionId;
    
    const spawn = this.randomPointInArena(this.arenaRadius * 0.85);
    player.x = spawn.x;
    player.y = spawn.y;
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
      message: "Welcome to Worms Zone Arena!",
      features: ["elastic_arena", "center_density", "persistent_progress"]
    });

    // Spawn AI snakes (1 player = 20 AI snakes)
    this.spawnAISnakes(player);
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
    const frameStart = performance.now();
    const dt = deltaTime / 1000;
    this.tickCounter++;

    const arena = this.computeArena();
    this.arenaTier = arena.tier;
    this.arenaRadius = arena.radius;

    
    // Update all snakes
    this.snakes.forEach((snake, sessionId) => {
      if (this.aiSnakes.has(sessionId)) return;
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

    const elapsedAfterPlayers = performance.now() - frameStart;
    const budgetMs = 1000 / SERVER_CONSTANTS.TICK_RATE;
    const slowFrame = elapsedAfterPlayers > budgetMs;

    if (!slowFrame) {
      this.aiSnakes.forEach((aiController, aiId) => {
        const snake = this.snakes.get(aiId);
        if (!snake || !snake.player.alive) return;
        const aiInput = aiController.update(dt);
        snake.update(dt, aiInput);
      });
    }

    if (!slowFrame) {
      if (this.tickCounter % 60 === 0) {
        this.keepAISnakesNearHumans();
      }
    }

    // Update collision system
    this.collisionSystem.update();

    // Rebuild spatial grids periodically
    if (!slowFrame && this.tickCounter % this.GRID_REBUILD_EVERY === 0) {
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

    const targetFoodCount = this.getTargetFoodCount();
    if (this.state.food.size < targetFoodCount) {
      this.spawnFood(Math.min(
        SERVER_CONSTANTS.FOOD_SPAWN_MAX_PER_TICK,
        targetFoodCount - this.state.food.size
      ));
    }

    const frameEnd = performance.now();
    const frameTime = frameEnd - frameStart;
    if (frameTime > budgetMs) {
      console.warn("Frame slow:", frameTime.toFixed(2), "ms");
    }
  }

  private spawnFood(count: number = 1) {
    for (let i = 0; i < count; i++) {
      const food = new Food();
      const p = this.randomPointInArenaWithCenterWeight();
      food.x = p.x;
      food.y = p.y;
      food.value = PhysicsConfig.FOOD_VALUE;

      const id = Math.random().toString(36).substr(2, SERVER_CONSTANTS.FOOD_ID_LENGTH);
      this.state.food.set(id, food);
      this.foodGrid.insert(id, food.x, food.y);
    }
  }

  private computeArena(): { tier: number; radius: number } {
    let totalMass = 0;
    for (const p of this.state.players.values()) {
      if (!p.alive) continue;
      totalMass += p.mass ?? 0;
    }

    let tier = 4;
    if (totalMass < SERVER_CONSTANTS.ARENA_TIER1_MASS_MAX) tier = 1;
    else if (totalMass < SERVER_CONSTANTS.ARENA_TIER2_MASS_MAX) tier = 2;
    else if (totalMass < SERVER_CONSTANTS.ARENA_TIER3_MASS_MAX) tier = 3;

    const radius = SERVER_CONSTANTS.ARENA_TIER_RADII[tier] ?? SERVER_CONSTANTS.ARENA_TIER_RADII[1];
    return { tier, radius };
  }

  private getTargetFoodCount(): number {
    const area = Math.PI * this.arenaRadius * this.arenaRadius;
    const target = Math.floor(area * SERVER_CONSTANTS.FOOD_DENSITY);
    return Math.min(
      SERVER_CONSTANTS.ARENA_MAX_FOOD,
      Math.max(SERVER_CONSTANTS.MIN_FOOD_COUNT, target)
    );
  }

  private randomPointInArena(radius: number) {
    const r = Math.sqrt(Math.random()) * radius;
    const theta = Math.random() * Math.PI * 2;
    return { x: Math.cos(theta) * r, y: Math.sin(theta) * r };
  }

  private randomPointInArenaWithCenterWeight() {
    const arenaRadius = this.arenaRadius;
    const centerZoneRadius = arenaRadius * SERVER_CONSTANTS.ARENA_CENTER_ZONE_RATIO;
    const a1 = Math.PI * centerZoneRadius * centerZoneRadius;
    const a2 = Math.PI * arenaRadius * arenaRadius - a1;
    const w1 = SERVER_CONSTANTS.ARENA_CENTER_SPAWN_WEIGHT;
    const w2 = 1;
    const pCenter = (w1 * a1) / (w1 * a1 + w2 * a2);

    const theta = Math.random() * Math.PI * 2;
    let r: number;
    if (Math.random() < pCenter) {
      r = Math.sqrt(Math.random()) * centerZoneRadius;
    } else {
      const r0 = centerZoneRadius;
      r = Math.sqrt(r0 * r0 + Math.random() * (arenaRadius * arenaRadius - r0 * r0));
    }

    return { x: Math.cos(theta) * r, y: Math.sin(theta) * r };
  }

  private spawnAISnakes(anchorPlayer?: Player) {
    if (this.aiSnakes.size > 0) return;

    const aiSnakeCount = 8;
    
    for (let i = 0; i < aiSnakeCount; i++) {
      this.spawnSingleAISnake(i, anchorPlayer);
    }
    
    console.log(`Spawned ${aiSnakeCount} AI snakes`);
  }

  private spawnSingleAISnake(index: number, anchorPlayer?: Player) {
    // Create AI player state
    const player = new Player();
    player.id = `ai_${index}_${Date.now()}`;
    
    const anchor = anchorPlayer ?? this.getAnyHumanPlayer();
    if (anchor) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 300 + Math.random() * 600;
      player.x = anchor.x + Math.cos(angle) * distance;
      player.y = anchor.y + Math.sin(angle) * distance;
    } else {
      player.x = (Math.random() - 0.5) * SERVER_CONSTANTS.PLAYER_SPAWN_RANGE;
      player.y = (Math.random() - 0.5) * SERVER_CONSTANTS.PLAYER_SPAWN_RANGE;
    }
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

  private getAnyHumanPlayer(): Player | null {
    for (const p of this.state.players.values()) {
      if (typeof p.id === "string" && p.id.startsWith("ai_")) continue;
      return p;
    }
    return null;
  }

  private keepAISnakesNearHumans() {
    const humans: Player[] = [];
    for (const p of this.state.players.values()) {
      if (typeof p.id === "string" && p.id.startsWith("ai_")) continue;
      humans.push(p);
    }
    if (humans.length === 0) return;

    const maxDist = PhysicsConfig.AOI_RADIUS * 3;
    const maxDistSq = maxDist * maxDist;

    for (const [aiId] of this.aiSnakes) {
      const aiSnake = this.snakes.get(aiId);
      if (!aiSnake || !aiSnake.player.alive) continue;

      let nearest: Player | null = null;
      let bestSq = Infinity;
      for (const h of humans) {
        const dx = aiSnake.player.x - h.x;
        const dy = aiSnake.player.y - h.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestSq) {
          bestSq = d2;
          nearest = h;
        }
      }

      if (!nearest || bestSq <= maxDistSq) continue;

      const angle = Math.random() * Math.PI * 2;
      const distance = 400 + Math.random() * 800;
      aiSnake.player.x = nearest.x + Math.cos(angle) * distance;
      aiSnake.player.y = nearest.y + Math.sin(angle) * distance;
      aiSnake.player.angle = -Math.PI / 2;
      aiSnake.initSegments();
    }
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
console.log(`🔄 ARENA VERSION: Listening on ws://localhost:2567`);
console.log(`🌍 Features: Worms.Zone Arena | Center Density | PvP Focus`);
