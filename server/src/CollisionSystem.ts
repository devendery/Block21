// server/src/CollisionSystem.ts - OPTIMIZED VERSION
import { PhysicsConfig, checkCircleCollision } from './Physics';
import { GameState, Food } from './State';
import { SnakeLogic } from './Snake';

// === NEW: Segment Bucket System ===
class SegmentBucket {
  private segments: Array<{ ownerId: string; x: number; y: number; radius: number }> = [];
  addSegment(ownerId: string, x: number, y: number, radius: number) {
    this.segments.push({ ownerId, x, y, radius });
  }
  getEntries(): Array<{ ownerId: string; x: number; y: number; radius: number }> {
    return this.segments;
  }
  isEmpty(): boolean {
    return this.segments.length === 0;
  }
}

export class CollisionSystem {
  private gameState: GameState;
  private snakeLogics: Map<string, SnakeLogic> = new Map();
  
  // === NEW: Optimized data structures ===
  private readonly BUCKET_SIZE = 50; // Increased to 50 as requested
  private readonly COLLISION_SEGMENT_RADIUS = 10; // Consistent segment radius
  private foodGrid: Map<string, Set<string>> = new Map(); // cellKey -> foodIds
  private readonly FOOD_CELL_SIZE = 500;
  private readonly TOI_EPS = 1e-6;
  private lastCollisionSegmentsLogAt = 0;
  
  constructor(gameState: GameState) {
    this.gameState = gameState;
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
    this.updateFoodGrid();

    const toKill = new Set<string>();
    this.processCollisionsByBucket(toKill);

    if (this.snakeLogics.size > 0 && Date.now() - this.lastCollisionSegmentsLogAt > 2000) {
      // console.log(`[CollisionSystem] Tracking ${this.snakeLogics.size} snakes`);
    }

    for (const id of toKill) {
      const snakeLogic = this.snakeLogics.get(id);
      if (!snakeLogic?.player.alive) continue;
      this.handleDeath(snakeLogic, 'pvp_toi');
    }
  }

  private processCollisionsByBucket(toKill: Set<string>) {
    const bucketMap = new Map<string, SegmentBucket>();
    let totalSegmentsInserted = 0;

    // Insert each collision segment into buckets
    for (const [playerId, snakeLogic] of this.snakeLogics.entries()) {
      if (!snakeLogic.player.alive) continue;
      if (!snakeLogic.collisionSegments) continue; // Null check as requested

      const segments = snakeLogic.collisionSegments;
      for (let i = 0; i < segments.length; i++) {
        const s = segments[i];
        const bucketX = Math.floor(s.x / this.BUCKET_SIZE);
        const bucketY = Math.floor(s.y / this.BUCKET_SIZE);
        const bucketKey = `${bucketX},${bucketY}`;
        if (!bucketMap.has(bucketKey)) {
          bucketMap.set(bucketKey, new SegmentBucket());
        }
        // Use COLLISION_SEGMENT_RADIUS consistently
        bucketMap.get(bucketKey)!.addSegment(playerId, s.x, s.y, this.COLLISION_SEGMENT_RADIUS);
        totalSegmentsInserted++;
      }
    }

    if (totalSegmentsInserted > 0 && Date.now() - this.lastCollisionSegmentsLogAt > 2000) {
      // console.log(`[CollisionSystem] Bucketed ${totalSegmentsInserted} segments across ${bucketMap.size} cells`);
    }

    // Build candidate snake pairs from head vs nearby segments
    const candidatePairs = new Set<string>(); // "aId|bId" sorted
    let pairsChecked = 0;

    for (const [playerId, snakeLogic] of this.snakeLogics.entries()) {
      if (!snakeLogic.player.alive) continue;
      const headX = snakeLogic.player.x;
      const headY = snakeLogic.player.y;
      const headRadius = snakeLogic.player.radius;
      const hx = Math.floor(headX / this.BUCKET_SIZE);
      const hy = Math.floor(headY / this.BUCKET_SIZE);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const nbx = hx + dx;
          const nby = hy + dy;
          const neighborKey = `${nbx},${nby}`;
          const bucket = bucketMap.get(neighborKey);
          if (!bucket) continue;
          for (const entry of bucket.getEntries()) {
            if (entry.ownerId === playerId) continue; // Self-collision filtering
            
            // Optional fine broad-phase: head vs segment proximity
            const ddx = headX - entry.x;
            const ddy = headY - entry.y;
            // Use COLLISION_SEGMENT_RADIUS consistently for proximity check
            const radSum = headRadius + this.COLLISION_SEGMENT_RADIUS;
            if (ddx * ddx + ddy * ddy > radSum * radSum) continue;
            
            const a = playerId < entry.ownerId ? playerId : entry.ownerId;
            const b = playerId < entry.ownerId ? entry.ownerId : playerId;
            candidatePairs.add(`${a}|${b}`);
            pairsChecked++;
          }
        }
      }
    }

    if (candidatePairs.size > 0 && Date.now() - this.lastCollisionSegmentsLogAt > 2000) {
      // console.log(`[CollisionSystem] Found ${candidatePairs.size} candidate pairs to evaluate`);
      this.lastCollisionSegmentsLogAt = Date.now();
    }

    // Evaluate candidate pairs via sweep TOI
    for (const key of candidatePairs) {
      const [aId, bId] = key.split("|");
      const aSnake = this.snakeLogics.get(aId);
      const bSnake = this.snakeLogics.get(bId);
      if (!aSnake || !bSnake) continue;
      this.processPair(aId, aSnake, bId, bSnake, toKill);
    }

    for (const [playerId, snakeLogic] of this.snakeLogics.entries()) {
      if (!snakeLogic.player.alive) continue;
      if (toKill.has(playerId)) continue;
      this.checkFoodCollisionsOptimized(snakeLogic);
    }
  }

  private processPair(
    aId: string,
    aSnake: SnakeLogic,
    bId: string,
    bSnake: SnakeLogic,
    toKill: Set<string>
  ) {
    if (aId === bId) return;
    if (toKill.has(aId) || toKill.has(bId)) return;
    if (!aSnake.player.alive || !bSnake.player.alive) return;

    const tA = this.sweepHeadVsChain(aSnake, bSnake);
    const tB = this.sweepHeadVsChain(bSnake, aSnake);

    if (!Number.isFinite(tA) && !Number.isFinite(tB)) return;

    if (tA + this.TOI_EPS < tB) {
      // console.log(`[Collision] Snake ${aId} killed by ${bId} (tA=${tA.toFixed(4)}, tB=${tB.toFixed(4)})`);
      toKill.add(aId);
      return;
    }

    if (tB + this.TOI_EPS < tA) {
      // console.log(`[Collision] Snake ${bId} killed by ${aId} (tA=${tA.toFixed(4)}, tB=${tB.toFixed(4)})`);
      toKill.add(bId);
      return;
    }

    if (Number.isFinite(tA) && Number.isFinite(tB)) {
      // console.log(`[Collision] Double kill: ${aId} and ${bId} (tA=${tA.toFixed(4)}, tB=${tB.toFixed(4)})`);
      toKill.add(aId);
      toKill.add(bId);
    }
  }

  private sweepHeadVsChain(attacker: SnakeLogic, defender: SnakeLogic): number {
    const ax0 = attacker.prevHeadX;
    const ay0 = attacker.prevHeadY;
    const ax1 = attacker.player.x;
    const ay1 = attacker.player.y;

    const headRadius = attacker.player.radius;
    const segments = defender.collisionSegments;
    
    if (!segments || segments.length === 0) return Infinity;

    const skip = attacker === defender ? 6 : 0;
    let earliest = Infinity;

    for (let i = skip; i < segments.length; i++) {
      const s = segments[i];
      // Use COLLISION_SEGMENT_RADIUS consistently
      const t = this.segmentSweep(ax0, ay0, ax1, ay1, s.x, s.y, headRadius + this.COLLISION_SEGMENT_RADIUS);
      if (t < earliest) earliest = t;
    }

    return earliest;
  }

  private segmentSweep(
    ax0: number,
    ay0: number,
    ax1: number,
    ay1: number,
    cx: number,
    cy: number,
    radius: number
  ): number {
    const vx = ax1 - ax0;
    const vy = ay1 - ay0;

    const dx = ax0 - cx;
    const dy = ay0 - cy;

    const a = vx * vx + vy * vy;
    const b = 2 * (dx * vx + dy * vy);
    const c = dx * dx + dy * dy - radius * radius;

    const disc = b * b - 4 * a * c;

    if (disc < 0 || a === 0) return Infinity;

    const sqrt = Math.sqrt(disc);
    const t1 = (-b - sqrt) / (2 * a);
    const t2 = (-b + sqrt) / (2 * a);

    if (t1 >= 0 && t1 <= 1) return t1;
    if (t2 >= 0 && t2 <= 1) return t2;

    return Infinity;
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
  
  private consumeFood(snakeLogic: SnakeLogic, foodId: string, food: Food) {
    snakeLogic.grow(food.value);
    snakeLogic.player.score += food.value;
    
    // Remove food from state and grid
    this.gameState.food.delete(foodId);
    this.removeFoodFromGrid(foodId, food.x, food.y);
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
  
  private handleDeath(snakeLogic: SnakeLogic, reason: string) {
    console.log(`Snake ${snakeLogic.player.id} died: ${reason}`);
    
    // Convert to food pellets
    const pelletsToCreate = Math.max(1, Math.floor(snakeLogic.player.mass * 0.4));

    const segments = snakeLogic.getSegmentsForCollision();
    let created = 0;

    if (segments.length > 0) {
      for (let i = 0; i < segments.length && created < pelletsToCreate; i += 3) {
        const p = segments[i];
        const food = new Food();

        food.x = p.x + (Math.random() * 10 - 5);
        food.y = p.y + (Math.random() * 10 - 5);
        food.value = 1;

        const foodId = `dead_${snakeLogic.player.id}_${created}_${Date.now()}`;
        this.gameState.food.set(foodId, food);

        const cellX = Math.floor(food.x / this.FOOD_CELL_SIZE);
        const cellY = Math.floor(food.y / this.FOOD_CELL_SIZE);
        const cellKey = `${cellX},${cellY}`;

        if (!this.foodGrid.has(cellKey)) {
          this.foodGrid.set(cellKey, new Set());
        }

        this.foodGrid.get(cellKey)!.add(foodId);
        created++;
      }
    }

    while (created < pelletsToCreate) {
      const food = new Food();
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 50;

      food.x = snakeLogic.player.x + Math.cos(angle) * distance;
      food.y = snakeLogic.player.y + Math.sin(angle) * distance;
      food.value = 1;

      const foodId = `dead_${snakeLogic.player.id}_${created}_${Date.now()}`;
      this.gameState.food.set(foodId, food);

      const cellX = Math.floor(food.x / this.FOOD_CELL_SIZE);
      const cellY = Math.floor(food.y / this.FOOD_CELL_SIZE);
      const cellKey = `${cellX},${cellY}`;

      if (!this.foodGrid.has(cellKey)) {
        this.foodGrid.set(cellKey, new Set());
      }

      this.foodGrid.get(cellKey)!.add(foodId);
      created++;
    }
    
    // Respawn the snake
    snakeLogic.respawn();
  }
}
