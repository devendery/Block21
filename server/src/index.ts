import http from "http";
import express from "express";
import cors from "cors";
import { Server, Room, Client } from "colyseus";
import { StateView } from "@colyseus/schema";
// import { monitor } from "@colyseus/monitor";
import { GameState, Player, SnakeSegment, Food } from "./State";
import { SnakeLogic } from "./Snake";
import { PhysicsConfig, checkCircleCollision } from "./Physics";

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
  private clientAOI: Map<string, { players: Set<string>; food: Set<string> }> = new Map();
  private playersGrid = new SpatialGrid(PhysicsConfig.AOI_RADIUS);
  private foodGrid = new SpatialGrid(PhysicsConfig.AOI_RADIUS);

    onCreate (options: any) {
    console.log("Block21 Room Created!");
    this.setState(new GameState());
    console.log("SERVER GameState fields:", Object.keys(this.state));

    // Message Handlers
    this.onMessage("input", (client, input) => {
        console.log("SERVER INPUT from", client.sessionId, input);

        const snake = this.snakes.get(client.sessionId);
        if (!snake) {
            console.log("NO SNAKE FOUND FOR", client.sessionId);
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
    for (let i = 0; i < 50; i++) {
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
    this.clientAOI.set(client.sessionId, { players: new Set([client.sessionId]), food: new Set() });
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

    for (const seg of otherSnake.player.segments) {
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
        console.log(`💥 ${mySessionId} killed by ${otherSessionId}`);
        mySnake.player.alive = false;
        this.killSnake(mySessionId);
        return;
      }
    }
  });
}


update(deltaTime: number) {
  const dt = deltaTime / 1000;

  this.snakes.forEach((snake, sessionId) => {
    if (!snake.player.alive) return;

    const input = snake.lastInput ?? {
      vector: { x: snake.player.dirX, y: snake.player.dirY },
      boost: false
    };

    snake.update(dt, input);

    // ⚠️ PVP FIRST
    this.checkSnakeCollision(snake, sessionId);

    // ❌ STOP if died
    if (!snake.player.alive) return;

    // 🍎 FOOD ONLY IF ALIVE
    this.checkFoodCollision(snake);
  });

    this.playersGrid.clear();
    this.state.players.forEach((p, id) => {
      this.playersGrid.insert(id, p.x, p.y);
    });

    this.foodGrid.clear();
    this.state.food.forEach((f, id) => {
      this.foodGrid.insert(id, f.x, f.y);
    });

    // AOI filtering per client
    const radiusSq = PhysicsConfig.AOI_RADIUS * PhysicsConfig.AOI_RADIUS;
    this.clients.forEach((client) => {
      const myId = client.sessionId;
      const me = this.state.players.get(myId);
      const view = this.clientViews.get(myId);
      const aoi = this.clientAOI.get(myId);
      if (!me || !view || !aoi) return;

      const newPlayers = new Set<string>();
      const playerCandidates = this.playersGrid.query(me.x, me.y, PhysicsConfig.AOI_RADIUS);
      playerCandidates.forEach((pid) => {
        const p = this.state.players.get(pid);
        if (!p) return;
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

      const newFood = new Set<string>();
      const foodCandidates = this.foodGrid.query(me.x, me.y, PhysicsConfig.AOI_RADIUS);
      foodCandidates.forEach((fid) => {
        const f = this.state.food.get(fid);
        if (!f) return;
        const dx = f.x - me.x;
        const dy = f.y - me.y;
        if ((dx * dx + dy * dy) <= radiusSq) {
          newFood.add(fid);
        }
      });

      aoi.food.forEach((fid) => {
        if (newFood.has(fid)) return;
        const f = this.state.food.get(fid);
        if (f) {
          view.remove(f);
        }
      });
      newFood.forEach((fid) => {
        if (aoi.food.has(fid)) return;
        const f = this.state.food.get(fid);
        if (f) {
          view.add(f);
        }
      });
      aoi.food = newFood;
    });

  if (this.state.food.size < 50) {
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
    
    // We can iterate all food. Optimization: Grid-based spatial partition (TODO for Phase 4)
    this.state.food.forEach((food, id) => {
        if (checkCircleCollision(headX, headY, PhysicsConfig.COLLISION_RADIUS, food.x, food.y, PhysicsConfig.FOOD_RADIUS)) {
            // Eat Food
            snake.grow(food.value);
            this.state.food.delete(id);
        }
    });
  }
 killSnake(sessionId: string) {
  const snake = this.snakes.get(sessionId);
  if (!snake) return;

  console.log("💀 Snake died:", sessionId);

  snake.player.segments.forEach(seg => {
    if (Math.random() > 0.5) {
      const food = new Food();
      food.x = seg.x + (Math.random() * 20 - 10);
      food.y = seg.y + (Math.random() * 20 - 10);
      food.value = 1;

      this.state.food.set(
        Math.random().toString(36).slice(2),
        food
      );
    }
  });

  // mark dead then remove after short delay for clients to observe death
  snake.player.alive = false;
  this.clock.setTimeout(() => {
    this.state.players.delete(sessionId);
    this.snakes.delete(sessionId);
  }, 100);
}



}

const app = express();
app.use(cors());
app.use(express.json());

const gameServer = new Server({
  server: http.createServer(app)
});

gameServer.define('block21', Block21Room);

// app.use("/colyseus", monitor());

gameServer.listen(2567);
console.log(`Listening on ws://localhost:2567`);
