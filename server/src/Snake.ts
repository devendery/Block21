// server/src/Snake.ts - OPTIMIZED VERSION
import { Vector2, PhysicsConfig, normalize, angleDifference, checkCircleCollision, clamp, rotateTowards, wrapAngle, calculateSnakeRadius, calculateBoostDrain, calculateSnakeBoundingCircle } from './Physics';
import { Player } from './State';
import { SERVER_CONSTANTS } from './ServerConstants';
import { World } from "../../lib/game/core/World";

// === ECS-only: Legacy compressed segment storage removed

export class SnakeLogic {
  player: Player;
  ecsId: number = -1;
  public prevHeadX: number;
  public prevHeadY: number;
  
  // === ECS-only: track count, no legacy path/collision arrays ===
  private virtualSegmentCount: number = SERVER_CONSTANTS.SNAKE_INITIAL_SEGMENTS;
  private massBank: number = 0;
  private readonly baseMassPerSegment: number = 2;
  private readonly growthFactor: number = 0.05;
  
  private lastSimplificationTime: number = 0;
  private readonly SIMPLIFICATION_INTERVAL = SERVER_CONSTANTS.SNAKE_SIMPLIFICATION_INTERVAL_MS; // ms
  
  // Direction
  private dirX: number = 1;
  private dirY: number = 0;
  
  // Room reference for dynamic boundary
  private room?: any;
  
  // Boost tracking
  private boostStartTime: number = 0;
  private isBoosting: boolean = false;
  private accumulatedBoostTime: number = 0;
  public lastInput: { vector: Vector2, boost: boolean } | null = null;

  constructor(player: Player, room?: any) {
    this.player = player;
    this.player.speed = PhysicsConfig.BASE_SPEED;
    this.prevHeadX = player.x;
    this.prevHeadY = player.y;
    
    // Store room reference for dynamic boundary calculations
    this.room = room;
    
    this.dirX = Math.cos(player.angle);
    this.dirY = Math.sin(player.angle);
    
    // Legacy client segment sync removed

    this.ecsId = World.snakeCount++;
    console.log("snake ecsId:", this.ecsId);
    const id = this.ecsId;
    World.snakePosX[id] = player.x;
    World.snakePosY[id] = player.y;
    World.snakeVelX[id] = 0;
    World.snakeVelY[id] = 0;
    World.snakeRadius[id] = player.radius;
    World.snakeAlive[id] = 1;
    World.lastSegmentIndex[id] = -1;
    World.segmentHead[id] = 0;
    World.segmentTail[id] = 0;
    World.segmentLength[id] = 0;
    this.syncEcsLength();
  }

  getDirectionVector(): Vector2 {
    return { x: this.dirX, y: this.dirY };
  }

  initSegments() {
    const initialMass = 20;
    this.player.mass = initialMass;
    this.massBank = 0;
    this.virtualSegmentCount = Math.max(1, Math.floor(initialMass / this.baseMassPerSegment));
    this.player.length = this.virtualSegmentCount;
    this.updatePlayerRadius();
    this.updateBoundingRadius();
    this.syncEcsLength();
  }

  private massPerSegment(segmentCount: number): number {
    return this.baseMassPerSegment + segmentCount * this.growthFactor;
  }

  applyFoodReward(points: number, foodMass: number) {
    if (points > 0) {
      this.player.score += points;
    }

    if (!(foodMass > 0)) return;

    this.player.mass += foodMass;
    this.massBank += foodMass;

    let guard = 0;
    while (this.massBank >= this.massPerSegment(this.virtualSegmentCount) && guard < 100000) {
      this.massBank -= this.massPerSegment(this.virtualSegmentCount);
      this.grow(1);
      guard += 1;
    }
  }

  update(dt: number, input: { vector: Vector2, boost: boolean }) {
    if (!this.player.alive) return;

    // Handle boost
    const canBoost = input.boost && this.virtualSegmentCount > 10;
    if (canBoost && !this.isBoosting) {
      this.boostStartTime = Date.now();
      this.isBoosting = true;
    } else if (!canBoost && this.isBoosting) {
      this.isBoosting = false;
      this.applyBoostMassDrain();
    }
    
    this.player.isBoosting = canBoost;
    this.player.speed = canBoost ? PhysicsConfig.BOOST_SPEED : PhysicsConfig.BASE_SPEED;
    
    if (this.isBoosting) {
      this.accumulatedBoostTime += dt;
    }
    
    const fixedDt = 1 / SERVER_CONSTANTS.TICK_RATE;

    // Update direction
    const inputVector = input.vector;
    const lenSq = inputVector.x * inputVector.x + inputVector.y * inputVector.y;
    
    if (!Number.isFinite(this.player.angle)) {
      this.player.angle = -Math.PI / 2;
    }

    if (!Number.isFinite(this.dirX) || !Number.isFinite(this.dirY) || (this.dirX * this.dirX + this.dirY * this.dirY) < 1e-6) {
      this.dirX = Math.cos(this.player.angle);
      this.dirY = Math.sin(this.player.angle);
    }

    if (lenSq > 0.0001) {
      const targetAngle = Math.atan2(inputVector.y, inputVector.x);
      const currentAngle = Math.atan2(this.dirY, this.dirX);
      const diff = angleDifference(currentAngle, targetAngle);

      if (process.env.BLOCK21_DEBUG_TURN && Math.abs(diff) > 3) {
        console.log(
          `[TURN DEBUG] current=${currentAngle.toFixed(2)} target=${targetAngle.toFixed(2)} diff=${diff.toFixed(2)} boost=${canBoost ? 1 : 0}`
        );
      }

      const maxTurn = PhysicsConfig.TURN_SPEED * fixedDt;
      const turnStep = Math.sign(diff) * Math.min(maxTurn, Math.abs(diff));
      const newAngle = wrapAngle(currentAngle + turnStep);
      
      this.dirX = Math.cos(newAngle);
      this.dirY = Math.sin(newAngle);
      this.player.angle = newAngle;
    }
    
    const arenaRadius = this.room?.getArenaRadius?.();
    const center = this.room?.getArenaCenter?.() ?? { x: 0, y: 0 };
    let edgeSpeedFactor = 1;
    if (typeof arenaRadius === "number") {
      const distX = this.player.x - center.x;
      const distY = this.player.y - center.y;
      const dist = Math.sqrt(distX * distX + distY * distY);
      if (dist > arenaRadius * SERVER_CONSTANTS.ARENA_EDGE_START_RATIO) {
        edgeSpeedFactor = SERVER_CONSTANTS.ARENA_EDGE_SPEED_FACTOR;
      }
    }

    const moveDist = this.player.speed * fixedDt * edgeSpeedFactor;
    {
      const id = this.ecsId;
      if (id >= 0) {
        let vx = this.dirX * moveDist;
        let vy = this.dirY * moveDist;
        if (!Number.isFinite(vx) || !Number.isFinite(vy) || (moveDist > 0.1 && (vx * vx + vy * vy) < (moveDist * moveDist) * 0.01)) {
          this.dirX = Math.cos(this.player.angle);
          this.dirY = Math.sin(this.player.angle);
          vx = this.dirX * moveDist;
          vy = this.dirY * moveDist;
        }

        World.snakeVelX[id] = vx;
        World.snakeVelY[id] = vy;
        World.snakeAngle[id] = this.player.angle;
        World.snakeSpeed[id] = this.player.speed;
        World.snakeRadius[id] = this.player.radius;
      }
    }

    const now = Date.now();
    if (now - this.lastSimplificationTime > this.SIMPLIFICATION_INTERVAL) {
      this.lastSimplificationTime = now;
    }
    
    // Update bounding radius
    this.updateBoundingRadius();
  }

  private applyBoostMassDrain() {
    if (this.accumulatedBoostTime > 0) {
      const segmentsToDrain = calculateBoostDrain(this.accumulatedBoostTime);
      this.shrink(segmentsToDrain);
      this.accumulatedBoostTime = 0;
    }
  }

  private updatePlayerRadius() {
    this.player.radius = PhysicsConfig.BASE_RADIUS;
  }

  private syncEcsLength() {
    const id = this.ecsId;
    if (id < 0) return;
    World.snakeLength[id] = Math.max(0, this.virtualSegmentCount - 1) * PhysicsConfig.SEGMENT_DISTANCE;
  }
  
  private updateBoundingRadius() {
    // Larger snakes have larger collision bounds
    const sizeFactor = Math.min(
      SERVER_CONSTANTS.SNAKE_BOUNDING_SIZE_FACTOR_MAX,
      this.virtualSegmentCount / SERVER_CONSTANTS.SNAKE_BOUNDING_SIZE_FACTOR_DIVISOR
    );
    this.player.boundingRadius = this.player.radius * (1 + sizeFactor);
  }

  // Legacy collision chain removed

  grow(amount: number = 1) {
    const addSegments = Math.max(0, Math.floor(amount));
    if (addSegments === 0) return;
    this.virtualSegmentCount += addSegments;
    this.player.length = this.virtualSegmentCount;
    this.updatePlayerRadius();
    this.syncEcsLength();
    
    // Client segment sync removed
  }

  shrink(amount: number = 1): {x: number, y: number} | null {
    if (this.virtualSegmentCount <= SERVER_CONSTANTS.SNAKE_MIN_SEGMENTS) return null;
    
    const removeSegments = Math.min(
      Math.max(0, Math.floor(amount)),
      this.virtualSegmentCount - SERVER_CONSTANTS.SNAKE_MIN_SEGMENTS
    );
    if (removeSegments === 0) return null;

    for (let i = 0; i < removeSegments; i++) {
      const segIndex = this.virtualSegmentCount - 1 - i;
      const cost = this.massPerSegment(segIndex);
      this.player.mass = Math.max(0, this.player.mass - cost);
    }
    if (this.massBank > this.player.mass) this.massBank = this.player.mass;

    this.virtualSegmentCount -= removeSegments;
    this.player.length = this.virtualSegmentCount;
    this.player.score = Math.max(0, this.player.score - removeSegments);
    
    this.updatePlayerRadius();
    this.syncEcsLength();
    
    // Legacy control point filtering removed
    
    return { x: this.player.x, y: this.player.y };
  }

  // Legacy getters removed
  
  // Get bounding circle for broad-phase collision
  getBoundingCircle() {
    const radius = this.virtualSegmentCount + this.player.radius;
    return {
      x: this.player.x,
      y: this.player.y,
      radius,
      entityId: ''
    };
  }

  // Legacy client segment sync removed

  private checkBoundaryCollision() {
    // DYNAMIC BOUNDARY: Scale with average player size
    const averageMass = this.calculateAveragePlayerMass();
    const dynamicBoundary = this.calculateDynamicBoundary(averageMass);
    
    const boundaryMargin = this.player.boundingRadius || this.player.radius * 2;
    
    // Check if snake is outside dynamic boundaries with margin
    if (Math.abs(this.player.x) > dynamicBoundary - boundaryMargin) {
      // Bounce off X boundary
      this.player.x = Math.sign(this.player.x) * (dynamicBoundary - boundaryMargin);
      
      // Reverse X direction for bounce effect
      this.dirX = -this.dirX;
      this.player.angle = Math.atan2(this.dirY, this.dirX);
      
      // Small penalty for hitting boundary
      this.player.mass = Math.max(0, this.player.mass - 10);
      this.massBank = Math.max(0, this.massBank - 10);
      this.updatePlayerRadius();
    }
    
    if (Math.abs(this.player.y) > dynamicBoundary - boundaryMargin) {
      // Bounce off Y boundary
      this.player.y = Math.sign(this.player.y) * (dynamicBoundary - boundaryMargin);
      
      // Reverse Y direction for bounce effect
      this.dirY = -this.dirY;
      this.player.angle = Math.atan2(this.dirY, this.dirX);
      
      // Small penalty for hitting boundary
      this.player.mass = Math.max(0, this.player.mass - 10);
      this.massBank = Math.max(0, this.massBank - 10);
      this.updatePlayerRadius();
    }
  }

  private calculateAveragePlayerMass(): number {
    if (!this.room) return this.player.mass;
    
    // Get all players from the room state
    const allPlayers = Array.from(this.room.state.players.values());
    if (allPlayers.length === 0) return this.player.mass;
    
    const totalMass = allPlayers.reduce((sum: number, p: any) => sum + p.mass, 0);
    return totalMass / allPlayers.length;
  }

  private calculateDynamicBoundary(averageMass: number): number {
    // DEVELOPMENT: Start with very small boundary (1000 units)
    const DEV_BASE_BOUNDARY = 1000;
    const BASE_BOUNDARY = PhysicsConfig.UNIVERSE_LIMIT;
    const MAX_BOUNDARY = BASE_BOUNDARY * 3; // Maximum 3x expansion
    
    // Scale boundary based on average mass (more mass = larger world)
    const massScale = Math.min(3, 1 + (averageMass / 500)); // Faster scaling for development
    const dynamicBoundary = DEV_BASE_BOUNDARY * massScale;
    
    return Math.min(MAX_BOUNDARY, Math.max(DEV_BASE_BOUNDARY, dynamicBoundary));
  }

  respawn() {
    this.player.alive = true;
    this.player.x = (Math.random() - 0.5) * SERVER_CONSTANTS.PLAYER_SPAWN_RANGE;
    this.player.y = (Math.random() - 0.5) * SERVER_CONSTANTS.PLAYER_SPAWN_RANGE;
    this.player.angle = -Math.PI / 2;
    this.dirX = Math.cos(this.player.angle);
    this.dirY = Math.sin(this.player.angle);
    this.player.mass = 0;
    this.player.score = 0;
    this.player.isBoosting = false;
    this.player.speed = PhysicsConfig.BASE_SPEED;
    
    // Reset to minimal snake
    this.lastInput = null;
    this.virtualSegmentCount = SERVER_CONSTANTS.SNAKE_INITIAL_SEGMENTS;
    this.player.length = this.virtualSegmentCount;
    // Legacy control points and history removed
    this.isBoosting = false;
    this.accumulatedBoostTime = 0;
    this.massBank = 0;
    this.syncEcsLength();
    this.initSegments();
  }
}
