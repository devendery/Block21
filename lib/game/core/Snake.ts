// server/src/Snake.ts
import { Vector2, PhysicsConfig, normalize, angleDifference, checkCircleCollision, clamp, rotateTowards, wrapAngle, calculateSnakeRadius, calculateBoostDrain } from './Physics';
import { Player, SnakeSegment } from './State';

export class SnakeLogic {
  player: Player;
  private internalSegments: { 
    x: number; y: number; 
    prevX: number; prevY: number;
    radius: number; // ADDED: Store segment radius for collision
  }[] = [];
  private segmentSyncCounter: number = 0;
  private readonly SEGMENT_SYNC_EVERY = 4;
  private headHistory: { x: number; y: number }[] = [];
  private lastHistoryX: number = 0;
  private lastHistoryY: number = 0;
  private isTurning: boolean = false;
  private turnStartTime: number = 0;
  
  // Direction Inertia (Golden Rule: Direction is persistent)
  private dirX: number = 1;
  private dirY: number = 0;
  
  private angularVelocity: number = 0;
  
  // Coiling Logic (Tight turns when spinning at one place)
  private turnAccumulator: number = 0;
  
  // Stored Input for Physics Loop
  public lastInput: { vector: Vector2, boost: boolean } | null = null;
  
  // Boost tracking
  private boostStartTime: number = 0;
  private isBoosting: boolean = false;
  private accumulatedBoostTime: number = 0;

  constructor(player: Player) {
    this.player = player;
    this.player.speed = PhysicsConfig.BASE_SPEED;
    
    // Initialize Physics State
    this.dirX = Math.cos(player.angle);
    this.dirY = Math.sin(player.angle);

    this.lastHistoryX = player.x;
    this.lastHistoryY = player.y;
  }

  initSegments() {
    // Initialize segments if empty
    if (this.internalSegments.length === 0) {
        const startSize = 10; // Worms Zone: 10 initial segments
        for (let i = 0; i < startSize; i++) {
            const backOffset = (i + 1) * PhysicsConfig.SEGMENT_DISTANCE;
            const segX = this.player.x - (backOffset * this.dirX);
            const segY = this.player.y - (backOffset * this.dirY);
            const segmentRadius = calculateSnakeRadius(i + 1);
            
            this.internalSegments.push({ 
              x: segX, y: segY, 
              prevX: segX, prevY: segY,
              radius: segmentRadius // Store radius
            });
            const seg = new SnakeSegment();
            seg.x = segX;
            seg.y = segY;
            this.player.segments.push(seg);
        }
        this.player.length = this.internalSegments.length;
        this.updatePlayerRadius();
    }
  }

  update(dt: number, input: { vector: Vector2, boost: boolean }) {
    if (!this.player.alive) return;

    // 0. Update Dynamic Stats
    const mass = this.player.mass;
    const length = this.player.length;
    
    // 0. Handle Boost Speed and Mass Drain
    const canBoost = input.boost && this.internalSegments.length > 10;
    
    if (canBoost && !this.isBoosting) {
      this.boostStartTime = Date.now();
      this.isBoosting = true;
    } else if (!canBoost && this.isBoosting) {
      this.isBoosting = false;
      this.applyBoostMassDrain();
    }
    
    this.player.isBoosting = canBoost;
    this.player.speed = canBoost ? PhysicsConfig.BOOST_SPEED : PhysicsConfig.BASE_SPEED;
    
    // Track boost time for mass drain
    if (this.isBoosting) {
      this.accumulatedBoostTime += dt;
    }
    
    // Fixed Time Step for Consistent Physics (60Hz)
    const fixedDt = 1 / 60;

    // 1. Detect turning state
    const inputVector = input.vector;
    const lenSq = inputVector.x * inputVector.x + inputVector.y * inputVector.y;
    const wasTurning = this.isTurning;
    this.isTurning = lenSq > 0.0001;
    
    if (this.isTurning && !wasTurning) {
      this.turnStartTime = Date.now();
    }
    
    // 2. Validate Input (Ignore weak/zero input)
    // GOLDEN RULE: If no input, keep last direction.
    
    // Only turn if input is significant
    if (lenSq > 0.0001) {
        // Calculate Target Angle from Input
        const targetAngle = Math.atan2(inputVector.y, inputVector.x);
        
        // Calculate Current Angle from Direction
        const currentAngle = Math.atan2(this.dirY, this.dirX);
        
        // Rotate towards Target
        const diff = angleDifference(currentAngle, targetAngle);
        const maxTurn = PhysicsConfig.TURN_SPEED * fixedDt;
        
        // Apply rotation (clamped)
        let newAngle = currentAngle;
        if (Math.abs(diff) < maxTurn) {
            newAngle = targetAngle;
        } else {
            newAngle += Math.sign(diff) * maxTurn;
        }
        
        // Update Direction
        this.dirX = Math.cos(newAngle);
        this.dirY = Math.sin(newAngle);
        
        // Update Angle (for client interpolation/rendering if needed)
        this.player.angle = newAngle;
    }
    
    // 3. Move Forward (Fixed Time Step for Consistent Speed)
    const moveDist = this.player.speed * fixedDt;
    this.player.x += this.dirX * moveDist;
    this.player.y += this.dirY * moveDist;

    // 4. ---- Update head position history ----
    this.headHistory.unshift({ x: this.player.x, y: this.player.y });
    
    // Trim history to required length (ensure enough for smooth turns)
    const maxHistory = Math.max(this.internalSegments.length * 15 + 30, 100); // Minimum 100 frames buffer
    if (this.headHistory.length > maxHistory) {
      this.headHistory.length = maxHistory;
    }
    
    // 5. Update Body Segments (Constraint Solving)
    this.updateSegments();

    // 6. Update player radius based on segment count
    this.updatePlayerRadius();

    // 7. NO WORLD BOUNDARY CHECK - INFINITE MAP
    // Removed: this.checkWorldBoundary();
  }

  // Apply boost mass drain when boost ends
  private applyBoostMassDrain() {
    if (this.accumulatedBoostTime > 0) {
      const segmentsToDrain = calculateBoostDrain(this.accumulatedBoostTime);
      for (let i = 0; i < segmentsToDrain && this.internalSegments.length > 10; i++) {
        this.shrink(1);
      }
      this.accumulatedBoostTime = 0;
    }
  }

  // Update player radius based on segment count
  private updatePlayerRadius() {
    this.player.radius = calculateSnakeRadius(this.internalSegments.length);
  }

  grow(amount: number = 1) {
    this.player.mass += amount;
    
    // Add segments
    for (let i = 0; i < amount; i++) {
        const lastSeg = (this.internalSegments.length > 0 ? 
          this.internalSegments[this.internalSegments.length - 1] : 
          { x: this.player.x, y: this.player.y }) as { x: number, y: number };
        
        const segmentRadius = calculateSnakeRadius(this.internalSegments.length + 1);
        
        this.internalSegments.push({ 
          x: lastSeg.x, y: lastSeg.y, 
          prevX: lastSeg.x, prevY: lastSeg.y,
          radius: segmentRadius
        });
        const newSeg = new SnakeSegment();
        newSeg.x = lastSeg.x;
        newSeg.y = lastSeg.y;
        this.player.segments.push(newSeg);
    }
    this.player.length = this.internalSegments.length;
    this.updatePlayerRadius();
  }

  shrink(amount: number = 1): {x: number, y: number} | null {
      if (this.internalSegments.length <= 10) return null;

      this.player.score = Math.max(0, this.player.score - amount);
      
      const removed = this.internalSegments.pop();
      if (this.player.segments.length > this.internalSegments.length) {
        this.player.segments.pop();
      }
      this.player.length = this.internalSegments.length;
      this.updatePlayerRadius();
      
      return removed ? { x: removed.x, y: removed.y } : null;
  }

  getSegmentsForCollision() {
    return this.internalSegments;
  }

  // Get segments optimized for LOD
  getSegmentsForLOD(distance: number): {x: number, y: number, radius: number}[] {
    const totalSegments = this.internalSegments.length;
    
    // Determine LOD based on distance and segment count
    let step = 1;
    if (distance > 1000 || totalSegments > 500) step = 2;
    if (distance > 2000 || totalSegments > 2000) step = 3;
    if (distance > 5000 || totalSegments > 10000) step = 5;
    if (totalSegments > 50000) step = 10;
    
    // Return sampled segments
    const result = [];
    for (let i = 0; i < totalSegments; i += step) {
      const seg = this.internalSegments[i];
      result.push({ x: seg.x, y: seg.y, radius: seg.radius });
    }
    
    // Always include head and tail
    if (totalSegments > 0) {
      const head = this.internalSegments[0];
      const tail = this.internalSegments[totalSegments - 1];
      if (step > 1) {
        result.unshift({ x: head.x, y: head.y, radius: head.radius });
        result.push({ x: tail.x, y: tail.y, radius: tail.radius });
      }
    }
    
    return result;
  }

  // INFINITE MAP: No boundary checks
  // private checkWorldBoundary() { REMOVED }

  private updateSegments() {
    const len = this.internalSegments.length;
    if (len === 0) return;
    
    // Worms Zone Style: PERFECT HISTORY BUFFER FOLLOWING
    // Each segment occupies the exact previous position of the segment ahead
    
    // First, update all segments to follow the exact path of the segment ahead
    for (let i = len - 1; i > 0; i--) {
      const cur = this.internalSegments[i];
      const ahead = this.internalSegments[i - 1];
      
      // Store current position as previous for next frame
      cur.prevX = cur.x;
      cur.prevY = cur.y;
      
      // Move to the exact previous position of the segment ahead
      cur.x = ahead.prevX;
      cur.y = ahead.prevY;
      
      // Update segment radius based on position in snake
      cur.radius = calculateSnakeRadius(i + 1);
    }
    
    // Handle first segment (follows head's history buffer)
    const firstSeg = this.internalSegments[0];
    firstSeg.prevX = firstSeg.x;
    firstSeg.prevY = firstSeg.y;
    
    // First segment follows head's history with fixed offset
    const bufferIndex = Math.min(this.headHistory.length - 1, 15); // Fixed 15 frame delay for first segment
    
    if (bufferIndex >= 0 && bufferIndex < this.headHistory.length) {
      const targetPos = this.headHistory[bufferIndex];
      firstSeg.x = targetPos.x;
      firstSeg.y = targetPos.y;
    } else {
      // Fallback: follow head directly
      const dx = this.player.x - firstSeg.x;
      const dy = this.player.y - firstSeg.y;
      const distance = Math.hypot(dx, dy);
      
      if (distance > PhysicsConfig.SEGMENT_DISTANCE * 1.5) {
        const angle = Math.atan2(dy, dx);
        firstSeg.x += Math.cos(angle) * PhysicsConfig.SEGMENT_DISTANCE * 1.2;
        firstSeg.y += Math.sin(angle) * PhysicsConfig.SEGMENT_DISTANCE * 1.2;
      } else {
        const relax = 0.25;
        firstSeg.x += (this.player.x - firstSeg.x) * relax;
        firstSeg.y += (this.player.y - firstSeg.y) * relax;
      }
    }
    
    // Update first segment radius
    firstSeg.radius = calculateSnakeRadius(1);

    this.segmentSyncCounter++;
    
    if (this.segmentSyncCounter % this.SEGMENT_SYNC_EVERY === 0) {
      while (this.player.segments.length < this.internalSegments.length) {
        const seg = new SnakeSegment();
        this.player.segments.push(seg);
      }
      while (this.player.segments.length > this.internalSegments.length) {
        this.player.segments.pop();
      }
      for (let i = 0; i < this.internalSegments.length; i++) {
        const src = this.internalSegments[i];
        const dst = this.player.segments[i];
        if (!dst) continue;
        dst.x = src.x;
        dst.y = src.y;
      }
    }
  }

  // Respawn method for death handling
  respawn() {
    this.player.alive = true;
    // INFINITE MAP: Spawn anywhere in reasonable range
    this.player.x = (Math.random() - 0.5) * 20000;
    this.player.y = (Math.random() - 0.5) * 20000;
    this.player.angle = Math.random() * Math.PI * 2;
    this.player.mass = 0;
    this.player.score = 0;
    this.player.isBoosting = false;
    
    // Reset segments
    this.internalSegments = [];
    this.player.segments.clear();
    this.initSegments();
    
    // Reset direction
    this.dirX = Math.cos(this.player.angle);
    this.dirY = Math.sin(this.player.angle);
    
    // Clear history
    this.headHistory = [];
    this.lastHistoryX = this.player.x;
    this.lastHistoryY = this.player.y;
    
    // Reset boost
    this.isBoosting = false;
    this.accumulatedBoostTime = 0;
  }
}