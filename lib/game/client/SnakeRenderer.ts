// client/src/SnakeRenderer.ts
import * as Phaser from 'phaser';
import { PhysicsConfig, VisualConfig, calculateLODLevel } from '../core/Physics';
import { Player, SnakeSegment } from './ClientState';

interface IPlayerWithRadius extends Player {
  radius: number;
}
export interface ISnakeState  {
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
  private debugGraphics: Phaser.GameObjects.Graphics;
  private snake: Player;
  private isLocal: boolean;
  private predictedPose: { x: number; y: number; angle: number } | null = null;

  private isVisibleFlag = true;
  private lastVisibilityCheck = 0;
  private readonly VISIBILITY_CHECK_INTERVAL = 500;

  // Visual polish: Shadow
  private shadowGraphics: Phaser.GameObjects.Graphics;

  // Visual State
  public displayX: number = 0;
  public displayY: number = 0;
  public displayAngle: number = 0;
  
  private displaySegments: { x: number, y: number }[] = [];
  private debugDraw: boolean = false;
  private headTailText!: Phaser.GameObjects.Text;

  private effectiveLength: number = 10;
  private maxVisualSegments: number = 200;
  private visualSpacing: number = PhysicsConfig.SEGMENT_DISTANCE;
  private readonly SEGMENT_SPACING_FACTOR = 0.75;

  private snapshotBuffer: { t: number; x: number; y: number; angle: number }[] = [];
  private readonly INTERPOLATION_DELAY_MS = 30;
  private readonly MAX_SNAPSHOTS = 60;
  private lastBufferedX = NaN;
  private lastBufferedY = NaN;
  private lastBufferedAngle = NaN;

  // LOD System
  private currentLODLevel: number = 0;
  private lastDistanceCheck: number = 0;
  private readonly DISTANCE_CHECK_INTERVAL = 1000; // ms

  private renderCache: { x: number; y: number; radius: number; stripe: boolean; color: number }[] = [];
  private cacheDirty = true;
  private scaledRenderRadius: number = VisualConfig.RENDER_RADIUS;

  private resetSegmentsFromHead(x: number, y: number, angle: number) {
    const backX = -Math.cos(angle);
    const backY = -Math.sin(angle);
    const spacing = PhysicsConfig.SEGMENT_DISTANCE * this.SEGMENT_SPACING_FACTOR;

    for (let i = 0; i < this.displaySegments.length; i++) {
      this.displaySegments[i].x = x + backX * spacing * i;
      this.displaySegments[i].y = y + backY * spacing * i;
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

  // Calculate distance from camera
  private calculateDistanceFromCamera(): number {
    if (!this.scene.cameras.main) return 0;
    
    const cameraX = this.scene.cameras.main.scrollX + this.scene.cameras.main.width / 2;
    const cameraY = this.scene.cameras.main.scrollY + this.scene.cameras.main.height / 2;
    
    return Phaser.Math.Distance.Between(
      this.displayX, this.displayY,
      cameraX, cameraY
    );
  }

  private isInCameraView(x: number, y: number, margin: number): boolean {
    const view = this.scene.cameras.main?.worldView;
    if (!view) return true;
    return (
      x >= view.x - margin &&
      x <= view.x + view.width + margin &&
      y >= view.y - margin &&
      y <= view.y + view.height + margin
    );
  }

  // Update LOD level based on distance and snake size
  private updateLODLevel() {
    const now = Date.now();
    if (now - this.lastDistanceCheck < this.DISTANCE_CHECK_INTERVAL) {
      return;
    }
    
    this.lastDistanceCheck = now;
    const distance = this.calculateDistanceFromCamera();
    const segmentCount = this.effectiveLength;
    
    // Base LOD from distance
    let lod = calculateLODLevel(distance, segmentCount);
    
    // Adjust LOD based on snake size
    if (segmentCount > 10000) lod = Math.max(lod, 2);
    if (segmentCount > 50000) lod = Math.max(lod, 3);
    if (segmentCount > 100000) lod = Math.max(lod, 4);
    
    this.currentLODLevel = lod;
  }

  private getRenderStep(): number {
    const totalSegments = this.displaySegments.length;
    if (totalSegments > 800) return 8;
    if (totalSegments > 400) return 4;
    if (totalSegments > 200) return 2;
    return 1;
  }
  // Get segments to render based on LOD
  private getSegmentsToRender(): {x: number, y: number}[] {
    const totalSegments = this.displaySegments.length;
    const renderStep = this.getRenderStep();
    const segments: {x: number, y: number}[] = [];
    const margin = this.scaledRenderRadius * 2;

    if (totalSegments > 0) {
      segments.push({ x: this.displayX, y: this.displayY });
    }

    for (let i = renderStep; i < totalSegments - 1; i += renderStep) {
      const seg = this.displaySegments[i];
      if (this.isInCameraView(seg.x, seg.y, margin)) {
        segments.push(seg);
      }
    }

    if (totalSegments > 1) {
      segments.push(this.displaySegments[totalSegments - 1]);
    }
    
    return segments;
  }

  constructor(scene: Phaser.Scene, snake: Player, isLocal: boolean) {
    this.scene = scene;
    this.snake = snake;
    this.isLocal = isLocal;
    this.snake = snake as IPlayerWithRadius;

    // Initialize display state
    this.displayX = snake.x;
    this.displayY = snake.y;
    this.displayAngle = snake.angle;

    this.snapshotBuffer.push({ t: 0, x: snake.x, y: snake.y, angle: snake.angle });

    // Layering: Shadow < Body < Head
    this.shadowGraphics = scene.add.graphics();
    this.shadowGraphics.setDepth(5);
    this.shadowGraphics.setAlpha(0.3);
    this.shadowGraphics.setVisible(false);

    this.bodyGraphics = scene.add.graphics();
    this.bodyGraphics.setDepth(10);

    this.headGraphics = scene.add.graphics();
    this.headGraphics.setDepth(11);
    this.debugGraphics = scene.add.graphics();
    this.debugGraphics.setDepth(12);
    this.headTailText = scene.add.text(0, 0, "", { fontFamily: "monospace", fontSize: "12px", color: "#ffffff" });
    this.headTailText.setDepth(13);
    this.debugGraphics.setVisible(false);
    this.headTailText.setVisible(false);
  }

  attachTo(container: Phaser.GameObjects.Container) {
    container.add(this.shadowGraphics);
    container.add(this.bodyGraphics);
    container.add(this.headGraphics);
    container.add(this.debugGraphics);
    container.add(this.headTailText);
  }

  setPredictedPose(pose: { x: number; y: number; angle: number } | null) {
    this.predictedPose = pose;
  }

  setScaledRenderRadius(radius: number) {
    this.scaledRenderRadius = radius;
  }

  isVisible(): boolean {
    const now = Date.now();
    if (now - this.lastVisibilityCheck < this.VISIBILITY_CHECK_INTERVAL) {
      return this.isVisibleFlag;
    }

    this.lastVisibilityCheck = now;
    const camera = this.scene.cameras.main;
    if (!camera) {
      this.isVisibleFlag = true;
      return true;
    }

    const margin = this.scaledRenderRadius * 2;
    this.isVisibleFlag =
      this.displayX >= camera.worldView.x - margin &&
      this.displayX <= camera.worldView.x + camera.worldView.width + margin &&
      this.displayY >= camera.worldView.y - margin &&
      this.displayY <= camera.worldView.y + camera.worldView.height + margin;

    return this.isVisibleFlag;
  }

  update() {
    try {
      if (!this.snake.alive) {
        this.clear();
        return;
      }

      if (!this.isVisible() && !this.isLocal) {
        this.clear();
        return;
      }

      this.effectiveLength = Math.max(10, Math.floor((this.snake as any).length || 10));
      const visualSegmentCount = Math.min(
        this.maxVisualSegments,
        Math.max(10, this.effectiveLength)
      );
      this.visualSpacing = PhysicsConfig.SEGMENT_DISTANCE * this.SEGMENT_SPACING_FACTOR;

      const now = (this.scene as any).time?.now ?? performance.now();
      this.bufferSnapshot(now);

      // Update LOD level
      this.updateLODLevel();

      const TURN_INTERPOLATION = 0.12;

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

      // INFINITE MAP: Increased threshold for smooth long-distance travel
      if (snapDist > 500) { // Increased from 300 for infinite map
        const catchupSpeed = 0.5;
        this.displayX = Phaser.Math.Linear(this.displayX, target.x, catchupSpeed);
        this.displayY = Phaser.Math.Linear(this.displayY, target.y, catchupSpeed);
        this.displayAngle = target.angle;

        if (this.displaySegments.length > 0) {
          this.resetSegmentsFromHead(this.displayX, this.displayY, this.displayAngle);
        }
      } else {
        // ==================================================
        // 1. HEAD-ONLY INTERPOLATION
        // ==================================================
        const isBoosting = this.snake.isBoosting;
        const baseLerp = isBoosting ? 0.18 : 0.08;
        const catchupLerp = isBoosting ? 0.32 : 0.18;
        
        const dynamicT = snapDist > 50 ? catchupLerp : baseLerp;
        
        const remoteLerp = 0.2;
        this.displayX = Phaser.Math.Linear(this.displayX, target.x, this.isLocal ? dynamicT : remoteLerp);
        this.displayY = Phaser.Math.Linear(this.displayY, target.y, this.isLocal ? dynamicT : remoteLerp);
        this.displayAngle = Phaser.Math.Angle.RotateTo(
          this.displayAngle,
          target.angle,
          this.isLocal ? TURN_INTERPOLATION : TURN_INTERPOLATION * 2
        );
      }

      // ==================================================
      // 2. SYNC SEGMENT COUNT
      // ==================================================
      while (this.displaySegments.length < visualSegmentCount) {
        const tailPos = this.displaySegments.length > 0 ? 
          { ...this.displaySegments[this.displaySegments.length - 1] } : 
          { x: this.displayX, y: this.displayY };
        this.displaySegments.push({ x: tailPos.x, y: tailPos.y });
      }
      while (this.displaySegments.length > visualSegmentCount) {
        this.displaySegments.pop();
      }

      // ==================================================
      // 3. Hard Segment Constraint Solver (No Smoothing)
      // ==================================================
      if (this.displaySegments.length > 0) {
        this.displaySegments[0].x = this.displayX;
        this.displaySegments[0].y = this.displayY;

        for (let i = 1; i < this.displaySegments.length; i++) {
          const prev = this.displaySegments[i - 1];
          const curr = this.displaySegments[i];

          let dx = curr.x - prev.x;
          let dy = curr.y - prev.y;

          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist === 0) {
            curr.x = prev.x;
            curr.y = prev.y;
            continue;
          }

          const nx = dx / dist;
          const ny = dy / dist;

          const spacing = this.visualSpacing;

          curr.x = prev.x + nx * spacing;
          curr.y = prev.y + ny * spacing;
        }
      }

      // ==================================================
      // 4. RENDER WITH LOD
      // ==================================================
      this.cacheDirty = true;
      
      // Skip rendering if too far (LOD level 3+)
      if (this.currentLODLevel >= 3 && this.calculateDistanceFromCamera() > VisualConfig.LOD_DISTANCE_FAR) {
        this.clear();
        return;
      }
      
      this.drawBody();
      this.drawHead();
      if (this.debugDraw) {
        this.drawDebug();
      }

    } catch (e) {
      console.error("SnakeRenderer Update Error:", e);
    }
  }

  private clear() {
    this.headGraphics.clear();
    this.bodyGraphics.clear();
    this.shadowGraphics.clear();
    this.debugGraphics.clear();
    this.headTailText.setText("");
    this.headTailText.setVisible(false);
  }

  private drawHead() {
    this.headGraphics.clear();
    const nearHeadBodyRadius =
      this.renderCache.length > 0 ? this.renderCache[this.renderCache.length - 1].radius : (this.snake.radius || 4);
    const r = nearHeadBodyRadius * 1.08;
    
    const skinId = this.snake.skin || 0;
    const baseSkin = SnakeRenderer.SKINS[skinId % SnakeRenderer.SKINS.length];
    const obsidian = SnakeRenderer.OBSIDIAN_SOVEREIGN;

    const shellColor = this.isLocal ? obsidian.main : baseSkin.main; 

    if (this.isLocal) {
      this.headGraphics.setBlendMode(Phaser.BlendModes.ADD);
      this.headGraphics.fillStyle(obsidian.outline, 0.14);
      this.headGraphics.fillCircle(this.displayX, this.displayY, r + 3);
      this.headGraphics.fillStyle(obsidian.core, 0.18);
      this.headGraphics.fillCircle(this.displayX, this.displayY, r * 0.75);
      this.headGraphics.setBlendMode(Phaser.BlendModes.NORMAL);
    }

    // 1. Draw Round Head
    this.headGraphics.fillStyle(shellColor, 1);
    this.headGraphics.fillCircle(this.displayX, this.displayY, r);

    // 2. Draw Eyes (Whites)
    const angle = this.displayAngle;
    const eyeOffsetX = r * 0.4;
    const eyeOffsetY = r * 0.35;
    const eyeRadius = r * 0.35;
    const eyeColor = 0xFFFFFF;

    const leftEyeX = this.displayX + eyeOffsetX * Math.cos(angle) - (-eyeOffsetY) * Math.sin(angle);
    const leftEyeY = this.displayY + eyeOffsetX * Math.sin(angle) + (-eyeOffsetY) * Math.cos(angle);
    
    const rightEyeX = this.displayX + eyeOffsetX * Math.cos(angle) - (eyeOffsetY) * Math.sin(angle);
    const rightEyeY = this.displayY + eyeOffsetX * Math.sin(angle) + (eyeOffsetY) * Math.cos(angle);

    this.headGraphics.fillStyle(eyeColor, 1);
    this.headGraphics.fillCircle(leftEyeX, leftEyeY, eyeRadius);
    this.headGraphics.fillCircle(rightEyeX, rightEyeY, eyeRadius);

    // 3. Draw Pupils (Black)
    const pupilRadius = eyeRadius * 0.5;
    const pupilColor = 0x000000;
    const pupilOffset = eyeRadius * 0.2;

    const pupilLX = leftEyeX + pupilOffset * Math.cos(angle);
    const pupilLY = leftEyeY + pupilOffset * Math.sin(angle);
    const pupilRX = rightEyeX + pupilOffset * Math.cos(angle);
    const pupilRY = rightEyeY + pupilOffset * Math.sin(angle);

    this.headGraphics.fillStyle(pupilColor, 1);
    this.headGraphics.fillCircle(pupilLX, pupilLY, pupilRadius);
    this.headGraphics.fillCircle(pupilRX, pupilRY, pupilRadius);

    // 4. Draw Ears (Small circles at ±radius perpendicular offset)
    const earRadius = r * 0.2;
    const earColor = shellColor;
    const earOffset = r * 0.8;
    
    const leftEarX = this.displayX + earOffset * Math.cos(angle - Math.PI/2);
    const leftEarY = this.displayY + earOffset * Math.sin(angle - Math.PI/2);
    
    const rightEarX = this.displayX + earOffset * Math.cos(angle + Math.PI/2);
    const rightEarY = this.displayY + earOffset * Math.sin(angle + Math.PI/2);
    
    this.headGraphics.fillStyle(earColor, 1);
    this.headGraphics.fillCircle(leftEarX, leftEarY, earRadius);
    this.headGraphics.fillCircle(rightEarX, rightEarY, earRadius);
    
    // 5. Draw Mouth (Red circle at head front)
    const mouthColor = this.isLocal ? obsidian.core : 0xFF0000;
    const mouthWidth = r * 0.15;
    const mouthOffset = r * 0.6;
    
    const mouthX = this.displayX + mouthOffset * Math.cos(angle);
    const mouthY = this.displayY + mouthOffset * Math.sin(angle);
    
    this.headGraphics.fillStyle(mouthColor, 1);
    this.headGraphics.fillCircle(mouthX, mouthY, mouthWidth);
  }

  // SKIN PALETTES
  private static SKINS = [
    { main: 0x525252, stripe: 0x737373, outline: 0x262626 }, // 0: Grey (Default)
    { main: 0xE74C3C, stripe: 0xC0392B, outline: 0x922B21 }, // 1: Red
    { main: 0x3498DB, stripe: 0x2980B9, outline: 0x1F618D }, // 2: Blue
    { main: 0x2ECC71, stripe: 0x27AE60, outline: 0x1E8449 }, // 3: Green
    { main: 0xF1C40F, stripe: 0xF39C12, outline: 0xB7950B }, // 4: Yellow
    { main: 0x9B59B6, stripe: 0x8E44AD, outline: 0x6C3483 }, // 5: Purple
  ];

  private static OBSIDIAN_SOVEREIGN = {
    main: 0x0b1020,
    stripe: 0x121a2e,
    outline: 0x6d28d9,
    core: 0x22d3ee,
  };

  private drawBody() {
    if (this.cacheDirty) {
      this.updateRenderCache();
      this.cacheDirty = false;
    }

    this.bodyGraphics.clear();
    if (this.isLocal) {
      const skin = SnakeRenderer.OBSIDIAN_SOVEREIGN;

      this.bodyGraphics.setBlendMode(Phaser.BlendModes.ADD);
      this.bodyGraphics.fillStyle(skin.outline, 0.12);
      for (const segment of this.renderCache) {
        this.bodyGraphics.fillCircle(segment.x, segment.y, segment.radius + 2);
      }

      this.bodyGraphics.fillStyle(skin.core, 0.35);
      for (const segment of this.renderCache) {
        this.bodyGraphics.fillCircle(segment.x, segment.y, segment.radius * 0.55);
      }
      this.bodyGraphics.setBlendMode(Phaser.BlendModes.NORMAL);

      for (const segment of this.renderCache) {
        this.bodyGraphics.fillStyle(segment.stripe ? skin.stripe : skin.main, 1);
        this.bodyGraphics.fillCircle(segment.x, segment.y, segment.radius);
      }
      return;
    }

    for (const segment of this.renderCache) {
      this.bodyGraphics.fillStyle(segment.color, 1);
      this.bodyGraphics.fillCircle(segment.x, segment.y, segment.radius);
    }
  }

  private updateRenderCache() {
    this.renderCache.length = 0;
    const segmentsToRender = this.getSegmentsToRender();
    if (segmentsToRender.length <= 1) return;

    const skinId = this.snake.skin || 0;
    const skin = SnakeRenderer.SKINS[skinId % SnakeRenderer.SKINS.length];
    const color1 = skin.main;
    const color2 = skin.stripe;
    const baseRadius = this.snake.radius || 4;

    for (let i = segmentsToRender.length - 1; i >= 1; i--) {
      const seg = segmentsToRender[i];
      const t = i / Math.max(1, segmentsToRender.length - 1);

      const taperStart = VisualConfig.TAIL_TAPER_START;
      let taperT = (t - taperStart) / (1 - taperStart);
      taperT = Math.min(1, Math.max(0, taperT));
      const smoothT = 1 - (1 - taperT) * (1 - taperT);
      const scale = 1 - smoothT * (1 - VisualConfig.TAIL_MIN_SCALE);

      const segmentRadius = baseRadius * scale;
      const isStripe = Math.floor(i / 2) % 2 === 0;

      this.renderCache.push({
        x: seg.x,
        y: seg.y,
        radius: segmentRadius,
        stripe: isStripe,
        color: isStripe ? color1 : color2,
      });
    }
  }

  private drawShadows() {
    return;
  }

  destroy() {
    this.headGraphics.destroy();
    this.bodyGraphics.destroy();
    this.shadowGraphics.destroy();
    this.debugGraphics.destroy();
    this.headTailText.destroy();
  }

  setDebugDraw(enabled: boolean) {
    this.debugDraw = false;
    this.debugGraphics.setVisible(false);
    this.headTailText.setVisible(false);
  }

  private drawDebug() {
    const r = this.scaledRenderRadius;
    this.debugGraphics.lineStyle(2, 0xff0000, 1);
    this.debugGraphics.strokeCircle(this.displayX, this.displayY, r);
    const hi = (this.snake as any).headIndex;
    const ti = (this.snake as any).tailIndex;
    if (Number.isFinite(hi) && Number.isFinite(ti)) {
      this.headTailText.setText(`H:${hi} T:${ti}`);
      this.headTailText.setPosition(this.displayX + r + 10, this.displayY - r - 10);
      this.headTailText.setVisible(true);
    } else {
      this.headTailText.setVisible(false);
    }
    const segs = (this.snake as any).segments as SnakeSegment[] | undefined;
    const thick = Math.max(2, r * 2);
    if (segs && segs.length > 1) {
      this.debugGraphics.lineStyle(thick, 0x00ff00, 0.4);
      for (let i = 0; i < segs.length - 1; i++) {
        const a = segs[i];
        const b = segs[i + 1];
        const line = new Phaser.Geom.Line(a.x, a.y, b.x, b.y);
        this.debugGraphics.strokeLineShape(line);
      }
      return;
    }
    if (this.displaySegments.length > 1) {
      this.debugGraphics.lineStyle(thick, 0x00ff00, 0.4);
      for (let i = 0; i < this.displaySegments.length - 1; i++) {
        const a = this.displaySegments[i];
        const b = this.displaySegments[i + 1];
        const line = new Phaser.Geom.Line(a.x, a.y, b.x, b.y);
        this.debugGraphics.strokeLineShape(line);
      }
    }
  }
}
