import * as Phaser from 'phaser';
import { PhysicsConfig, VisualConfig } from '../core/Physics';
import { Player, SnakeSegment } from './ClientState';

export interface ISnakeState {
    x: number;
    y: number;
    angle: number;
    alive: boolean;
    speed: number;
    segments: SnakeSegment[];
}

export class SnakeRenderer {
  private scene: Phaser.Scene;
  private headGraphics: Phaser.GameObjects.Graphics;
  private bodyGraphics: Phaser.GameObjects.Graphics;
  private snake: Player; // Use actual schema type
  private isLocal: boolean;
  private predictedPose: { x: number; y: number; angle: number } | null = null;
  
  // Visual polish: Shadow
  private shadowGraphics: Phaser.GameObjects.Graphics;

  // Visual State
  public displayX: number = 0;
  public displayY: number = 0;
  public displayAngle: number = 0;
  private lastDisplayAngle: number = 0;
  private lastAngleDelta: number = 0;
  private turnIntensity: number = 0;
  
  // Sacred History Path
  private history: { x: number, y: number }[] = [];
  private readonly MAX_HISTORY = 4000;

  // LIFO / Hybrid Controller
  private relaxFrontIndex: number = 0;
  private readonly RELAX_SPEED = 2.5; // Speed at which the "straightness" propagates back
  private readonly TURN_LOCK_THRESHOLD = 0.40; // Turn intensity to stop relaxing (Increased to prevent accidental resets)
  private readonly TURN_UNLOCK_THRESHOLD = 0.15;
  private relaxPaused: boolean = false;

  private displaySegments: { x: number, y: number }[] = [];

  private snapshotBuffer: { t: number; x: number; y: number; angle: number }[] = [];
  private readonly INTERPOLATION_DELAY_MS = 150;
  private readonly MAX_SNAPSHOTS = 60;
  private lastBufferedX = NaN;
  private lastBufferedY = NaN;
  private lastBufferedAngle = NaN;

  private resetHistoryFromHead(x: number, y: number, angle: number) {
    this.history = [];
    // Simulate frame-by-frame history density (~3.6 units/frame)
    // instead of segment-by-segment density (14 units)
    // to ensure consistent behavior for sampling.
    const stepsPerSegment = PhysicsConfig.SEGMENT_DISTANCE / (PhysicsConfig.BASE_SPEED / 60); 
    const stepDist = PhysicsConfig.BASE_SPEED / 60;
    
    // We need enough history to cover 500 segments
    const totalPoints = Math.ceil(500 * stepsPerSegment) + 200; // Buffer

    const backX = -Math.cos(angle);
    const backY = -Math.sin(angle);
    
    for (let i = 0; i < totalPoints; i++) {
      this.history.push({ x: x + backX * stepDist * i, y: y + backY * stepDist * i });
    }
  }

  private bufferSnapshot(now: number) {
    const x = this.snake.x;
    const y = this.snake.y;
    const angle = this.snake.angle;

    if (
      x === this.lastBufferedX &&
      y === this.lastBufferedY &&
      angle === this.lastBufferedAngle
    ) {
      return;
    }

    this.lastBufferedX = x;
    this.lastBufferedY = y;
    this.lastBufferedAngle = angle;

    this.snapshotBuffer.push({ t: now, x, y, angle });
    if (this.snapshotBuffer.length > this.MAX_SNAPSHOTS) {
      this.snapshotBuffer.shift();
    }
  }

  private lerpAngle(a: number, b: number, t: number) {
    const delta = Phaser.Math.Angle.Wrap(b - a);
    return a + delta * t;
  }

  private getInterpolatedTarget(now: number) {
    if (this.snapshotBuffer.length === 0) {
      return { x: this.snake.x, y: this.snake.y, angle: this.snake.angle };
    }

    const renderTime = now - this.INTERPOLATION_DELAY_MS;

    while (this.snapshotBuffer.length >= 2 && this.snapshotBuffer[1].t <= renderTime) {
      this.snapshotBuffer.shift();
    }

    if (this.snapshotBuffer.length === 1) {
      const s = this.snapshotBuffer[0];
      return { x: s.x, y: s.y, angle: s.angle };
    }

    const s0 = this.snapshotBuffer[0];
    const s1 = this.snapshotBuffer[1];

    const denom = Math.max(1, s1.t - s0.t);
    const alpha = Phaser.Math.Clamp((renderTime - s0.t) / denom, 0, 1);

    return {
      x: Phaser.Math.Linear(s0.x, s1.x, alpha),
      y: Phaser.Math.Linear(s0.y, s1.y, alpha),
      angle: this.lerpAngle(s0.angle, s1.angle, alpha),
    };
  }

  constructor(scene: Phaser.Scene, snake: Player, isLocal: boolean) { // Use actual schema type
    this.scene = scene;
    this.snake = snake;
    this.isLocal = isLocal;

    // Initialize display state
    this.displayX = snake.x;
    this.displayY = snake.y;
    this.displayAngle = snake.angle;
    this.lastDisplayAngle = snake.angle;

    // Fill initial history
    this.resetHistoryFromHead(snake.x, snake.y, snake.angle);
    this.snapshotBuffer.push({ t: 0, x: snake.x, y: snake.y, angle: snake.angle });

    // Layering: Shadow < Body < Head
    this.shadowGraphics = scene.add.graphics();
    this.shadowGraphics.setDepth(5);
    this.shadowGraphics.setAlpha(0.3);

    this.bodyGraphics = scene.add.graphics();
    this.bodyGraphics.setDepth(10);

    this.headGraphics = scene.add.graphics();
    this.headGraphics.setDepth(11);
  }

  setPredictedPose(pose: { x: number; y: number; angle: number } | null) {
    this.predictedPose = pose;
  }
update() {
  try {
    if (!this.snake.alive) {
      this.clear();
      return;
    }

    const now = (this.scene as any).time?.now ?? performance.now();
    this.bufferSnapshot(now);

    const t = 0.1;
    const TURN_INTERPOLATION = 0.15;

    const localTarget = this.predictedPose ?? { x: this.snake.x, y: this.snake.y, angle: this.snake.angle };
    const target = this.isLocal ? localTarget : this.getInterpolatedTarget(now);

    // ==================================================
    // 0. SNAP / TELEPORT PROTECTION
    // ==================================================
    const snapDist = Phaser.Math.Distance.Between(
      this.displayX,
      this.displayY,
      target.x,
      target.y
    );

    // Reduced threshold to 300 for smoother movement
    // Soft correction: If between 100-300, lerp faster (t=0.3)
    // Emergency correction: If > 300, use aggressive catch-up with history reset
    if (snapDist > 300) {
      // Aggressive but smooth catch-up (prevents teleporting)
      // Use the same interpolation method as normal for consistency
      const catchupSpeed = 0.5;
      this.displayX = Phaser.Math.Linear(this.displayX, target.x, catchupSpeed);
      this.displayY = Phaser.Math.Linear(this.displayY, target.y, catchupSpeed);
      this.displayAngle = target.angle;
      this.lastDisplayAngle = this.displayAngle;
      this.lastAngleDelta = 0;
      
      // CRITICAL: Reset history to maintain visual continuity during large corrections
      this.resetHistoryFromHead(this.displayX, this.displayY, this.displayAngle);
    } else {
      // ==================================================
      // 1. HEAD-ONLY INTERPOLATION
      // ==================================================
      // Dynamic lerp: standard 0.1, but if drifting (>50), increase to 0.2 to catch up smoothly
      // If boosting, we want tighter lerp (0.3) because speed is high
      const isBoosting = this.snake.isBoosting;
      const baseLerp = isBoosting ? 0.2 : 0.1;
      const catchupLerp = isBoosting ? 0.4 : 0.25;
      
      const dynamicT = snapDist > 50 ? catchupLerp : baseLerp;
      
      // Always use smooth interpolation for all snakes (local and remote)
      const remoteLerp = 0.2; // Smooth interpolation for remote snakes
      this.displayX = Phaser.Math.Linear(this.displayX, target.x, this.isLocal ? dynamicT : remoteLerp);
      this.displayY = Phaser.Math.Linear(this.displayY, target.y, this.isLocal ? dynamicT : remoteLerp);
      this.displayAngle = Phaser.Math.Angle.RotateTo(
        this.displayAngle,
        target.angle,
        this.isLocal ? TURN_INTERPOLATION : TURN_INTERPOLATION * 2 // Slower turn for remote
      );
    }

    // ==================================================
      // 2. TURN DETECTION (Visual Only)
      // ==================================================
      const angleDelta = Phaser.Math.Angle.Wrap(
        this.displayAngle - this.lastDisplayAngle
      );
      this.lastAngleDelta = angleDelta;
      this.lastDisplayAngle = this.displayAngle;

      const turnIntensity = Math.abs(angleDelta) / 0.1; // Normalize

      // LIFO Hysteresis
      if (turnIntensity > this.TURN_LOCK_THRESHOLD) {
        this.relaxPaused = true;
      } else if (turnIntensity < this.TURN_UNLOCK_THRESHOLD) {
        this.relaxPaused = false;
      }

      if (this.relaxPaused) {
        // When turning, we STOP relaxing.
        // DECAY instead of instant reset to prevent snapping.
        // This creates a "zipper" effect where the body locks to history smoothly.
        this.relaxFrontIndex = Math.max(0, this.relaxFrontIndex - 8); 
      } else {
        // When straight, the "straightness" travels down the body
        this.relaxFrontIndex += this.RELAX_SPEED;
        // Clamp to max length
        this.relaxFrontIndex = Math.min(this.relaxFrontIndex, this.snake.segments.length);
      }

      // ==================================================
      // 3. RECORD SACRED HISTORY (RAW HEAD PATH)
      // ==================================================
    this.history.unshift({ x: this.displayX, y: this.displayY });
    if (this.history.length > this.MAX_HISTORY) {
      this.history.pop();
    }

    // ==================================================
    // 4. SYNC SEGMENT COUNT (Worms Zone Style)
    // ==================================================
    while (this.displaySegments.length < this.snake.segments.length) {
      // Add new segments at the tail position, not head position
      const tailPos = this.displaySegments.length > 0 ? 
        { ...this.displaySegments[this.displaySegments.length - 1] } : 
        { x: this.displayX, y: this.displayY };
      this.displaySegments.push({ x: tailPos.x, y: tailPos.y });
    }
    while (this.displaySegments.length > this.snake.segments.length) {
      this.displaySegments.pop();
    }

    // ==================================================
  // 5. Worms Zone Style: Pure Mathematical Interpolation
  // ==================================================
  const spacing = PhysicsConfig.SEGMENT_DISTANCE;
  
  // Worms Zone uses tighter spacing during turns to prevent teleporting
  const turnTightness = Math.min(1, Math.abs(this.lastAngleDelta) / 0.15);
  const dynamicSpacing = spacing * (1 - turnTightness * 0.3); // 30% tighter during sharp turns
  
  // Pure mathematical interpolation - no hybrid zones
  for (let i = 0; i < this.displaySegments.length; i++) {
    const targetPos = (i === 0) ? 
      { x: this.displayX, y: this.displayY } : 
      this.displaySegments[i - 1];
    
    const currentPos = this.displaySegments[i];
    
    // Calculate vector and distance
    const dx = targetPos.x - currentPos.x;
    const dy = targetPos.y - currentPos.y;
    const distance = Math.hypot(dx, dy);
    
    if (distance > 0.001) {
      // Worms Zone-style smooth interpolation with tighter spacing during turns
      const targetDistance = dynamicSpacing;
      
      if (distance > targetDistance * 2.5) {
        // Emergency catch-up: move directly toward target
        const angle = Math.atan2(dy, dx);
        currentPos.x += Math.cos(angle) * targetDistance * 1.8;
        currentPos.y += Math.sin(angle) * targetDistance * 1.8;
      } else if (distance > targetDistance * 1.2) {
        // Fast interpolation for moderate gaps
        const overshoot = distance - targetDistance;
        currentPos.x += (dx / distance) * overshoot * 0.6;
        currentPos.y += (dy / distance) * overshoot * 0.6;
      } else {
        // Smooth interpolation for normal movement
        const lerpFactor = 0.15 + turnTightness * 0.1; // Faster interpolation during turns
        currentPos.x += (targetPos.x - currentPos.x) * lerpFactor;
        currentPos.y += (targetPos.y - currentPos.y) * lerpFactor;
      }
    }
  }

    // ==================================================
    // 6. RENDER
    // ==================================================
    this.clear();
    this.drawShadows();
    this.drawBody();
    this.drawHead();

  } catch (e) {
    console.error("SnakeRenderer Update Error:", e);
  }
}

// DELETED: relaxHistory() - Pure path following does not use relaxation.


  // Helper: Find intersection t (0..1) where segment p1->p2 intersects circle at center 'c' with radius 'r'
  // Returns closest t to 0 (since we move forward from p1)
  private intersectCircleLine(c: {x:number, y:number}, r: number, p1: {x:number, y:number}, p2: {x:number, y:number}): number | null {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const fx = p1.x - c.x;
    const fy = p1.y - c.y;

    const A = dx * dx + dy * dy;
    const B = 2 * (fx * dx + fy * dy);
    const C = (fx * fx + fy * fy) - r * r;

    let delta = B * B - 4 * A * C;

    if (delta < 0) return null; // No intersection

    delta = Math.sqrt(delta);

    const t1 = (-B - delta) / (2 * A);
    const t2 = (-B + delta) / (2 * A);

    // We prefer the smallest positive t (closest to p1)
    if (t1 >= 0 && t1 <= 1) return t1;
    if (t2 >= 0 && t2 <= 1) return t2;

    return null;
  }

  private clear() {
    this.headGraphics.clear();
    this.bodyGraphics.clear();
    this.shadowGraphics.clear();
  }

  private drawHead() {
    // Worms Zone Style: Round Head + Big Eyes
    const skinId = this.snake.skin || 0;
    const skin = SnakeRenderer.SKINS[skinId % SnakeRenderer.SKINS.length];

    const shellColor = skin.main; 
    const outlineColor = skin.outline; 

    // 1. Draw Round Head
    const r = VisualConfig.RENDER_RADIUS;
    this.headGraphics.fillStyle(shellColor, 1);
    this.headGraphics.fillCircle(this.displayX, this.displayY, r);
    this.headGraphics.lineStyle(2, outlineColor, 1);
    this.headGraphics.strokeCircle(this.displayX, this.displayY, r);

    // 2. Draw Eyes (Whites)
    const angle = this.displayAngle;
    const eyeOffsetX = r * 0.4;
    const eyeOffsetY = r * 0.35;
    const eyeRadius = r * 0.35;
    const eyeColor = 0xFFFFFF;

    // Left Eye Position
    const leftEyeX = this.displayX + eyeOffsetX * Math.cos(angle) - (-eyeOffsetY) * Math.sin(angle);
    const leftEyeY = this.displayY + eyeOffsetX * Math.sin(angle) + (-eyeOffsetY) * Math.cos(angle);
    
    // Right Eye Position
    const rightEyeX = this.displayX + eyeOffsetX * Math.cos(angle) - (eyeOffsetY) * Math.sin(angle);
    const rightEyeY = this.displayY + eyeOffsetX * Math.sin(angle) + (eyeOffsetY) * Math.cos(angle);

    this.headGraphics.fillStyle(eyeColor, 1);
    this.headGraphics.fillCircle(leftEyeX, leftEyeY, eyeRadius);
    this.headGraphics.fillCircle(rightEyeX, rightEyeY, eyeRadius);

    // 3. Draw Pupils (Black)
    const pupilRadius = eyeRadius * 0.5;
    const pupilColor = 0x000000;
    const pupilOffset = eyeRadius * 0.2; // Look forward slightly

    const pupilLX = leftEyeX + pupilOffset * Math.cos(angle);
    const pupilLY = leftEyeY + pupilOffset * Math.sin(angle);
    const pupilRX = rightEyeX + pupilOffset * Math.cos(angle);
    const pupilRY = rightEyeY + pupilOffset * Math.sin(angle);

    this.headGraphics.fillStyle(pupilColor, 1);
    this.headGraphics.fillCircle(pupilLX, pupilLY, pupilRadius);
    this.headGraphics.fillCircle(pupilRX, pupilRY, pupilRadius);
  }

  // Helper for rotated rectangles (eyes) - REMOVED as we switched to circle eyes
  /* private drawRotatedRect... */

  // SKIN PALETTES (Primary, Secondary, Outline)
  private static SKINS = [
    { main: 0x525252, stripe: 0x737373, outline: 0x262626 }, // 0: Grey (Default)
    { main: 0xE74C3C, stripe: 0xC0392B, outline: 0x922B21 }, // 1: Red
    { main: 0x3498DB, stripe: 0x2980B9, outline: 0x1F618D }, // 2: Blue
    { main: 0x2ECC71, stripe: 0x27AE60, outline: 0x1E8449 }, // 3: Green
    { main: 0xF1C40F, stripe: 0xF39C12, outline: 0xB7950B }, // 4: Yellow
    { main: 0x9B59B6, stripe: 0x8E44AD, outline: 0x6C3483 }, // 5: Purple
  ];

  private drawBody() {
    // Worms Zone Style: Striped Pattern (No Energy Core)
    const skinId = this.snake.skin || 0;
    const skin = SnakeRenderer.SKINS[skinId % SnakeRenderer.SKINS.length];
    
    const color1 = skin.main; 
    const color2 = skin.stripe;
    const outlineColor = skin.outline;
    
    const totalSegments = this.displaySegments.length; 
    
    for (let i = totalSegments - 1; i >= 0; i--) {
      const seg = this.displaySegments[i]; 
      
      // Calculate Tapering (Quadratic Ease-Out)
      const taperStartIndex = Math.floor(totalSegments * VisualConfig.TAIL_TAPER_START);

      let t = (i - taperStartIndex) / (totalSegments - taperStartIndex);
      t = Math.min(1, Math.max(0, t)); // safety clamp

      const smoothT = 1 - (1 - t) * (1 - t);
      const scale = 1 - smoothT * (1 - VisualConfig.TAIL_MIN_SCALE);
      
      const radius = VisualConfig.RENDER_RADIUS * scale;
      // const radius = this.snake.radius * scale; // Use dynamic radius from server

      // 1. Striped Shell
      // Alternate color every 2 segments for broader stripes
      const isStripe = Math.floor(i / 2) % 2 === 0;
      this.bodyGraphics.fillStyle(isStripe ? color1 : color2, 1);
      this.bodyGraphics.fillCircle(seg.x, seg.y, radius);
      
      // 1b. Shell Outline
      this.bodyGraphics.lineStyle(1, outlineColor, 0.8);
      this.bodyGraphics.strokeCircle(seg.x, seg.y, radius);
    }
  }

  private drawShadows() {
    this.shadowGraphics.fillStyle(0x000000, VisualConfig.SHADOW_ALPHA); // Darker shadow for high contrast
    const shadowOffset = 10; 
    
    // Head Shadow
    this.shadowGraphics.fillCircle(this.displayX + shadowOffset, this.displayY + shadowOffset, VisualConfig.RENDER_RADIUS);
    // this.shadowGraphics.fillCircle(this.displayX + shadowOffset, this.displayY + shadowOffset, this.snake.radius);

    // Body Shadows (Tapered)
    const totalSegments = this.displaySegments.length;
    for (let i = totalSegments - 1; i >= 0; i--) {
        const seg = this.displaySegments[i];
        
        // Match taper logic (Same as body)
        const taperStartIndex = Math.floor(totalSegments * VisualConfig.TAIL_TAPER_START);
        let t = (i - taperStartIndex) / (totalSegments - taperStartIndex);
        t = Math.min(1, Math.max(0, t));
        const smoothT = 1 - (1 - t) * (1 - t);
        const scale = 1 - smoothT * (1 - VisualConfig.TAIL_MIN_SCALE);
        
        const radius = VisualConfig.RENDER_RADIUS * scale;
        // const radius = this.snake.radius * scale;

        const shadowAlpha = VisualConfig.SHADOW_ALPHA * scale; 
        this.shadowGraphics.fillStyle(0x000000, shadowAlpha);
        this.shadowGraphics.fillCircle(seg.x + shadowOffset, seg.y + shadowOffset, radius);
    }
  }

  destroy() {
    this.headGraphics.destroy();
    this.bodyGraphics.destroy();
    this.shadowGraphics.destroy();
  }
}
