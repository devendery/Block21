import { Vector2, PhysicsConfig, normalize, angleDifference, checkCircleCollision } from './Physics';

export class SnakeSegment {
  x: number;
  y: number;
  prevX: number;  // Store previous position for teleport detection
  prevY: number;
  
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
  }
  
  updatePosition(newX: number, newY: number) {
    this.prevX = this.x;
    this.prevY = this.y;
    this.x = newX;
    this.y = newY;
  }
}

export class Snake {
  id: string;
  x: number;
  y: number;
  angle: number;
  speed: number;
  segments: SnakeSegment[];
  
  private dirX: number = 1;
  private dirY: number = 0;
  private isTurning: boolean = false;
  private turnStartTime: number = 0;

  alive: boolean = true;
  history: Vector2[];

  constructor(id: string, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.speed = PhysicsConfig.BASE_SPEED;
    this.segments = [];
    this.history = [];

    // Initialize segments with proper spacing
    for (let i = 0; i < 20; i++) {
      const segX = x - (i * PhysicsConfig.SEGMENT_DISTANCE);
      this.segments.push(new SnakeSegment(segX, y));
      this.history.push({ x: segX, y });
    }
  }

  update(dt: number, input: { vector: Vector2, boost: boolean }) {
    if (!this.alive) return;
    
    const inputVector = input.vector;
    
    // Handle boost
    this.speed = input.boost ? PhysicsConfig.BOOST_SPEED : PhysicsConfig.BASE_SPEED;

    // Detect turning state
    const lenSq = inputVector.x * inputVector.x + inputVector.y * inputVector.y;
    const wasTurning = this.isTurning;
    this.isTurning = lenSq > 0.0001;
    
    if (this.isTurning && !wasTurning) {
      this.turnStartTime = Date.now();
    }
    
    // Only turn if input is significant
    if (lenSq > 0.0001) {
        const targetAngle = Math.atan2(inputVector.y, inputVector.x);
        const currentAngle = Math.atan2(this.dirY, this.dirX);
        const diff = angleDifference(currentAngle, targetAngle);
        const maxTurn = PhysicsConfig.TURN_SPEED * dt;
        
        let newAngle = currentAngle;
        if (Math.abs(diff) < maxTurn) {
            newAngle = targetAngle;
        } else {
            newAngle += Math.sign(diff) * maxTurn;
        }
        
        this.dirX = Math.cos(newAngle);
        this.dirY = Math.sin(newAngle);
        this.angle = newAngle;
    }
    
    // Move forward
    const moveDist = this.speed * dt;
    this.x += this.dirX * moveDist;
    this.y += this.dirY * moveDist;

    // Add to history
    this.history.unshift({ x: this.x, y: this.y });
    
    // Keep history size reasonable
    const maxHistoryNeeded = this.segments.length * 4 + 10;
    if (this.history.length > maxHistoryNeeded) {
      this.history.pop();
    }

    // Update body segments
    this.updateSegments();

    // Check collisions
    this.checkSelfCollision();
    this.checkWorldBoundary();
  }

  private checkWorldBoundary() {
    const r = PhysicsConfig.COLLISION_RADIUS;
    const limit = PhysicsConfig.MAP_SIZE / 2;
    const distSq = this.x * this.x + this.y * this.y;
    const maxDist = limit - r;
    
    if (distSq > maxDist * maxDist) {
        this.alive = false;
    }
  }

  private checkSelfCollision() {
    const safeZone = 5;
    
    for (let i = safeZone; i < this.segments.length; i++) {
        const seg = this.segments[i];
        if (checkCircleCollision(this.x, this.y, PhysicsConfig.COLLISION_RADIUS, 
                                 seg.x, seg.y, PhysicsConfig.COLLISION_RADIUS)) {
            this.alive = false;
            return;
        }
    }
  }

   private updateSegments() {
  if (this.segments.length === 0 || this.history.length < 2) return;
  
  // Method: Walk along the history path, placing segments at fixed distances
  
  // Start from head position
  let currentX = this.x;
  let currentY = this.y;
  let historyIndex = 0;
  let accumulatedDistance = 0;
  
  // Clear history beyond what we need (performance)
  const maxHistoryNeeded = this.segments.length * 3 + 10;
  if (this.history.length > maxHistoryNeeded) {
    this.history.splice(maxHistoryNeeded);
  }
  
  for (let i = 0; i < this.segments.length; i++) {
    const segment = this.segments[i];
    const targetDistance = PhysicsConfig.SEGMENT_DISTANCE * (i + 1);
    
    // Walk along history until we reach targetDistance from head
    while (historyIndex < this.history.length - 1 && accumulatedDistance < targetDistance) {
      const p1 = this.history[historyIndex];
      const p2 = this.history[historyIndex + 1];
      
      const segmentDX = p2.x - p1.x;
      const segmentDY = p2.y - p1.y;
      const segmentLength = Math.sqrt(segmentDX * segmentDX + segmentDY * segmentDY);
      
      // If adding this segment would exceed target, interpolate
      if (accumulatedDistance + segmentLength >= targetDistance) {
        const remaining = targetDistance - accumulatedDistance;
        const ratio = remaining / segmentLength;
        
        currentX = p1.x + segmentDX * ratio;
        currentY = p1.y + segmentDY * ratio;
        accumulatedDistance = targetDistance;
        break;
      } else {
        accumulatedDistance += segmentLength;
        historyIndex++;
        currentX = p2.x;
        currentY = p2.y;
      }
    }
    
    // Anti-teleport: Smooth movement instead of snapping
    const dx = currentX - segment.x;
    const dy = currentY - segment.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const maxJump = PhysicsConfig.SEGMENT_DISTANCE * 2;
    if (distance > maxJump) {
      // Teleport detected! Move gradually
      const angle = Math.atan2(dy, dx);
      const moveAmount = Math.min(distance, maxJump * 0.5);
      segment.x += Math.cos(angle) * moveAmount;
      segment.y += Math.sin(angle) * moveAmount;
    } else {
      // Normal smooth movement
      const lerpFactor = 0.3; // Adjust this for smoothness
      segment.x += dx * lerpFactor;
      segment.y += dy * lerpFactor;
    }
  }
}
}