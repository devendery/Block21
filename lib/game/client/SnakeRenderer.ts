import Phaser from 'phaser';
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
  
  // Visual polish: Shadow
  private shadowGraphics: Phaser.GameObjects.Graphics;

  // Interpolation State
  public displayX: number = 0;
  public displayY: number = 0;
  public displayAngle: number = 0;
  private displaySegments: { x: number, y: number }[] = [];

  constructor(scene: Phaser.Scene, snake: Player) { // Use actual schema type
    this.scene = scene;
    this.snake = snake;

    // Initialize display state
    this.displayX = snake.x;
    this.displayY = snake.y;
    this.displayAngle = snake.angle;

    // Layering: Shadow < Body < Head
    this.shadowGraphics = scene.add.graphics();
    this.shadowGraphics.setDepth(5);
    this.shadowGraphics.setAlpha(0.3);

    this.bodyGraphics = scene.add.graphics();
    this.bodyGraphics.setDepth(10);

    this.headGraphics = scene.add.graphics();
    this.headGraphics.setDepth(11);
  }

  update() {
    try {
        // Interpolation Factor (0.0 - 1.0)
        // Lower = Smoother but more lag (0.1)
        // Higher = Snappier but more jitter (0.5)
        // 0.3 is a good balance for 20-60Hz
        const t = 0.3; 

        // Teleport Detection (Respawn)
        const dist = Phaser.Math.Distance.Between(this.displayX, this.displayY, this.snake.x, this.snake.y);
        if (dist > 100) { // Lower threshold to catch shorter respawn jumps
            // Snap immediately if distance is too large (teleport/respawn)
            this.displayX = this.snake.x;
            this.displayY = this.snake.y;
            this.displayAngle = this.snake.angle;
            
            // Also snap segments
            this.displaySegments = []; // Clear current display segments
            for (let i = 0; i < this.snake.segments.length; i++) {
                this.displaySegments.push({ x: this.snake.segments[i].x, y: this.snake.segments[i].y });
            }
        } else {
            // Interpolate normally
            this.displayX = Phaser.Math.Linear(this.displayX, this.snake.x, t);
            this.displayY = Phaser.Math.Linear(this.displayY, this.snake.y, t);
            this.displayAngle = Phaser.Math.Angle.RotateTo(this.displayAngle, this.snake.angle, t);
        }

        // Sync Segment Count
        while (this.displaySegments.length < this.snake.segments.length) {
            const i = this.displaySegments.length;
            // Init new segment at target position to avoid flying in from (0,0)
            const targetSeg = this.snake.segments[i];
            // Safety check for targetSeg
            if (targetSeg) {
                this.displaySegments.push({ x: targetSeg.x, y: targetSeg.y });
            } else {
                 // Fallback if segment missing (shouldn't happen)
                 this.displaySegments.push({ x: this.displayX, y: this.displayY });
            }
        }
        while (this.displaySegments.length > this.snake.segments.length) {
            this.displaySegments.pop();
        }

        // Interpolate Segments
        for (let i = 0; i < this.snake.segments.length; i++) {
            const target = this.snake.segments[i];
            const current = this.displaySegments[i];
            if (target && current) {
                current.x = Phaser.Math.Linear(current.x, target.x, t);
                current.y = Phaser.Math.Linear(current.y, target.y, t);
            }
        }

        this.clear();
        this.drawShadows();
        this.drawBody();
        this.drawHead();
    } catch (e) {
        console.error("SnakeRenderer Update Error:", e);
    }
  }

  private clear() {
    this.headGraphics.clear();
    this.bodyGraphics.clear();
    this.shadowGraphics.clear();
  }

  private drawHead() {
    // Style: Premium Energy Core (Dark Matte Shell + Neon Glow)
    // COLOR CHANGE: Using "Obsidian Sovereign" Brand Colors
    // Primary Grey: #525252 (0x525252)
    // Secondary Grey: #262626 (0x262626)
    // Accent Red: #FF0033 (0xFF0033)
    
    const shellColor = 0x525252; // Primary Brand Grey
    // Boost Visual: Brighter Red when boosting
    // We don't have access to input state here directly, but we can infer from speed?
    // Or pass it in. For now, let's just use alive state.
    // Ideally Snake class should have isBoosting property.
    
    // Quick Fix: Check speed to determine boost visual
    const isBoosting = this.snake.isBoosting;
    
    const baseCoreColor = 0xFF0033;
    const boostCoreColor = 0xFF5577; // Brighter/Whiter Red
    const coreColor = this.snake.alive ? (isBoosting ? boostCoreColor : baseCoreColor) : 0x555555;
    
    const outlineColor = 0x262626; // Secondary Brand Grey for contrast
    
    // 1. Remove Outer Glow (Clean look)
    
    // 2. Matte Shell (Main Head Shape)
    // CHANGE: Use Hexagon/Angular shape for distinct "Mecha" look
    this.headGraphics.fillStyle(shellColor, 1);
    
    // Draw Hexagon Head
    const r = VisualConfig.RENDER_RADIUS;
    const angle = this.displayAngle; // USE INTERPOLATED ANGLE
    
    // Points for a "Coffin" or "Hex" shape pointing forward
    const points = [
        { x: r * 1.2, y: 0 },      // Nose (Forward)
        { x: r * 0.5, y: -r },     // Top Front
        { x: -r * 0.5, y: -r },    // Top Back
        { x: -r, y: 0 },           // Back Center
        { x: -r * 0.5, y: r },     // Bottom Back
        { x: r * 0.5, y: r }       // Bottom Front
    ];
    
    // Rotate and Translate points
    const rotatedPoints = points.map(p => {
        return {
            x: this.displayX + p.x * Math.cos(angle) - p.y * Math.sin(angle), // USE INTERPOLATED POS
            y: this.displayY + p.x * Math.sin(angle) + p.y * Math.cos(angle)
        };
    });
    
    this.headGraphics.beginPath();
    this.headGraphics.moveTo(rotatedPoints[0].x, rotatedPoints[0].y);
    for (let i = 1; i < rotatedPoints.length; i++) {
        this.headGraphics.lineTo(rotatedPoints[i].x, rotatedPoints[i].y);
    }
    this.headGraphics.closePath();
    this.headGraphics.fillPath();
    
    // Add Outline for Contrast against Black BG
    this.headGraphics.lineStyle(2, outlineColor, 1);
    this.headGraphics.strokePath();

    // 3. Inner Energy Core (Diamond Shape)
    this.headGraphics.fillStyle(coreColor, 1); // Full brightness for core
    const coreR = r * 0.5;
    const corePoints = [
        { x: coreR * 1.5, y: 0 },
        { x: 0, y: -coreR },
        { x: -coreR, y: 0 },
        { x: 0, y: coreR }
    ];
    const rotatedCore = corePoints.map(p => {
        return {
            x: this.displayX + p.x * Math.cos(angle) - p.y * Math.sin(angle),
            y: this.displayY + p.x * Math.sin(angle) + p.y * Math.cos(angle)
        };
    });
    
    this.headGraphics.beginPath();
    this.headGraphics.moveTo(rotatedCore[0].x, rotatedCore[0].y);
    for (let i = 1; i < rotatedCore.length; i++) {
        this.headGraphics.lineTo(rotatedCore[i].x, rotatedCore[i].y);
    }
    this.headGraphics.closePath();
    this.headGraphics.fillPath();

    // Eyes (Sleek Cyber/Robotic Style)
    // Less aggressive, more "high-tech" look
    const eyeOffset = 12;
    const eyeRadius = 4;
    
    // Calculate eye positions
    const leftEyeX = this.displayX + Math.cos(angle - 0.6) * eyeOffset;
    const leftEyeY = this.displayY + Math.sin(angle - 0.6) * eyeOffset;
    const rightEyeX = this.displayX + Math.cos(angle + 0.6) * eyeOffset;
    const rightEyeY = this.displayY + Math.sin(angle + 0.6) * eyeOffset;

    // Outer Eye Ring (Dark Metal)
    this.headGraphics.fillStyle(0x000000, 1);
    this.headGraphics.fillCircle(leftEyeX, leftEyeY, eyeRadius + 1);
    this.headGraphics.fillCircle(rightEyeX, rightEyeY, eyeRadius + 1);

    // Inner Glowing Eye (Cyber Blue/White)
    this.headGraphics.fillStyle(0xFFFFFF, 1); // Bright core
    this.headGraphics.fillCircle(leftEyeX, leftEyeY, eyeRadius);
    this.headGraphics.fillCircle(rightEyeX, rightEyeY, eyeRadius);
    
    // Tint the eye slightly with the core color
    this.headGraphics.fillStyle(coreColor, 0.5);
    this.headGraphics.fillCircle(leftEyeX, leftEyeY, eyeRadius);
    this.headGraphics.fillCircle(rightEyeX, rightEyeY, eyeRadius);

    // Pupil (Black Center)
    this.headGraphics.fillStyle(0x000000, 0.9);
    // Slight offset for "focused" look
    const pupilR = eyeRadius * 0.4;
    const pOffsetX = Math.cos(angle) * 1.5;
    const pOffsetY = Math.sin(angle) * 1.5;
    this.headGraphics.fillCircle(leftEyeX + pOffsetX, leftEyeY + pOffsetY, pupilR);
    this.headGraphics.fillCircle(rightEyeX + pOffsetX, rightEyeY + pOffsetY, pupilR);

    // Eye Highlight (Sparkle) - Top Left
    this.headGraphics.fillStyle(0xFFFFFF, 0.9);
    const hOffsetX = -1.5;
    const hOffsetY = -1.5;
    const highlightR = 1.5;
    this.headGraphics.fillCircle(leftEyeX + hOffsetX, leftEyeY + hOffsetY, highlightR);
    this.headGraphics.fillCircle(rightEyeX + hOffsetX, rightEyeY + hOffsetY, highlightR);
  }

  // Helper for rotated rectangles (eyes) - REMOVED as we switched to circle eyes
  /* private drawRotatedRect... */

  private drawBody() {
    // Style: Premium Energy Core
    const shellColor = 0x525252; 
    
    // Boost Visual Logic (Same as Head)
    const isBoosting = this.snake.speed > PhysicsConfig.BASE_SPEED + 10;
    const baseCoreColor = 0xFF0033;
    const boostCoreColor = 0xFF5577;
    const coreColor = this.snake.alive ? (isBoosting ? boostCoreColor : baseCoreColor) : 0x555555;
    
    const outlineColor = 0x262626;
    
    const totalSegments = this.displaySegments.length; // Use displaySegments
    
    for (let i = totalSegments - 1; i >= 0; i--) {
      const seg = this.displaySegments[i]; // Use displaySegments
      
      // Calculate Tapering (Quadratic Ease-Out)
      // Start of visual tapering (index-based)
      const taperStartIndex = Math.floor(totalSegments * VisualConfig.TAIL_TAPER_START);

      // Normalized progress from 0 → 1
      let t = (i - taperStartIndex) / (totalSegments - taperStartIndex);
      t = Math.min(1, Math.max(0, t)); // safety clamp

      // TRUE quadratic ease-out (organic tail)
      // EaseOutQuad: 1 - (1 - t)^2
      const smoothT = 1 - (1 - t) * (1 - t);

      // Final visual scale
      const scale = 1 - smoothT * (1 - VisualConfig.TAIL_MIN_SCALE);
      
      const radius = VisualConfig.RENDER_RADIUS * scale;

      // 1. Matte Shell
      this.bodyGraphics.fillStyle(shellColor, 1);
      this.bodyGraphics.fillCircle(seg.x, seg.y, radius);
      
      // 1b. Shell Outline (Contrast against Black BG)
      this.bodyGraphics.lineStyle(1, outlineColor, 0.8);
      this.bodyGraphics.strokeCircle(seg.x, seg.y, radius);

      // 2. Inner Energy Core
      // Core fades out near the tail
      const coreOpacity = Math.max(0.2, 1 - (i / totalSegments));
      this.bodyGraphics.fillStyle(coreColor, coreOpacity);
      this.bodyGraphics.fillCircle(seg.x, seg.y, radius * 0.5);
    }
  }

  private drawShadows() {
    this.shadowGraphics.fillStyle(0x000000, VisualConfig.SHADOW_ALPHA); // Darker shadow for high contrast
    const shadowOffset = 10; 
    
    // Head Shadow
    this.shadowGraphics.fillCircle(this.displayX + shadowOffset, this.displayY + shadowOffset, VisualConfig.RENDER_RADIUS);

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
