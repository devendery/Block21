import { Vector2, PhysicsConfig, normalize, angleDifference, checkCircleCollision } from './Physics';
import { Player, SnakeSegment } from './State';

export class SnakeLogic {
  player: Player;
  
  // Direction Inertia (Golden Rule: Direction is persistent)
  private dirX: number = 1;
  private dirY: number = 0;

  constructor(player: Player) {
    this.player = player;
    this.player.speed = PhysicsConfig.BASE_SPEED;
    
    // Initialize Physics State
    this.dirX = Math.cos(player.angle);
    this.dirY = Math.sin(player.angle);
    
    // Initialize segments if empty
    if (this.player.segments.length === 0) {
        for (let i = 0; i < 20; i++) {
            const segX = player.x - (i * PhysicsConfig.SEGMENT_DISTANCE);
            const seg = new SnakeSegment();
            seg.x = segX;
            seg.y = player.y;
            this.player.segments.push(seg);
            this.player.history.push({ x: segX, y: player.y });
        }
    }
  }

  update(dt: number, input: { vector: Vector2, boost: boolean }) {
    if (!this.player.alive) return;

    const inputVector = input.vector;
    
    // 0. Handle Boost Speed
    this.player.speed = input.boost ? PhysicsConfig.BOOST_SPEED : PhysicsConfig.BASE_SPEED;

    // 1. Validate Input (Ignore weak/zero input)
    // GOLDEN RULE: If no input, keep last direction.
    const lenSq = inputVector.x * inputVector.x + inputVector.y * inputVector.y;
    
    // Only turn if input is significant
    if (lenSq > 0.0001) {
        // Calculate Target Angle from Input
        const targetAngle = Math.atan2(inputVector.y, inputVector.x);
        
        // Calculate Current Angle from Direction
        const currentAngle = Math.atan2(this.dirY, this.dirX);
        
        // Rotate towards Target
        const diff = angleDifference(currentAngle, targetAngle);
        const maxTurn = PhysicsConfig.TURN_SPEED * dt;
        
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
    
    // 2. Move Forward (Always using Direction Inertia)
    const moveDist = this.player.speed * dt;
    this.player.x += this.dirX * moveDist;
    this.player.y += this.dirY * moveDist;

    // 3. Update History (Breadcrumbs for segments)
    this.player.history.unshift({ x: this.player.x, y: this.player.y });

    // Prune history
    if (this.player.history.length > 2000) { 
      this.player.history.pop();
    }

    // 5. Update Body Segments (Constraint Solving)
    this.updateSegments();

    // 6. Check Self Collision
    this.checkSelfCollision();
    
    // 7. Check World Boundary
    this.checkWorldBoundary();
  }

  grow(amount: number = 1) {
    this.player.score += amount;
    
    // Add segments
    for (let i = 0; i < amount; i++) {
        const lastSeg = (this.player.segments.length > 0 ? this.player.segments[this.player.segments.length - 1] : { x: this.player.x, y: this.player.y }) as { x: number, y: number };
        
        const newSeg = new SnakeSegment();
        // Place it at the same spot as the last one initially; it will unravel
        newSeg.x = lastSeg.x;
        newSeg.y = lastSeg.y;
        this.player.segments.push(newSeg);
    }
  }

  private checkWorldBoundary() {
    const r = PhysicsConfig.COLLISION_RADIUS;
    const limit = PhysicsConfig.MAP_SIZE / 2;
    
    const distSq = this.player.x * this.player.x + this.player.y * this.player.y;
    const maxDist = limit - r;
    
    if (distSq > maxDist * maxDist) {
        this.player.alive = false;
    }
  }

  private checkSelfCollision() {
    const safeZone = 5; 
    
    for (let i = safeZone; i < this.player.segments.length; i++) {
        const seg = this.player.segments[i];
        if (seg && checkCircleCollision(this.player.x, this.player.y, PhysicsConfig.COLLISION_RADIUS, seg.x, seg.y, PhysicsConfig.COLLISION_RADIUS)) {
            this.player.alive = false;
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
