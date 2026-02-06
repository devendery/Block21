import { PhysicsConfig, checkCircleCollision } from "./Physics";
import { GameState, Food } from "./State";
import { SnakeLogic } from "./Snake";

export class CollisionSystem {
  private gameState: GameState;
  private snakeLogics: Map<string, SnakeLogic> = new Map();

  private readonly FOOD_CELL_SIZE = 500;
  private foodGrid: Map<number, string[]> = new Map();
  private foodLoc: Map<string, { key: number; index: number; x: number; y: number }> = new Map();

  private nearbyFoodBuffer: string[] = new Array(32);
  private visitedFood: Set<string> = new Set();

  constructor(
    gameState: GameState,
    private hooks?: { onFoodAdded?: (foodId: string, food: Food) => void; onFoodRemoved?: (foodId: string) => void }
  ) {
    this.gameState = gameState;
  }

  registerSnakeLogic(playerId: string, snakeLogic: SnakeLogic) {
    this.snakeLogics.set(playerId, snakeLogic);
  }

  unregisterSnakeLogic(playerId: string) {
    this.snakeLogics.delete(playerId);
  }

  update() {
    for (const [, snakeLogic] of this.snakeLogics.entries()) {
      if (!snakeLogic.player.alive) continue;
      this.checkFoodCollisionsOptimized(snakeLogic);
    }
  }

  private cellKey(x: number, y: number): number {
    const cx = Math.floor(x / this.FOOD_CELL_SIZE);
    const cy = Math.floor(y / this.FOOD_CELL_SIZE);
    return (cx << 16) ^ (cy & 0xffff);
  }

  onFoodAdded(foodId: string, food: Food) {
    const key = this.cellKey(food.x, food.y);
    let cell = this.foodGrid.get(key);
    if (!cell) {
      cell = [];
      this.foodGrid.set(key, cell);
    }

    const index = cell.length;
    cell.push(foodId);
    this.foodLoc.set(foodId, { key, index, x: food.x, y: food.y });
    this.hooks?.onFoodAdded?.(foodId, food);
  }

  onFoodRemoved(foodId: string) {
    const loc = this.foodLoc.get(foodId);
    if (!loc) return;

    const cell = this.foodGrid.get(loc.key);
    if (cell) {
      const index = loc.index;
      if (index < cell.length - 1) {
        cell[index] = cell[cell.length - 1];
        const swappedId = cell[index];
        const swappedLoc = this.foodLoc.get(swappedId);
        if (swappedLoc) swappedLoc.index = index;
      }
      cell.pop();
      if (cell.length === 0) {
        this.foodGrid.delete(loc.key);
      }
    }

    this.foodLoc.delete(foodId);
    this.visitedFood.delete(foodId);
    this.hooks?.onFoodRemoved?.(foodId);
  }

  private checkFoodCollisionsOptimized(snakeLogic: SnakeLogic): boolean {
    const headX = snakeLogic.player.x;
    const headY = snakeLogic.player.y;
    const headRadius = snakeLogic.player.radius;
    const foodRadius = PhysicsConfig.FOOD_RADIUS;

    this.nearbyFoodBuffer.length = 0;
    this.visitedFood.clear();

    const centerKey = this.cellKey(headX, headY);
    const searchRadius = headRadius + foodRadius;
    const radiusCells = Math.ceil(searchRadius / this.FOOD_CELL_SIZE);

    const centerX = centerKey >> 16;
    const centerY = centerKey & 0xffff;
    const cx = (centerX << 16) >> 16;
    const cy = (centerY << 16) >> 16;

    const searchRadiusSq = searchRadius * searchRadius;

    for (let dx = -radiusCells; dx <= radiusCells; dx++) {
      for (let dy = -radiusCells; dy <= radiusCells; dy++) {
        const key = ((cx + dx) << 16) ^ ((cy + dy) & 0xffff);
        const cell = this.foodGrid.get(key);
        if (!cell) continue;

        for (let i = 0; i < cell.length; i++) {
          const foodId = cell[i];
          if (this.visitedFood.has(foodId)) continue;
          this.visitedFood.add(foodId);

          const loc = this.foodLoc.get(foodId);
          if (!loc) continue;

          const dx2 = headX - loc.x;
          const dy2 = headY - loc.y;
          if (dx2 * dx2 + dy2 * dy2 <= searchRadiusSq) {
            this.nearbyFoodBuffer.push(foodId);
          }
        }
      }
    }

    for (const foodId of this.nearbyFoodBuffer) {
      const food = this.gameState.food.get(foodId);
      if (!food) continue;

      if (checkCircleCollision(headX, headY, headRadius, food.x, food.y, foodRadius)) {
        this.consumeFood(snakeLogic, foodId, food);
        return true;
      }
    }

    return false;
  }

  private consumeFood(snakeLogic: SnakeLogic, foodId: string, food: Food) {
    snakeLogic.applyFoodReward(food.points || 0, (food as any).mass || 0);
    this.gameState.food.delete(foodId);
    this.onFoodRemoved(foodId);
  }

  addFoodToGrid(foodId: string, food: Food) {
    this.onFoodAdded(foodId, food);
  }

  getFoodGridStats() {
    let totalFood = 0;
    this.foodGrid.forEach((cell) => {
      totalFood += cell.length;
    });
    return {
      cells: this.foodGrid.size,
      totalFood,
      locatedFood: this.foodLoc.size,
    };
  }

  private handleDeath(snakeLogic: SnakeLogic, reason: string) {
    console.log(`Snake ${snakeLogic.player.id} died: ${reason}`);

    const pelletsToCreate = Math.max(1, Math.floor(snakeLogic.player.mass * 0.4));
    for (let i = 0; i < pelletsToCreate; i++) {
      const food = new Food();
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 50;

      food.x = snakeLogic.player.x + Math.cos(angle) * distance;
      food.y = snakeLogic.player.y + Math.sin(angle) * distance;
      food.kind = 0;
      food.points = 100;
      food.segments = 1;
      food.mass = 4 + Math.random() * 4;

      const foodId = `dead_${snakeLogic.player.id}_${i}_${Date.now()}`;
      this.gameState.food.set(foodId, food);
      this.addFoodToGrid(foodId, food);
    }

    snakeLogic.respawn();
    void reason;
  }
}
