// server/src/CollisionSystem.ts - OPTIMIZED VERSION
import { PhysicsConfig, checkCircleCollision, calculateSnakeRadius, BoundingCircle, circleAABBCollision, aabbOverlap } from './Physics';
import { GameState, Player, Food } from './State';
import { SnakeLogic } from './Snake';

// === NEW: Hierarchical Spatial Grid ===
class HierarchicalSpatialGrid {
  private grids: Map<number, Map<string, Set<string>>> = new Map();
  private cellSizes: number[] = [1000, 500, 250]; // Three levels: Far, Medium, Near
  
  constructor() {
    this.cellSizes.forEach(size => {
      this.grids.set(size, new Map());
    });
  }
  
  clear() {
    this.grids.forEach(grid => grid.clear());
  }
  
  private getCellKey(x: number, y: number, cellSize: number): string {
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    return `${cellSize}:${cellX},${cellY}`;
  }
  
  insert(entityId: string, x: number, y: number, radius: number) {
    // Insert into appropriate grid levels based on radius
    this.cellSizes.forEach(cellSize => {
      if (radius <= cellSize * 2) { // Only insert if entity fits in cell
        const key = this.getCellKey(x, y, cellSize);
        const grid = this.grids.get(cellSize)!;
        
        if (!grid.has(key)) grid.set(key, new Set());
        grid.get(key)!.add(entityId);
      }
    });
  }
  
  query(x: number, y: number, radius: number): Set<string> {
    const result = new Set<string>();
    
    // Query from coarse to fine grids
    for (const cellSize of this.cellSizes) {
      if (radius > cellSize * 2) continue; // Skip grids too fine for this radius
      
      const grid = this.grids.get(cellSize)!;
      const centerCellX = Math.floor(x / cellSize);
      const centerCellY = Math.floor(y / cellSize);
      const radiusCells = Math.ceil(radius / cellSize);
      
      for (let dx = -radiusCells; dx <= radiusCells; dx++) {
        for (let dy = -radiusCells; dy <= radiusCells; dy++) {
          const key = `${cellSize}:${centerCellX + dx},${centerCellY + dy}`;
          const entities = grid.get(key);
          if (entities) {
            entities.forEach(id => result.add(id));
          }
        }
      }
      
      // If we found entities in this grid level, we can stop
      if (result.size > 0 && cellSize <= 500) break;
    }
    
    return result;
  }
}

// === NEW: Collision Bucket System ===
class CollisionBucket {
  private snakes: Map<string, { snake: SnakeLogic, bounds: BoundingCircle }> = new Map();
  private bounds: { minX: number, maxX: number, minY: number, maxY: number };
  
  constructor(x: number, y: number, size: number) {
    this.bounds = {
      minX: x - size,
      maxX: x + size,
      minY: y - size,
      maxY: y + size
    };
  }
  
  addSnake(playerId: string, snake: SnakeLogic) {
    const bounds = snake.getBoundingCircle();
    bounds.entityId = playerId;
    this.snakes.set(playerId, { snake, bounds });
  }
  
  removeSnake(playerId: string) {
    this.snakes.delete(playerId);
  }
  
  getCollisionCandidates(playerId: string): SnakeLogic[] {
    const candidates: SnakeLogic[] = [];
    const self = this.snakes.get(playerId);
    if (!self) return candidates;
    
    for (const [otherId, other] of this.snakes.entries()) {
      if (otherId === playerId) continue;
      
      // Broad-phase: Check bounding circles
      const dx = self.bounds.x - other.bounds.x;
      const dy = self.bounds.y - other.bounds.y;
      const distanceSq = dx * dx + dy * dy;
      const radiusSum = self.bounds.radius + other.bounds.radius;
      
      if (distanceSq < radiusSum * radiusSum) {
        candidates.push(other.snake);
      }
    }
    
    return candidates;
  }
  
  isEmpty(): boolean {
    return this.snakes.size === 0;
  }
}

export class CollisionSystem {
  private gameState: GameState;
  private snakeLogics: Map<string, SnakeLogic> = new Map();
  
  // === NEW: Optimized data structures ===
  private spatialGrid: HierarchicalSpatialGrid;
  private collisionBuckets: Map<string, CollisionBucket> = new Map();
  private readonly BUCKET_SIZE = 2000;
  private foodGrid: Map<string, Set<string>> = new Map(); // cellKey -> foodIds
  private readonly FOOD_CELL_SIZE = 500;
  
  constructor(gameState: GameState) {
    this.gameState = gameState;
    this.spatialGrid = new HierarchicalSpatialGrid();
  }
  
  registerSnakeLogic(playerId: string, snakeLogic: SnakeLogic) {
    this.snakeLogics.set(playerId, snakeLogic);
    //this.updateSpatialIndex(playerId, snakeLogic);
  }
  
  unregisterSnakeLogic(playerId: string) {
    this.snakeLogics.delete(playerId);
    // Remove from spatial index
    const snake = this.snakeLogics.get(playerId);
    if (snake) {
      // Note: Grids are cleared each frame, so no explicit removal needed
    }
  }
  
  update() {
    // Step 1: Update spatial indices
    this.updateAllSpatialIndices();
    
    // Step 2: Process collisions bucket by bucket
    this.processCollisionsByBucket();
    
    // Step 3: Update food grid
    this.updateFoodGrid();
  }
  
  private updateAllSpatialIndices() {
    this.spatialGrid.clear();
    
    for (const [playerId, snakeLogic] of this.snakeLogics.entries()) {
      if (!snakeLogic.player.alive) continue;
      
      const bounds = snakeLogic.getBoundingCircle();
      this.spatialGrid.insert(
        playerId,
        snakeLogic.player.x,
        snakeLogic.player.y,
        bounds.radius
      );
    }
  }
  
  private processCollisionsByBucket() {
    // Group snakes into collision buckets
    const bucketMap = new Map<string, CollisionBucket>();
    
    for (const [playerId, snakeLogic] of this.snakeLogics.entries()) {
      if (!snakeLogic.player.alive) continue;
      
      const bucketX = Math.floor(snakeLogic.player.x / this.BUCKET_SIZE);
      const bucketY = Math.floor(snakeLogic.player.y / this.BUCKET_SIZE);
      const bucketKey = `${bucketX},${bucketY}`;
      
      if (!bucketMap.has(bucketKey)) {
        bucketMap.set(bucketKey, new CollisionBucket(
          bucketX * this.BUCKET_SIZE + this.BUCKET_SIZE / 2,
          bucketY * this.BUCKET_SIZE + this.BUCKET_SIZE / 2,
          this.BUCKET_SIZE
        ));
      }
      
      bucketMap.get(bucketKey)!.addSnake(playerId, snakeLogic);
    }
    
    // Process collisions within each bucket
    for (const [bucketKey, bucket] of bucketMap.entries()) {
      this.processBucketCollisions(bucket);
    }
  }
  
  private processBucketCollisions(bucket: CollisionBucket) {
    const snakeEntries = Array.from(this.snakeLogics.entries());
    
    for (let i = 0; i < snakeEntries.length; i++) {
      const [playerId, snakeLogic] = snakeEntries[i];
      if (!snakeLogic.player.alive) continue;
      
      // Get collision candidates from spatial grid (NOT all snakes)
      const nearbyIds = this.spatialGrid.query(
        snakeLogic.player.x,
        snakeLogic.player.y,
        snakeLogic.player.boundingRadius * 3
      );
      
      // 1. Check food collisions (optimized with grid)
      this.checkFoodCollisionsOptimized(snakeLogic);
      
      // 2. Check snake collisions with nearby snakes only
      for (const otherId of nearbyIds) {
        if (otherId === playerId) continue;
        
        const otherSnakeLogic = this.snakeLogics.get(otherId);
        if (!otherSnakeLogic?.player.alive) continue;
        
        // Quick distance check first
        const dx = snakeLogic.player.x - otherSnakeLogic.player.x;
        const dy = snakeLogic.player.y - otherSnakeLogic.player.y;
        const minDistance = snakeLogic.player.radius + otherSnakeLogic.player.radius;
        
        if (dx * dx + dy * dy > minDistance * minDistance * 9) { // 3x radius squared
          continue;
        }
        
        // Head-to-head collision
        if (checkCircleCollision(
          snakeLogic.player.x, snakeLogic.player.y, snakeLogic.player.radius,
          otherSnakeLogic.player.x, otherSnakeLogic.player.y, otherSnakeLogic.player.radius
        )) {
          this.handleDeath(snakeLogic, 'head_to_head');
          this.handleDeath(otherSnakeLogic, 'head_to_head');
          continue;
        }
        
        // Head-to-body collision with segment sampling
        if (this.checkHeadToBodyOptimized(snakeLogic, otherSnakeLogic)) {
          this.handleDeath(snakeLogic, 'head_to_body');
        }
      }
      
      // 3. Check self-collision (optimized)
      if (this.checkSelfCollisionOptimized(snakeLogic)) {
        this.handleDeath(snakeLogic, 'self_collision');
      }
    }
  }
  
  private checkFoodCollisionsOptimized(snakeLogic: SnakeLogic) {
    const headRadius = snakeLogic.player.radius;
    const cellX = Math.floor(snakeLogic.player.x / this.FOOD_CELL_SIZE);
    const cellY = Math.floor(snakeLogic.player.y / this.FOOD_CELL_SIZE);
    
    // Check 3x3 grid of food cells around snake
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const cellKey = `${cellX + dx},${cellY + dy}`;
        const foodIds = this.foodGrid.get(cellKey);
        
        if (foodIds) {
          for (const foodId of foodIds) {
            const food = this.gameState.food.get(foodId);
            if (!food) continue;
            
            if (checkCircleCollision(
              snakeLogic.player.x, snakeLogic.player.y, headRadius,
              food.x, food.y, PhysicsConfig.FOOD_RADIUS
            )) {
              this.consumeFood(snakeLogic, foodId, food);
              return; // Only consume one food per frame
            }
          }
        }
      }
    }
  }
  
  private checkHeadToBodyOptimized(headSnake: SnakeLogic, bodySnake: SnakeLogic): boolean {
    const headRadius = headSnake.player.radius;
    const bodySegments = bodySnake.getSegmentsForCollision();
    
    if (bodySegments.length === 0) return false;
    
    // Logarithmic sampling: Check fewer segments for longer snakes
    const sampleCount = Math.min(20, Math.max(3, Math.ceil(bodySegments.length / 50)));
    const step = Math.max(1, Math.floor(bodySegments.length / sampleCount));
    
    for (let i = 0; i < bodySegments.length; i += step) {
      const segment = bodySegments[i];
      const dx = headSnake.player.x - segment.x;
      const dy = headSnake.player.y - segment.y;
      const minDistance = headRadius + segment.radius;
      
      if (dx * dx + dy * dy < minDistance * minDistance) {
        return true;
      }
    }
    
    return false;
  }
  
  private checkSelfCollisionOptimized(snakeLogic: SnakeLogic): boolean {
    const headRadius = snakeLogic.player.radius;
    const segments = snakeLogic.getSegmentsForCollision();
    
    if (segments.length < 10) return false;
    
    // Only check segments after index 10 (skip head and neck)
    const startIndex = Math.min(10, Math.floor(segments.length * 0.2));
    
    for (let i = startIndex; i < segments.length; i += 3) { // Check every 3rd segment
      const segment = segments[i];
      const dx = snakeLogic.player.x - segment.x;
      const dy = snakeLogic.player.y - segment.y;
      const minDistance = headRadius + segment.radius;
      
      if (dx * dx + dy * dy < minDistance * minDistance * 0.8) {
        return true;
      }
    }
    
    return false;
  }
  
  private consumeFood(snakeLogic: SnakeLogic, foodId: string, food: Food) {
    snakeLogic.grow(food.value);
    snakeLogic.player.score += food.value;
    
    // Remove food from state and grid
    this.gameState.food.delete(foodId);
    this.removeFoodFromGrid(foodId, food.x, food.y);
    
    // Spawn new food if needed
    if (this.gameState.food.size < 500) {
      this.spawnFood(1);
    }
  }
  
  private updateFoodGrid() {
    this.foodGrid.clear();
    
    for (const [foodId, food] of this.gameState.food.entries()) {
      const cellX = Math.floor(food.x / this.FOOD_CELL_SIZE);
      const cellY = Math.floor(food.y / this.FOOD_CELL_SIZE);
      const cellKey = `${cellX},${cellY}`;
      
      if (!this.foodGrid.has(cellKey)) {
        this.foodGrid.set(cellKey, new Set());
      }
      
      this.foodGrid.get(cellKey)!.add(foodId);
    }
  }
  
  private removeFoodFromGrid(foodId: string, x: number, y: number) {
    const cellX = Math.floor(x / this.FOOD_CELL_SIZE);
    const cellY = Math.floor(y / this.FOOD_CELL_SIZE);
    const cellKey = `${cellX},${cellY}`;
    
    const foodSet = this.foodGrid.get(cellKey);
    if (foodSet) {
      foodSet.delete(foodId);
      if (foodSet.size === 0) {
        this.foodGrid.delete(cellKey);
      }
    }
  }
  
  private spawnFood(count: number = 1) {
    for (let i = 0; i < count; i++) {
      const food = new Food();
      let spawnX, spawnY;
      
      if (this.gameState.players.size > 0) {
        const players = Array.from(this.gameState.players.values());
        const randomPlayer = players[Math.floor(Math.random() * players.length)];
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 1000;
        
        spawnX = randomPlayer.x + Math.cos(angle) * distance;
        spawnY = randomPlayer.y + Math.sin(angle) * distance;
      } else {
        spawnX = (Math.random() - 0.5) * 10000;
        spawnY = (Math.random() - 0.5) * 10000;
      }
      
      food.x = spawnX;
      food.y = spawnY;
      food.value = PhysicsConfig.FOOD_VALUE;
      
      const foodId = `${Date.now()}-${i}`;
      this.gameState.food.set(foodId, food);
      
      // Add to grid immediately
      const cellX = Math.floor(spawnX / this.FOOD_CELL_SIZE);
      const cellY = Math.floor(spawnY / this.FOOD_CELL_SIZE);
      const cellKey = `${cellX},${cellY}`;
      
      if (!this.foodGrid.has(cellKey)) {
        this.foodGrid.set(cellKey, new Set());
      }
      
      this.foodGrid.get(cellKey)!.add(foodId);
    }
  }
  
  private handleDeath(snakeLogic: SnakeLogic, reason: string) {
    console.log(`Snake ${snakeLogic.player.id} died: ${reason}`);
    
    // Convert to food pellets
    const pelletsToCreate = Math.max(1, Math.floor(snakeLogic.player.mass * 0.4));
    
    for (let i = 0; i < pelletsToCreate; i++) {
      const food = new Food();
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 50;
      
      food.x = snakeLogic.player.x + Math.cos(angle) * distance;
      food.y = snakeLogic.player.y + Math.sin(angle) * distance;
      food.value = 1;
      
      const foodId = `dead_${snakeLogic.player.id}_${i}_${Date.now()}`;
      this.gameState.food.set(foodId, food);
      
      // Add to grid
      const cellX = Math.floor(food.x / this.FOOD_CELL_SIZE);
      const cellY = Math.floor(food.y / this.FOOD_CELL_SIZE);
      const cellKey = `${cellX},${cellY}`;
      
      if (!this.foodGrid.has(cellKey)) {
        this.foodGrid.set(cellKey, new Set());
      }
      
      this.foodGrid.get(cellKey)!.add(foodId);
    }
    
    // Respawn the snake
    snakeLogic.respawn();
  }
}