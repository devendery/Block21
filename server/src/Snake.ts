// server/src/Snake.ts - OPTIMIZED VERSION
import { Vector2, PhysicsConfig, normalize, angleDifference, checkCircleCollision, clamp, rotateTowards, wrapAngle, calculateSnakeRadius, calculateBoostDrain, calculateSnakeBoundingCircle } from './Physics';
import { Player, SnakeSegment } from './State';
import { SERVER_CONSTANTS } from './ServerConstants';

// === NEW: Compressed segment storage ===
interface ControlPoint {
  x: number;
  y: number;
  timestamp: number;
  segmentIndex: number;
}

export class SnakeLogic {
  player: Player;
  
  // === REPLACE internalSegments with compressed storage ===
  private controlPoints: ControlPoint[] = []; // Store only every 10th segment
  private virtualSegmentCount: number = SERVER_CONSTANTS.SNAKE_INITIAL_SEGMENTS;   // Track total segments
  private lastControlPointTime: number = 0;
  private readonly CONTROL_POINT_INTERVAL = SERVER_CONSTANTS.SNAKE_CONTROL_POINT_INTERVAL; // Add control point every 10 segments
  
  private headHistory: { x: number; y: number; angle: number }[] = [];
  private simplifiedCollisionSegments: {x: number, y: number, radius: number}[] = [];
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
    
    // Store room reference for dynamic boundary calculations
    this.room = room;
    
    this.dirX = Math.cos(player.angle);
    this.dirY = Math.sin(player.angle);
    
    // Initialize with first control point
    this.controlPoints.push({
      x: player.x,
      y: player.y,
      timestamp: Date.now(),
      segmentIndex: 0
    });
    
    // Initialize simplified segments
    this.updateSimplifiedSegments();
  }

  getDirectionVector(): Vector2 {
    return { x: this.dirX, y: this.dirY };
  }

  initSegments() {
    // Initialize minimal segments for new snake
    this.virtualSegmentCount = SERVER_CONSTANTS.SNAKE_INITIAL_SEGMENTS;
    this.player.length = this.virtualSegmentCount;
    this.updatePlayerRadius();
    this.updateBoundingRadius();
    
    // Clear and create initial simplified segments
    this.simplifiedCollisionSegments = [];
    for (let i = 0; i < SERVER_CONSTANTS.SNAKE_INITIAL_COLLISION_SEGMENTS; i++) {
      const backOffset =
        (i + 1) *
        PhysicsConfig.SEGMENT_DISTANCE *
        SERVER_CONSTANTS.SNAKE_COLLISION_SEGMENT_SPACING_MULTIPLIER;
      this.simplifiedCollisionSegments.push({
        x: this.player.x - (backOffset * this.dirX),
        y: this.player.y - (backOffset * this.dirY),
        radius: calculateSnakeRadius(i + 1)
      });
    }
    
    // Sync to client segments
    this.player.segments.clear();
    const segmentsToSync = Math.min(
      SERVER_CONSTANTS.SNAKE_INITIAL_SEGMENTS,
      this.virtualSegmentCount
    );
    for (let i = 0; i < segmentsToSync; i++) {
      const seg = new SnakeSegment();
      const backOffset = (i + 1) * PhysicsConfig.SEGMENT_DISTANCE;
      seg.x = this.player.x - backOffset * this.dirX;
      seg.y = this.player.y - backOffset * this.dirY;
      this.player.segments.push(seg);
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
    
    if (lenSq > 0.0001) {
      const targetAngle = Math.atan2(inputVector.y, inputVector.x);
      const currentAngle = Math.atan2(this.dirY, this.dirX);
      const diff = angleDifference(currentAngle, targetAngle);
      const maxTurn = PhysicsConfig.TURN_SPEED * fixedDt;
      
      let newAngle = currentAngle;
      if (Math.abs(diff) < maxTurn) {
        newAngle = targetAngle;
      } else {
        newAngle += Math.sign(diff) * maxTurn;
      }
      
      this.dirX = Math.cos(newAngle);
      this.dirY = Math.sin(newAngle);
      this.player.angle = newAngle;
    }
    
    // Move forward
    const moveDist = this.player.speed * fixedDt;
    this.player.x += this.dirX * moveDist;
    this.player.y += this.dirY * moveDist;

    // Boundary collision detection
    this.checkBoundaryCollision();

    // Add to head history
    this.headHistory.unshift({ 
      x: this.player.x, 
      y: this.player.y, 
      angle: this.player.angle 
    });
    
    // Trim history
    if (this.headHistory.length > SERVER_CONSTANTS.SNAKE_HEAD_HISTORY_MAX) {
      this.headHistory.length = SERVER_CONSTANTS.SNAKE_HEAD_HISTORY_MAX;
    }
    
    // Add control point periodically
    if (this.virtualSegmentCount >= this.controlPoints.length * this.CONTROL_POINT_INTERVAL) {
      this.controlPoints.push({
        x: this.player.x,
        y: this.player.y,
        timestamp: Date.now(),
        segmentIndex: this.virtualSegmentCount
      });
      
      // Keep only recent control points
      if (this.controlPoints.length > SERVER_CONSTANTS.SNAKE_MAX_CONTROL_POINTS) {
        this.controlPoints.shift();
      }
    }
    
    // Update simplified segments periodically
    const now = Date.now();
    if (now - this.lastSimplificationTime > this.SIMPLIFICATION_INTERVAL) {
      this.updateSimplifiedSegments();
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
    const oldRadius = this.player.radius;
    const calculatedRadius = calculateSnakeRadius(this.player.mass);
    console.log(`DEBUG: updatePlayerRadius() - mass: ${this.player.mass}, calculated: ${calculatedRadius}, old: ${oldRadius}`);
    
    this.player.radius = calculatedRadius;
    if (this.player.radius !== oldRadius) {
      console.log(`Snake ${this.player.name} radius changed: ${oldRadius} -> ${this.player.radius} (mass: ${this.player.mass})`);
    }
  }
  
  private updateBoundingRadius() {
    // Larger snakes have larger collision bounds
    const sizeFactor = Math.min(
      SERVER_CONSTANTS.SNAKE_BOUNDING_SIZE_FACTOR_MAX,
      this.virtualSegmentCount / SERVER_CONSTANTS.SNAKE_BOUNDING_SIZE_FACTOR_DIVISOR
    );
    this.player.boundingRadius = this.player.radius * (1 + sizeFactor);
  }

  // === OPTIMIZED: Generate simplified segments for collision ===
  private updateSimplifiedSegments() {
    this.simplifiedCollisionSegments = [];
    const segmentsNeeded = Math.min(
      SERVER_CONSTANTS.SNAKE_SIMPLIFIED_SEGMENTS_MAX,
      Math.max(
        SERVER_CONSTANTS.SNAKE_SIMPLIFIED_SEGMENTS_MIN,
        Math.ceil(this.virtualSegmentCount / SERVER_CONSTANTS.SNAKE_SIMPLIFIED_SEGMENTS_DIVISOR)
      )
    );
    
    // Always include head
    this.simplifiedCollisionSegments.push({
      x: this.player.x,
      y: this.player.y,
      radius: this.player.radius
    });
    
    // Generate intermediate points from control points
    for (let i = 1; i < segmentsNeeded - 1; i++) {
      const t = i / (segmentsNeeded - 1);
      const targetIndex = Math.floor(t * (this.controlPoints.length - 1));
      
      if (this.controlPoints[targetIndex]) {
        const cp = this.controlPoints[targetIndex];
        const segmentRadius = calculateSnakeRadius(
          Math.floor(this.player.mass * (1 - t)) // Mass decreases towards tail
        );
        
        this.simplifiedCollisionSegments.push({
          x: cp.x,
          y: cp.y,
          radius: segmentRadius
        });
      }
    }
    
    // Always include tail (last control point or estimated)
    if (this.controlPoints.length > 0) {
      const lastCp = this.controlPoints[this.controlPoints.length - 1];
      const tailRadius = calculateSnakeRadius(this.player.mass);
      
      this.simplifiedCollisionSegments.push({
        x: lastCp.x,
        y: lastCp.y,
        radius: tailRadius * SERVER_CONSTANTS.SNAKE_TAIL_RADIUS_FACTOR
      });
    }
    
    // Update player's simplified segments for spatial queries
  }

  grow(amount: number = 1) {
    const oldMass = this.player.mass;
    this.player.mass += amount;
    console.log(`DEBUG: grow() - amount: ${amount}, old mass: ${oldMass}, new mass: ${this.player.mass}`);
    const addSegments = Math.max(0, Math.floor(amount));
    if (addSegments === 0) return;
    this.virtualSegmentCount += addSegments;
    this.player.length = this.virtualSegmentCount;
    this.updatePlayerRadius();
    
    // Only update client segments occasionally for long snakes
    if (
      this.virtualSegmentCount < SERVER_CONSTANTS.SNAKE_CLIENT_SYNC_ALWAYS_BELOW ||
      this.virtualSegmentCount % SERVER_CONSTANTS.SNAKE_CLIENT_SYNC_EVERY_N === 0
    ) {
      this.syncSegmentsToClient();
    }
  }

  shrink(amount: number = 1): {x: number, y: number} | null {
    if (this.virtualSegmentCount <= SERVER_CONSTANTS.SNAKE_MIN_SEGMENTS) return null;
    
    const removeSegments = Math.min(
      Math.max(0, Math.floor(amount)),
      this.virtualSegmentCount - SERVER_CONSTANTS.SNAKE_MIN_SEGMENTS
    );
    if (removeSegments === 0) return null;
    this.virtualSegmentCount -= removeSegments;
    this.player.length = this.virtualSegmentCount;
    this.player.score = Math.max(0, this.player.score - removeSegments);
    
    this.updatePlayerRadius();
    
    // Remove old control points if needed
    const minSegmentIndex = this.virtualSegmentCount - SERVER_CONSTANTS.SNAKE_HEAD_HISTORY_MAX;
    this.controlPoints = this.controlPoints.filter(cp => cp.segmentIndex >= minSegmentIndex);
    
    return { x: this.player.x, y: this.player.y };
  }

  // === OPTIMIZED: Return simplified segments for collision ===
  getSegmentsForCollision() {
    return this.simplifiedCollisionSegments;
  }
  
  // For LOD rendering
  getSegmentsForLOD(distance: number): {x: number, y: number, radius: number}[] {
    const segments = this.simplifiedCollisionSegments;
    
    // Further reduce detail for distant snakes
    if (distance > SERVER_CONSTANTS.SNAKE_LOD_HALF_DETAIL_DISTANCE) {
      return segments.filter((_, i) => i % SERVER_CONSTANTS.SNAKE_LOD_HALF_DETAIL_STEP === 0);
    }
    
    return segments;
  }
  
  // Get bounding circle for broad-phase collision
  getBoundingCircle() {
    return calculateSnakeBoundingCircle(
      this.player.x,
      this.player.y,
      this.virtualSegmentCount,
      this.player.radius
    );
  }

  private syncSegmentsToClient() {
    // Only sync limited segments to client
    const baseSyncCount = 20;
    const lengthFactor = Math.min(3, this.virtualSegmentCount / 1000);
    const desiredSyncCount =
      this.virtualSegmentCount < baseSyncCount
        ? this.virtualSegmentCount
        : Math.ceil(baseSyncCount * (1 + lengthFactor));
    const segmentsToSync = Math.min(
      SERVER_CONSTANTS.SNAKE_CLIENT_SYNC_MAX_SEGMENTS,
      Math.max(SERVER_CONSTANTS.SNAKE_CLIENT_SYNC_MIN_SEGMENTS, desiredSyncCount)
    );
    const denom = Math.max(1, segmentsToSync - 1);
    
    this.player.segments.clear();
    for (let i = 0; i < segmentsToSync; i++) {
      const t = i / denom;
      const segIndex = Math.floor(t * (this.simplifiedCollisionSegments.length - 1));
      const source = this.simplifiedCollisionSegments[segIndex] || this.simplifiedCollisionSegments[0];
      
      const seg = new SnakeSegment();
      seg.x = source.x;
      seg.y = source.y;
      this.player.segments.push(seg);
    }
  }

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
    this.controlPoints = [{
      x: this.player.x,
      y: this.player.y,
      timestamp: Date.now(),
      segmentIndex: 0
    }];
    
    this.headHistory = [];
    this.isBoosting = false;
    this.accumulatedBoostTime = 0;
    this.player.segments.clear();
    this.initSegments();
  }
}
