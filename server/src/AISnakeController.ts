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
    
    // Find closest food
    let closestFood: { x: number; y: number; value: number } | null = null;
    let minDistance = Infinity;
    
    for (const [id, food] of this.knownFood) {
      const dx = food.x - position.x;
      const dy = food.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance && distance < this.visionRadius) {
        minDistance = distance;
        closestFood = food;
      }
    }
    
    if (!closestFood) return null;
    
    // Move toward food with some randomness
    const dx = closestFood.x - position.x;
    const dy = closestFood.y - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 10) {
      // Very close to food, remove from knowledge
      this.knownFood.delete(Object.keys(this.knownFood)[0]); // Remove first entry
      return null;
    }
    
    // Add some randomness to movement
    const noiseX = (Math.random() - 0.5) * this.personalityNoise;
    const noiseY = (Math.random() - 0.5) * this.personalityNoise;
    
    return {
      x: dx / distance + noiseX,
      y: dy / distance + noiseY
    };
  }

  private calculateExploration(): AIDecision {
    // Random exploration with tendency to move in current direction
    const currentDir = this.getCurrentDirection();
    const currentAngle = Math.atan2(currentDir.y, currentDir.x);
    const explorationAngle = currentAngle + (Math.random() - 0.5) * Math.PI * this.personalityNoise;
    
    return {
      vector: {
        x: Math.cos(explorationAngle),
        y: Math.sin(explorationAngle)
      },
      boost: Math.random() < 0.1 // Occasionally boost randomly
    };
  }

  private shouldBoostForFood(): boolean {
    // Boost only when we have enough segments and it's strategic
    // For now, use a simple random chance
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