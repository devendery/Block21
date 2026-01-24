import http from "http";
import express from "express";
import cors from "cors";
import { Server, Room, Client } from "colyseus";
import { monitor } from "@colyseus/monitor";
import { GameState, Player, SnakeSegment, Food } from "./State";
import { SnakeLogic } from "./Snake";
import { PhysicsConfig, checkCircleCollision } from "./Physics";

class Block21Room extends Room<GameState> {
  // Game Loop
  static TICK_RATE = 20; // 50ms per tick (Server Authority)
  
  // Store SnakeLogic instances (Physics engines) separately from State
  // State is for syncing, Logic is for calculating
  snakes: Map<string, SnakeLogic> = new Map();

  onCreate (options: any) {
    console.log("Block21 Room Created!");
    this.setState(new GameState());

    // Initial Food Spawn
    for (let i = 0; i < 50; i++) {
        this.spawnFood();
    }

    // Game Loop
    this.setSimulationInterval((deltaTime) => this.update(deltaTime), 1000 / Block21Room.TICK_RATE);

    // Message Handlers
    this.onMessage("input", (client, input) => {
        // input: { vector: {x,y}, boost: boolean }
        const snake = this.snakes.get(client.sessionId);
        if (snake) {
            // Update physics immediately? No, queue it?
            // For now, let's just store the latest input on the snake logic
            // Ideally we'd have an input queue for reconciliation, but for Phase 2 start simple.
            snake.update(50/1000, input); // Update physics state
        }
    });
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
        snake.update(dt, { vector: { x: snake.player.dirX, y: snake.player.dirY }, boost: snake.player.speed > PhysicsConfig.BASE_SPEED }); 
        // Note: The input handling above is temporary; in reality, we use the stored input from onMessage.
        // But since SnakeLogic stores its own dirX/dirY, passing them back effectively maintains inertia.
        
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
    
    // Convert segments to food
    snake.player.segments.forEach((seg) => {
        // Drop food at segment location
        // Chance to drop? Or every segment? Let's drop every 3rd segment to avoid clutter
        if (Math.random() > 0.5) {
            const food = new Food();
            food.x = seg.x + (Math.random() * 20 - 10);
            food.y = seg.y + (Math.random() * 20 - 10);
            food.value = 1; // Dropped food value
            const id = Math.random().toString(36).substr(2, 9);
            this.state.food.set(id, food);
        }
    });
    
    // Respawn or Remove?
    // For now, let's remove and let client rejoin or respawn logic handle it.
    // Actually, usually in .io games, you see the "Game Over" screen.
    // So we keep the player but leave them dead?
    // Let's just remove them from the room for now to keep it simple.
    // Or better, reset them.
    
    // Reset Player
    snake.player.alive = true;
    snake.player.x = Math.random() * 1000 - 500;
    snake.player.y = Math.random() * 1000 - 500;
    snake.player.segments.clear();
    snake.player.history = []; // Clear history
    
    // Re-init segments
    // We need to re-run constructor logic basically.
    // Easier to just destroy and create new SnakeLogic?
    // But we need to keep the session.
    
    // Let's just re-init the snake logic
    this.snakes.set(sessionId, new SnakeLogic(snake.player));
  }
}

const app = express();
app.use(cors());
app.use(express.json());

const gameServer = new Server({
  server: http.createServer(app)
});

gameServer.define('block21', Block21Room);

app.use("/colyseus", monitor());

gameServer.listen(2567);
console.log(`Listening on ws://localhost:2567`);
