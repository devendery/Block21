import http from "http";
import express from "express";
import cors from "cors";
import { Server, Room, Client } from "colyseus";
import { StateView, Encoder } from "@colyseus/schema";
// import { monitor } from "@colyseus/monitor";
import { GameState, Player, SnakeSegment, Food } from "./State";
import { SnakeLogic } from "./Snake";
import { PhysicsConfig, checkCircleCollision } from "./Physics";

Encoder.BUFFER_SIZE = 256 * 1024;

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
  static TICK_RATE = 60; // 60Hz for smoother gameplay
  
  snakes: Map<string, SnakeLogic> = new Map();
  // Per-client AOI views
  private clientViews: Map<string, StateView> = new Map();
  private clientAOI: Map<string, { players: Set<string>; food: Map<string, Food> }> = new Map();
  private playersGrid = new SpatialGrid(PhysicsConfig.AOI_RADIUS);
  private foodGrid = new SpatialGrid(PhysicsConfig.AOI_RADIUS);
  private tickCounter = 0;
  private readonly GRID_REBUILD_EVERY = 2;

  private getAoiRadius(me: Player) {
    const len = me.length || 0;
    const progress = Math.max(0, Math.min(1, len / 2000));
    const base = PhysicsConfig.AOI_RADIUS;
    const max = PhysicsConfig.AOI_RADIUS * 2;
    return base + (max - base) * Math.sqrt(progress);
  }

    onCreate (options: any) {
    console.log("Block21 Room Created!");
    this.setState(new GameState());
    console.log("SERVER GameState fields:", Object.keys(this.state));

    // Message Handlers
    this.onMessage("input", (client, input) => {
        const snake = this.snakes.get(client.sessionId);
        if (!snake) {
            return;
        }

        snake.lastInput = input;
    });

    // ✅ SINGLE game loop
    this.setSimulationInterval(
        (deltaTime) => this.update(deltaTime),
        1000 / Block21Room.TICK_RATE
    );

    // Initial Food Spawn
    for (let i = 0; i < 500; i++) {
        this.spawnFood();
    }
  }
 
  


  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    
    // Create Player State
    const player = new Player();
    player.id = client.sessionId;
    player.x = Math.random() * 1000 - 500; // Random spawn near center
    player.y = Math.random() * 1000 - 500;
    player.angle = Math.random() * Math.PI * 2;
    player.name = options.name || "Anonymous";
    player.radius = PhysicsConfig.BASE_RADIUS;
    
    // Assign Random Skin (0 to 5)
    player.skin = Math.floor(Math.random() * 6);
    
    this.state.players.set(client.sessionId, player);

    // Initialize Physics Logic for this player
    const snakeLogic = new SnakeLogic(player);
    // Initialize segments AFTER player is attached to state (Crucial for Schema Graph)
    snakeLogic.initSegments();
    
    this.snakes.set(client.sessionId, snakeLogic);

    // Initialize AOI view for this client
    const view = new StateView();
    (client as any).view = view;
    this.clientViews.set(client.sessionId, view);
    this.clientAOI.set(client.sessionId, { players: new Set([client.sessionId]), food: new Map<string, Food>() });
    // Always see yourself
    view.add(player);
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId);
    this.snakes.delete(client.sessionId);
    this.clientViews.delete(client.sessionId);
    this.clientAOI.delete(client.sessionId);
  }

  onDispose() {
    console.log("room disposed");
  }
 checkSnakeCollision(mySnake: SnakeLogic, mySessionId: string) {
    if (!mySnake.player.alive) return;

    const headX = mySnake.player.x;
    const headY = mySnake.player.y;

    this.snakes.forEach((otherSnake, otherSessionId) => {
      if (otherSessionId === mySessionId) return;
      if (!otherSnake.player.alive) return;

      // Optimization: Bounding Box Check first?
      // For now, iterate segments.
      // Worms Zone Logic: Head touches ANY part of other snake -> Death.
      // Including other snake's head? Yes.
      // If Head vs Head -> Both die? Or smaller dies?
      // Let's implement: Both die if Head-on-Head.
      
      // Check Head-on-Head Collision first (with slightly larger radius?)
      const otherHeadX = otherSnake.player.x;
      const otherHeadY = otherSnake.player.y;
      if (checkCircleCollision(headX, headY, PhysicsConfig.COLLISION_RADIUS, otherHeadX, otherHeadY, PhysicsConfig.COLLISION_RADIUS)) {
           console.log(`💥 HEAD-ON-HEAD: ${mySessionId} vs ${otherSessionId}`);
           
           // Kill ME
           mySnake.player.alive = false;
           this.killSnake(mySessionId);
           
           // Kill THEM (Mutual Destruction)
           if (otherSnake.player.alive) {
               otherSnake.player.alive = false;
               this.killSnake(otherSessionId);
           }
           
           return;
      }

      for (const seg of otherSnake.getSegmentsForCollision()) {
        if (
          checkCircleCollision(
            headX,
            headY,
            PhysicsConfig.COLLISION_RADIUS,
            seg.x,
            seg.y,
            PhysicsConfig.COLLISION_RADIUS
          )
        ) {
          console.log(`💥 ${mySessionId} ran into body of ${otherSessionId}`);
          mySnake.player.alive = false;
          this.killSnake(mySessionId);
          return;
        }
      }
    });
  }

  killSnake(sessionId: string) {
      const snake = this.snakes.get(sessionId);
      if (!snake) return;
      
      console.log(`☠️ KILLING SNAKE ${sessionId} - Spawning Food`);
      
      // Convert body to food
      let spawnedCount = 0;
      snake.getSegmentsForCollision().forEach((seg, index) => {
          // Spawn food for every 2nd segment (50% conversion)
          if (index % 2 !== 0) return;
          
          const food = new Food();
          food.x = seg.x + (Math.random() * 20 - 10); 
          food.y = seg.y + (Math.random() * 20 - 10);
          food.value = PhysicsConfig.FOOD_VALUE * 5; // Big chunks for big snakes!
          
          const id = Math.random().toString(36).substr(2, 9);
          this.state.food.set(id, food);
          // Explicitly add to grid so AOI picks it up immediately
          this.foodGrid.insert(id, food.x, food.y);
          spawnedCount++;
      });
      
      console.log(`   -> Spawned ${spawnedCount} food items.`);

      // Mark dead but keep in state for a moment so client receives the food updates
      snake.player.alive = false;
      
      // Delay removal to allow client to process the death and see the food
      setTimeout(() => {
        if (this.state.players.has(sessionId)) {
            this.state.players.delete(sessionId);
            this.snakes.delete(sessionId);
            this.clientViews.delete(sessionId);
            this.clientAOI.delete(sessionId);
        }
      }, 2000); 
  }


update(deltaTime: number) {
  const dt = deltaTime / 1000;
  this.tickCounter++;

  this.snakes.forEach((snake, sessionId) => {
    if (!snake.player.alive) return;

    const input = snake.lastInput ?? {
      vector: { x: snake.player.dirX, y: snake.player.dirY },
      boost: false
    };

    snake.update(dt, input);
    const seq = (input as any).seq;
    if (typeof seq === "number") {
      snake.player.lastAckInputSeq = seq;
    }

    // 🚀 BOOST COST LOGIC (Worms Zone Style: Cost but NO food trail)
    if (snake.player.isBoosting) {
      // Drop mass periodically (approx every 10 frames = 6 times/sec)
      if (Math.random() < 0.15) {
        // Just shrink, do NOT spawn food
        const dropped = snake.shrink(0.25); 
        if (!dropped) {
          // Cannot shrink further, stop boosting
          snake.player.isBoosting = false;
          snake.player.speed = PhysicsConfig.BASE_SPEED;
        }
      }
    }

    // ⚠️ Check if snake died during its own update (Boundary or Self-Collision)
    if (!snake.player.alive) {
      this.killSnake(sessionId);
      return;
    }

    // ⚠️ PVP FIRST
    this.checkSnakeCollision(snake, sessionId);

    // ❌ STOP if died in PVP
    if (!snake.player.alive) return;

    // 🍎 FOOD ONLY IF ALIVE
    this.checkFoodCollision(snake);
  });

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

      const newPlayers = new Set<string>();
      const playerCandidates = this.playersGrid.query(me.x, me.y, radius);
      playerCandidates.forEach((pid) => {
        const p = this.state.players.get(pid);
        if (!p) return;
        
        // Death State Sequencing: Always include dead players in AOI for visibility
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

      aoi.players.forEach((pid) => {
        if (newPlayers.has(pid)) return;
        const p = this.state.players.get(pid);
        if (p) {
          view.remove(p);
        }
      });
      newPlayers.forEach((pid) => {
        if (aoi.players.has(pid)) return;
        const p = this.state.players.get(pid);
        if (p) {
          view.add(p);
        }
      });
      aoi.players = newPlayers;

      // const newFood = new Set<string>();
      // const foodCandidates = this.foodGrid.query(me.x, me.y, radius);
      const newFood = new Map<string, Food>();
      // Food AOI Buffering: Slightly larger radius for food to prevent pop-in
      const foodAOIRadius = PhysicsConfig.AOI_RADIUS * 1.1;
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

      // Remove food no longer in AOI OR eaten (f not in state)
      aoi.food.forEach((f, fid) => {
        if (newFood.has(fid)) return;
        // If it was in our view but now it's not in new AOI (or it was eaten), remove it
        view.remove(f);
      });

      // Add new food
      newFood.forEach((f, fid) => {
        if (aoi.food.has(fid)) return;
        view.add(f);
      });
      aoi.food = newFood;
    });

  if (this.state.food.size < 200) {
    this.spawnFood();
  }
}


  spawnFood() {
    const food = new Food();
    food.x = (Math.random() * PhysicsConfig.MAP_SIZE) - (PhysicsConfig.MAP_SIZE / 2);
    food.y = (Math.random() * PhysicsConfig.MAP_SIZE) - (PhysicsConfig.MAP_SIZE / 2);
    food.value = PhysicsConfig.FOOD_VALUE;
    
    // Generate a unique ID for the food
    const id = Math.random().toString(36).substr(2, 9);
    this.state.food.set(id, food);
  }

  checkFoodCollision(snake: SnakeLogic) {
    const headX = snake.player.x;
    const headY = snake.player.y;
    const radius = snake.player.radius;
    
    // We can iterate all food. Optimization: Grid-based spatial partition (TODO for Phase 4)
    this.state.food.forEach((food, id) => {
        if (checkCircleCollision(headX, headY, radius, food.x, food.y, PhysicsConfig.FOOD_RADIUS)) {
            // Eat Food
            snake.grow(food.value);
            this.state.food.delete(id);
        }
    });
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

// app.use("/colyseus", monitor());

gameServer.listen(2567);
console.log(`Listening on ws://localhost:2567 (${region}) room=${roomName}`);
