import http from "http";
import express from "express";
import cors from "cors";
import { Server, Room, Client } from "colyseus";
// import { monitor } from "@colyseus/monitor";
import { GameState, Player, SnakeSegment, Food } from "./State";
import { SnakeLogic } from "./Snake";
import { PhysicsConfig, checkCircleCollision } from "./Physics";

class Block21Room extends Room<GameState> {
  // Game Loop
  static TICK_RATE = 60; // 60Hz for smoother gameplay
  
  // Store SnakeLogic instances (Physics engines) separately from State
  // State is for syncing, Logic is for calculating
  snakes: Map<string, SnakeLogic> = new Map();

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
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId);
    this.snakes.delete(client.sessionId);
  }

  onDispose() {
    console.log("room disposed");
  }

  update(deltaTime: number) {
    // Convert ms to seconds
    const dt = deltaTime / 1000;

    // Update all snakes
    this.snakes.forEach((snake, sessionId) => {
        // ✅ USE LAST INPUT FROM CLIENT
        const input = snake.lastInput ?? { 
            vector: { x: snake.player.dirX, y: snake.player.dirY }, 
            boost: false 
        };

        snake.update(dt, input); 
        
        // Check Food Collision
        this.checkFoodCollision(snake);
        
        // Check Death
        if (!snake.player.alive) {
            this.killSnake(sessionId);
        }
    });
    
    // Maintain Food Count
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

  console.log("💀 Snake died permanently:", sessionId);

  // 1️⃣ Drop food from body
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

  // 2️⃣ FINAL DELETE — NO RESPAWN EVER
  this.state.players.delete(sessionId);
  this.snakes.delete(sessionId);
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
