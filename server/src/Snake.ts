import { Vector2, PhysicsConfig, normalize, angleDifference, checkCircleCollision, clamp, rotateTowards, wrapAngle } from './Physics';
import { Player, SnakeSegment } from './State';

export class SnakeLogic {
  player: Player;
  
  // Direction Inertia (Golden Rule: Direction is persistent)
  private dirX: number = 1;
  private dirY: number = 0;
  
  private angularVelocity: number = 0;
  
  // Coiling Logic (Tight turns when spinning at one place)
  private turnAccumulator: number = 0;
  
  // Stored Input for Physics Loop
  public lastInput: { vector: Vector2, boost: boolean } | null = null;

  constructor(player: Player) {
    this.player = player;
    this.player.speed = PhysicsConfig.BASE_SPEED;
    
    // Initialize Physics State
    this.dirX = Math.cos(player.angle);
    this.dirY = Math.sin(player.angle);
  }

  initSegments() {
    // Initialize segments if empty
    if (this.player.segments.length === 0) {
        for (let i = 0; i < 20; i++) {
            const segX = this.player.x - (i * PhysicsConfig.SEGMENT_DISTANCE * this.dirX);
            const segY = this.player.y - (i * PhysicsConfig.SEGMENT_DISTANCE * this.dirY);
            const seg = new SnakeSegment();
            seg.x = segX;
            seg.y = segY;
            this.player.segments.push(seg);
            this.player.history.push({ x: segX, y: segY });
        }
        this.player.length = this.player.segments.length;
    }
  }

  update(dt: number, input: { vector: Vector2, boost: boolean }) {
    if (!this.player.alive) return;

    // 0. Update Dynamic Stats (Logarithmic Growth Model)
    const mass = this.player.mass;
    const length = this.player.length;
    
    // Growth Model: Radius is the single source of truth
    const baseRadius = 6;
    const maxRadius = 18;
    this.player.radius = Math.min(
      baseRadius + Math.log2(mass + 1) * 1.8,
      maxRadius
    );
    
    // 1. Size-Aware Responsive Steering
    const baseTurn = 0.08; 
    const turnBoost = Math.min(0.04, length * 0.00005); 
    
    // Coiling Logic: Increase turn speed when consistently turning sharply (moving at one place)
    const coilingBonus = Math.min(0.05, this.turnAccumulator * 0.002);
    const turnSpeed = baseTurn + turnBoost + coilingBonus; 

    const inputVector = input.vector;
    const lenSq = inputVector.x * inputVector.x + inputVector.y * inputVector.y;
    
    if (lenSq > 0.0001) {
        const targetAngle = Math.atan2(inputVector.y, inputVector.x);
        const angleDiff = angleDifference(this.player.angle, targetAngle);
        const absDiff = Math.abs(angleDiff);

        // Update Turn Accumulator (Builds up when turning sharply)
        if (absDiff > 0.4) {
            this.turnAccumulator = Math.min(30, this.turnAccumulator + 1);
        } else {
            this.turnAccumulator = Math.max(0, this.turnAccumulator - 2);
        }
        
        // Sharp Turn Mass Cost
        if (absDiff > 0.25) {
            const loss = absDiff * 0.02;
            this.player.mass = Math.max(1, this.player.mass - loss);
        }

        // Apply Responsive Rotation
        this.player.angle = rotateTowards(this.player.angle, targetAngle, turnSpeed);
    } else {
        // Decay coiling bonus if no input
        this.turnAccumulator = Math.max(0, this.turnAccumulator - 1);
    }

    // Update Direction Vector from Angle
    this.dirX = Math.cos(this.player.angle);
    this.dirY = Math.sin(this.player.angle);

    // 2. Handle Boost Speed
    this.player.isBoosting = input.boost;
    this.player.speed = input.boost ? PhysicsConfig.BOOST_SPEED : PhysicsConfig.BASE_SPEED;

    // 3. Move Forward (Always using Direction Inertia)
    const moveDist = this.player.speed * dt;
    this.player.x += this.dirX * moveDist;
    this.player.y += this.dirY * moveDist;
    
    // 4. Update Segments (Follow the head)
    this.player.history.unshift({ x: this.player.x, y: this.player.y });

    // Prune history
    if (this.player.history.length > 2000) { 
      this.player.history.pop();
    }

    // 5. Update Body Segments (Constraint Solving)
    this.updateSegments();

    // 6. Check Self Collision (DISABLED as per user request)
    // this.checkSelfCollision();
    
    // 7. Check World Boundary
    this.checkWorldBoundary();
  }

  grow(amount: number = 1) {
    this.player.mass += amount;
    
    // Add segments
    for (let i = 0; i < amount; i++) {
        const lastSeg = (this.player.segments.length > 0 ? this.player.segments[this.player.segments.length - 1] : { x: this.player.x, y: this.player.y }) as { x: number, y: number };
        
        const newSeg = new SnakeSegment();
        newSeg.x = lastSeg.x;
        newSeg.y = lastSeg.y;
        this.player.segments.push(newSeg);
    }
    this.player.length = this.player.segments.length;
  }

  private checkWorldBoundary() {
    const r = this.player.radius; // Use dynamic radius
    const limit = PhysicsConfig.MAP_SIZE / 2;
    
    const distSq = this.player.x * this.player.x + this.player.y * this.player.y;
    const maxDist = limit - r;
    
    if (distSq > maxDist * maxDist) {
        console.log(`Boundary Collision: pos(${this.player.x}, ${this.player.y}) distSq(${distSq}) maxDistSq(${maxDist * maxDist})`);
        this.player.alive = false;
    }
  }

  private checkSelfCollision() {
    // Safety Rule: Disabled for very small snakes
    if (this.player.length < 12) return;

    const headX = this.player.x;
    const headY = this.player.y;
    
    // Safety Rule: Ignore neck segments (first 6) to prevent false positives
    const neckSafety = 6;
    
    // Collision buffer (0.85 radius)
    const radiusSq = Math.pow(this.player.radius * 0.85, 2);
    
    for (let i = neckSafety; i < this.player.segments.length; i++) {
        const seg = this.player.segments[i];
        if (!seg) continue;
        
        const dx = headX - seg.x;
        const dy = headY - seg.y;
        
        // Distance-squared check for performance
        if (dx * dx + dy * dy < radiusSq) {
            this.player.alive = false;
            // Room.killSnake will be called in index.ts when it detects alive=false
            return;
        }
    }
  }

  private updateSegments() {
    let prevPos = { x: this.player.x, y: this.player.y };
    let historyIdx = 0;

    for (let i = 0; i < this.player.segments.length; i++) {
      const segment = this.player.segments[i];
      if (!segment) continue;

      let targetFound = false;

      for (let j = historyIdx; j < this.player.history.length - 1; j++) {
        const p1 = this.player.history[j];
        
        const distFromPrev = Math.sqrt(Math.pow(prevPos.x - p1.x, 2) + Math.pow(prevPos.y - p1.y, 2));
        
        if (distFromPrev >= PhysicsConfig.SEGMENT_DISTANCE) {
          segment.x = p1.x;
          segment.y = p1.y;
          
          prevPos = { x: segment.x, y: segment.y };
          historyIdx = j; 
          targetFound = true;
          break;
        }
      }
      
      if (!targetFound && this.player.history.length > 0) {
           const last = this.player.history[this.player.history.length - 1];
           segment.x = last.x;
           segment.y = last.y;
      }
    }
  }
}
