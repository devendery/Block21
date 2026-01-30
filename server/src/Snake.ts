import { Vector2, PhysicsConfig, normalize, angleDifference, checkCircleCollision } from './Physics';
import { Player, SnakeSegment } from './State';

export class SnakeLogic {
  player: Player;
  private internalSegments: { 
    x: number; y: number; 
    prevX: number; prevY: number;
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
  
  // Stored Input for Physics Loop
  public lastInput: { vector: Vector2, boost: boolean } | null = null;

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
            this.internalSegments.push({ 
              x: segX, y: segY, 
              prevX: segX, prevY: segY
            });
            const seg = new SnakeSegment();
            seg.x = segX;
            seg.y = segY;
            this.player.segments.push(seg);
        }
        this.player.length = this.internalSegments.length;
    }
  }

  update(dt: number, input: { vector: Vector2, boost: boolean }) {
    if (!this.player.alive) return;

    const inputVector = input.vector;
    
    // 0. Handle Boost Speed (Must have mass to boost)
    const canBoost = input.boost && this.internalSegments.length > 10;
    this.player.isBoosting = canBoost;
    this.player.speed = canBoost ? PhysicsConfig.BOOST_SPEED : PhysicsConfig.BASE_SPEED;
    
    // Fixed Time Step for Consistent Physics (60Hz)
    const fixedDt = 1 / 60;

    // 1. Detect turning state
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
        
        // console.log("NEW DIR:", this.dirX, this.dirY); // Debug Log
        
        // Update Angle (for client interpolation/rendering if needed)
        this.player.angle = newAngle;
    }
    
    // 2. Move Forward (Fixed Time Step for Consistent Speed)
    const moveDist = this.player.speed * fixedDt;
    this.player.x += this.dirX * moveDist;
    this.player.y += this.dirY * moveDist;

    // ---- Update head position history ----
    this.headHistory.unshift({ x: this.player.x, y: this.player.y });
    
    // Trim history to required length (ensure enough for smooth turns)
    const maxHistory = Math.max(this.internalSegments.length * 15 + 30, 100); // Minimum 100 frames buffer
    if (this.headHistory.length > maxHistory) {
      this.headHistory.length = maxHistory;
    }
    
    // 5. Update Body Segments (Constraint Solving)
    this.updateSegments();



    // 7. Check World Boundary
    this.checkWorldBoundary();
  }

  grow(amount: number = 1) {
    this.player.score += amount;
    
    // Add segments
    for (let i = 0; i < amount; i++) {
        const lastSeg = (this.internalSegments.length > 0 ? this.internalSegments[this.internalSegments.length - 1] : { x: this.player.x, y: this.player.y }) as { x: number, y: number };
        
        this.internalSegments.push({ 
          x: lastSeg.x, y: lastSeg.y, 
          prevX: lastSeg.x, prevY: lastSeg.y
        });
        const newSeg = new SnakeSegment();
        newSeg.x = lastSeg.x;
        newSeg.y = lastSeg.y;
        this.player.segments.push(newSeg);
    }
    this.player.length = this.internalSegments.length;
  }

  shrink(amount: number = 1): {x: number, y: number} | null {
      if (this.internalSegments.length <= 10) return null;

      this.player.score = Math.max(0, this.player.score - amount);
      
      const removed = this.internalSegments.pop();
      if (this.player.segments.length > this.internalSegments.length) {
        this.player.segments.pop();
      }
      this.player.length = this.internalSegments.length;
      
      return removed ? { x: removed.x, y: removed.y } : null;
  }

  getSegmentsForCollision() {
    return this.internalSegments;
  }

  private checkWorldBoundary() {
    const r = PhysicsConfig.COLLISION_RADIUS;
    const limit = PhysicsConfig.MAP_SIZE / 2;
    
    // Rectangular Boundary (Worms Zone style)
    if (Math.abs(this.player.x) > limit - r || Math.abs(this.player.y) > limit - r) {
        console.log(`Boundary Collision: pos(${this.player.x}, ${this.player.y}) limit(${limit})`);
        this.player.alive = false;
    }
  }

  private updateSegments() {
    const len = this.internalSegments.length;
    if (len === 0) return;
    
    // Worms Zone Style: EXACT BUFFER FOLLOWING
    // Each segment follows the head's exact path using fixed index offsets in history buffer
    for (let i = len - 1; i >= 0; i--) {
      const cur = this.internalSegments[i];
      
      // Store previous position for interpolation
      cur.prevX = cur.x;
      cur.prevY = cur.y;
      
      // Calculate fixed index offset in head history buffer
      // Each segment follows the head's path with a fixed delay
      const bufferIndex = Math.min(this.headHistory.length - 1, i * 15 + 10);
      
      if (bufferIndex >= 0 && bufferIndex < this.headHistory.length) {
        // Get the exact historical head position for this segment
        const targetPos = this.headHistory[bufferIndex];
        
        // Move directly to the exact historical position
        // This ensures segments follow the head's exact path with perfect accuracy
        cur.x = targetPos.x;
        cur.y = targetPos.y;
      } else if (i === 0) {
        // Fallback for first segment if history is insufficient
        // Follow head directly with tight constraint
        const dx = this.player.x - cur.x;
        const dy = this.player.y - cur.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance > PhysicsConfig.SEGMENT_DISTANCE * 1.5) {
          // Emergency catch-up: Move directly toward head
          const angle = Math.atan2(dy, dx);
          cur.x += Math.cos(angle) * PhysicsConfig.SEGMENT_DISTANCE * 1.2;
          cur.y += Math.sin(angle) * PhysicsConfig.SEGMENT_DISTANCE * 1.2;
        } else {
          // Smooth follow with tight constraint
          const relax = 0.25;
          cur.x += (this.player.x - cur.x) * relax;
          cur.y += (this.player.y - cur.y) * relax;
        }
      }
    }

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
}
