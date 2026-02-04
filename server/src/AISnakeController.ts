// server/src/AISnakeController.ts
import { Vector2 } from './Physics';
import { SnakeLogic } from './Snake';
import { Player } from './State';

interface AIDecision {
  vector: Vector2;
  boost: boolean;
}

export class AISnakeController {
  private snake: SnakeLogic;
  private decisionInterval: number = 0.3 + Math.random() * 0.4; // 0.3-0.7 seconds between decisions
  private lastDecisionTime: number = 0;
  private currentDecision: AIDecision = { vector: { x: 0, y: 0 }, boost: false };
  private visionRadius: number = 600 + Math.random() * 400; // Varying vision (600-1000)
  private personalityNoise: number = 0.1 + Math.random() * 0.2; // Varying randomness
  
  // Memory of recent food and obstacles
  private knownFood: Map<string, { x: number; y: number; value: number }> = new Map();
  private knownObstacles: { x: number; y: number; radius: number }[] = [];
  
  constructor(snake: SnakeLogic) {
    this.snake = snake;
    const player = this.getPlayer();
    player.name = `AI_${Math.floor(Math.random() * 1000)}`;
  }

  // Get the player object from the snake logic
  private getPlayer(): Player {
    return (this.snake as any).player;
  }

  // Get the current direction from the snake logic
  private getCurrentDirection(): Vector2 {
    return this.snake.getDirectionVector();
  }

  // Get the current position
  private getPosition(): { x: number; y: number } {
    const player = this.getPlayer();
    return { x: player.x, y: player.y };
  }

  // Get the current radius
  private getRadius(): number {
    const player = this.getPlayer();
    return player.radius;
  }

  private getArena() {
    const room = (this.snake as any).room;
    const radius = room?.getArenaRadius?.();
    const center = room?.getArenaCenter?.() ?? { x: 0, y: 0 };
    return { radius, center };
  }

  // Update the AI controller - should be called every frame
  update(dt: number) {
    const currentTime = Date.now() / 1000;
    
    // Make new decision at intervals
    if (currentTime - this.lastDecisionTime > this.decisionInterval) {
      this.makeDecision();
      this.lastDecisionTime = currentTime;
    }
    
    // Update knowledge based on current position
    this.updateKnowledge();
    
    // Return the current decision for the snake to use
    return this.currentDecision;
  }

  private makeDecision() {
    const arena = this.getArena();
    if (typeof arena.radius === "number") {
      const pos = this.getPosition();
      const dx = arena.center.x - pos.x;
      const dy = arena.center.y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > arena.radius * 0.8) {
        const denom = Math.max(1e-6, dist);
        this.currentDecision = {
          vector: { x: dx / denom, y: dy / denom },
          boost: false
        };
        return;
      }
    }

    // Decision layers (in priority order):
    // 1. Survival (avoid collisions)
    const avoidanceVector = this.calculateObstacleAvoidance();
    if (avoidanceVector) {
      this.currentDecision = {
        vector: avoidanceVector,
        boost: false // Don't boost when avoiding
      };
      return;
    }
    
    // 2. Food opportunity
    const foodVector = this.calculateFoodSeeking();
    if (foodVector) {
      this.currentDecision = {
        vector: foodVector,
        boost: this.shouldBoostForFood()
      };
      return;
    }
    
    // 3. Random exploration with personality
    this.currentDecision = this.calculateExploration();
  }

  private calculateObstacleAvoidance(): Vector2 | null {
    const position = this.getPosition();
    const radius = this.getRadius();
    const immediateDangerRadius = radius * 3;
    
    // Check for nearby obstacles
    for (const obstacle of this.knownObstacles) {
      const dx = obstacle.x - position.x;
      const dy = obstacle.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < immediateDangerRadius + obstacle.radius) {
        // Move away from obstacle
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        if (magnitude > 0) {
          return { x: -dx / magnitude, y: -dy / magnitude };
        }
      }
    }
    
    return null;
  }

  private calculateFoodSeeking(): Vector2 | null {
    if (this.knownFood.size === 0) return null;
    
    const position = this.getPosition();
    const arena = this.getArena();
    
    // Find closest food
    let closestFood: { x: number; y: number; value: number } | null = null;
    let closestId: string | null = null;
    let bestScore = Infinity;
    
    for (const [id, food] of this.knownFood) {
      const dx = food.x - position.x;
      const dy = food.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.visionRadius) {
        const centerDx = food.x - (arena.center?.x ?? 0);
        const centerDy = food.y - (arena.center?.y ?? 0);
        const centerDist = Math.sqrt(centerDx * centerDx + centerDy * centerDy);

        const score = distance + centerDist * 0.2;
        if (score < bestScore) {
          bestScore = score;
          closestId = id;
          closestFood = food;
        }
      }
    }

    if (!closestFood || !closestId) return null;
    
    // Move toward food with some randomness
    const fdx = closestFood.x - position.x;
    const fdy = closestFood.y - position.y;
    const fdist = Math.sqrt(fdx * fdx + fdy * fdy);
    
    if (fdist < 10) {
      this.knownFood.delete(closestId);
      return null;
    }
    
    // Add some randomness to movement
    const noiseX = (Math.random() - 0.5) * this.personalityNoise;
    const noiseY = (Math.random() - 0.5) * this.personalityNoise;
    
    return {
      x: fdx / fdist + noiseX,
      y: fdy / fdist + noiseY
    };
  }

  private calculateExploration(): AIDecision {
    const currentDir = this.getCurrentDirection();
    const currentAngle = Math.atan2(currentDir.y, currentDir.x);
    const explorationAngle = currentAngle + (Math.random() - 0.5) * Math.PI * this.personalityNoise;
    
    const base = { x: Math.cos(explorationAngle), y: Math.sin(explorationAngle) };
    const arena = this.getArena();
    if (typeof arena.radius === "number") {
      const pos = this.getPosition();
      const dx = arena.center.x - pos.x;
      const dy = arena.center.y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1e-6) {
        const pull = Math.min(0.4, dist / arena.radius);
        const centerVec = { x: dx / dist, y: dy / dist };
        const vx = base.x * (1 - pull) + centerVec.x * pull;
        const vy = base.y * (1 - pull) + centerVec.y * pull;
        const denom = Math.max(1e-6, Math.sqrt(vx * vx + vy * vy));
        return { vector: { x: vx / denom, y: vy / denom }, boost: Math.random() < 0.1 };
      }
    }

    return {
      vector: base,
      boost: Math.random() < 0.1
    };
  }

  private shouldBoostForFood(): boolean {
    return Math.random() < 0.3;
  }

  private updateKnowledge() {
    const position = this.getPosition();
    
    // Remove food that's too far away
    for (const [id, food] of this.knownFood) {
      const dx = food.x - position.x;
      const dy = food.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > this.visionRadius * 1.5) {
        this.knownFood.delete(id);
      }
    }
    
    // Clear obstacles periodically
    if (Math.random() < 0.05) {
      this.knownObstacles = [];
    }
  }

  // Public methods for the room to update AI knowledge
  public addFoodKnowledge(foodId: string, x: number, y: number, value: number) {
    this.knownFood.set(foodId, { x, y, value });
  }

  public addObstacleKnowledge(x: number, y: number, radius: number) {
    this.knownObstacles.push({ x, y, radius });
  }

  public removeFoodKnowledge(foodId: string) {
    this.knownFood.delete(foodId);
  }

  // Get the snake logic instance
  public getSnakeLogic(): SnakeLogic {
    return this.snake;
  }
}
