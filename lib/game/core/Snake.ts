import { Vector2, PhysicsConfig, normalize, angleDifference, checkCircleCollision } from './Physics';

export interface SnakeSegment {
  x: number;
  y: number;
}

export class Snake {
  id: string;
  x: number;
  y: number;
  angle: number; // Radians
  speed: number;
  segments: SnakeSegment[];
  
  // Direction Inertia (Golden Rule: Direction is persistent)
  private dirX: number = 1;
  private dirY: number = 0;

  alive: boolean = true;
  
  // History for following segments (array of positions)
  // We store points more frequently than segments to allow smooth curving
  history: Vector2[];

  constructor(id: string, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.speed = PhysicsConfig.BASE_SPEED;
    this.segments = [];
    this.history = [];

    // Initialize segments (stacked on head initially)
    // FIX: Spread them out backwards so we don't immediately collide
    for (let i = 0; i < 20; i++) {
      const segX = x - (i * PhysicsConfig.SEGMENT_DISTANCE);
      this.segments.push({ x: segX, y });
      
      // Pre-fill history for these positions
      // We need enough history points to cover the gaps
      // 20px distance / speed 200 = 0.1s. 60fps = 6 frames per segment.
      // Let's just push the exact points for now
      this.history.push({ x: segX, y });
    }
    
    // Reverse history so head is at index 0 (closest to now)? 
    // Wait, history.unshift adds to front. 
    // So current history should be [head, head-1, head-2...]
    // The loop above pushes x, x-20, x-40...
    // So history[0] = x (head), history[1] = x-20... 
    // Actually, constructor pushes to END.
    // If we want history[0] to be head, we should have pushed head first.
    // My loop pushes head (i=0) first. So history[0] is head. Correct.
  }

  update(dt: number, input: { vector: Vector2, boost: boolean }) {
    const inputVector = input.vector;
    
    // 0. Handle Boost Speed
    this.speed = input.boost ? PhysicsConfig.BOOST_SPEED : PhysicsConfig.BASE_SPEED;

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
        const maxTurn = PhysicsConfig.BASE_TURN_SPEED * dt;
        
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
        
        // Update Angle (for visual rendering)
        this.angle = newAngle;
    }
    
    // 2. Move Forward (Always using Direction Inertia)
    const moveDist = this.speed * dt;
    this.x += this.dirX * moveDist;
    this.y += this.dirY * moveDist;

    // 3. Update History (Breadcrumbs for segments)
    // Only add history point if we moved enough to save memory/cpu, 
    // BUT for "perfect feel" we want high resolution. 
    // Let's push every frame for now and prune.
    
    // SMOOTHNESS FIX: Only push history if we moved a tiny bit to avoid duplicate points
    // But we need high density.
    this.history.unshift({ x: this.x, y: this.y });

    // Prune history: We only need enough to cover all segments
    // Max needed = NumSegments * SegmentDistance
    // With smaller segment distance (14px), we need more points if spacing is large?
    // Actually, smaller segment distance means we find points closer in history.
    // We just need a large enough buffer.
    if (this.history.length > 2000) { // Increased buffer for safety
      this.history.pop();
    }

    // 5. Update Body Segments (Constraint Solving)
    this.updateSegments();

    // 6. Check Self Collision
    this.checkSelfCollision();
    
    // 7. Check World Boundary
    this.checkWorldBoundary();
  }

  private checkWorldBoundary() {
    const r = PhysicsConfig.COLLISION_RADIUS;
    const limit = PhysicsConfig.MAP_SIZE / 2;
    
    // Simple circular or square arena? Let's assume Square for now as per config MAP_SIZE
    // Actually, usually circular arenas are better for snake games.
    // Let's implement Circular Boundary logic.
    // Distance from center > limit - radius
    
    const distSq = this.x * this.x + this.y * this.y;
    const maxDist = limit - r;
    
    if (distSq > maxDist * maxDist) {
        this.alive = false;
    }
  }

  private checkSelfCollision() {
    // Ignore head and immediate neck segments (e.g. first 5)
    // The head is at (this.x, this.y).
    // Segments[0] is the first body part behind head.
    
    // Safety buffer: 5 segments * 14px = 70px safe zone
    const safeZone = 5; 
    
    for (let i = safeZone; i < this.segments.length; i++) {
        const seg = this.segments[i];
        // STRICT PHYSICS CHECK: Use PhysicsConfig.COLLISION_RADIUS for both head and body
        // The hitbox is a uniform tube. Visuals (tapering) are ignored here.
        if (checkCircleCollision(this.x, this.y, PhysicsConfig.COLLISION_RADIUS, seg.x, seg.y, PhysicsConfig.COLLISION_RADIUS)) {
            // Collision!
            this.alive = false;
            // console.log("Self Collision Detected!");
            return;
        }
    }
  }

  private updateSegments() {
    let currentIdx = 0;
    // Head is effectively at history[0]
    
    // Each segment follows the path at a fixed distance behind the previous one
    // We walk the history to find the point that is SEGMENT_DISTANCE away
    
    let prevPos = { x: this.x, y: this.y };
    let historyIdx = 0;

    for (let i = 0; i < this.segments.length; i++) {
      const segment = this.segments[i];
      
      // Find position in history at distance from prevPos
      let distAccum = 0;
      let targetFound = false;

      // Start searching from where the previous segment left off (optimization)
      // Actually, we must search from the *previous segment's position* backwards in history?
      // No, simpler approach:
      // The snake is a line in the history buffer.
      // We just need to find the point in history that is Distance(prev, point) = SEGMENT_DISTANCE
      
      // Linear walk optimization:
      // We know segments are ordered. We can continue scanning history from the last used index.
      
      for (let j = historyIdx; j < this.history.length - 1; j++) {
        const p1 = this.history[j];
        const p2 = this.history[j + 1];
        
        const d = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
        
        // Exact distance check is hard with discrete points.
        // We accumulate distance from the *previous resolved segment*
        const distFromPrev = Math.sqrt(Math.pow(prevPos.x - p1.x, 2) + Math.pow(prevPos.y - p1.y, 2));
        
        if (distFromPrev >= PhysicsConfig.SEGMENT_DISTANCE) {
          // This point is our target (or close enough)
          // For ultra-smoothness, we could interpolate between j and j-1, 
          // but just picking the point is usually fine if tick rate is high.
          segment.x = p1.x;
          segment.y = p1.y;
          
          prevPos = { x: segment.x, y: segment.y };
          historyIdx = j; // Next segment looks from here
          targetFound = true;
          break;
        }
      }
      
      if (!targetFound) {
        // If we ran out of history (snake just spawned or moving super fast), 
        // just stack at the end
        if (this.history.length > 0) {
             const last = this.history[this.history.length - 1];
             segment.x = last.x;
             segment.y = last.y;
        }
      }
    }
  }
}
