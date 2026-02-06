/**
 * PHASE-1 ARCHITECTURE FROZEN
 *
 * Boundary Rules:
 * 1. This file OWNS Phaser, Colyseus, Input, Rendering.
 * 2. NO React imports allowed.
 * 3. NO UI logic allowed.
 * 4. Communication to UI via callbacks only.
 */

import type { Room } from "colyseus.js";
import type { Game } from "phaser";
import { vectorPool } from "../shared/utils/ObjectPool";

/* =========================================================
   CONSTANTS
========================================================= */

export const SKIN_OPTIONS = ["classic", "neon", "magma", "toxic", "void", "scales", "custom"] as const;
export const EYES_OPTIONS = ["cat", "round", "angry"] as const;
export const MOUTH_OPTIONS = ["tongue", "smile", "fangs"] as const;

export const SKIN_PALETTES: Record<
  (typeof SKIN_OPTIONS)[number],
  { primary: number; secondary: number; outline: number; eye: number; pupil: number; tongue: number }
> = {
  classic: { primary: 0x3aff9e, secondary: 0x1b8f32, outline: 0x0b1020, eye: 0xffffff, pupil: 0x0b1020, tongue: 0xff6b6b },
  neon: { primary: 0x4fc3f7, secondary: 0x2563eb, outline: 0x0b1020, eye: 0xffffff, pupil: 0x0b1020, tongue: 0xff6b6b },
  magma: { primary: 0xffa94d, secondary: 0xffe066, outline: 0x0b1020, eye: 0xffffff, pupil: 0x0b1020, tongue: 0xff6b6b },
  toxic: { primary: 0x9c6bff, secondary: 0xc4b5fd, outline: 0x0b1020, eye: 0xffffff, pupil: 0x0b1020, tongue: 0xff6b6b },
  void: { primary: 0x0f172a, secondary: 0x5eead4, outline: 0x0b1020, eye: 0xe5e7eb, pupil: 0x0b1020, tongue: 0xff6b6b },
  scales: { primary: 0x5eead4, secondary: 0x3aff9e, outline: 0x0b1020, eye: 0xffffff, pupil: 0x0b1020, tongue: 0xff6b6b },
  custom: { primary: 0x7c3aed, secondary: 0x22c55e, outline: 0x0b1020, eye: 0xffffff, pupil: 0x0b1020, tongue: 0xef4444 },
};

/* =========================================================
   TYPES
========================================================= */

export type GameRuntimeOptions = {
  container: HTMLElement;
  wsUrl: string;
  roomName: string;
  joinOptions: any;
  onStats?: (s: any) => void;
  onStatus?: (s: "connecting" | "playing" | "over" | "error") => void;
  onGameOver?: (r: any) => void;
  onRewardIndicator?: (a: string) => void;
};

type SnakeRoomState = {
  players: any;
  foods?: any;
};

/* =========================================================
   SINGLETON
========================================================= */

let activeRuntime: GameRuntimeInstance | null = null;

export function startGame(opts: GameRuntimeOptions) {
  activeRuntime?.destroy();
  activeRuntime = new GameRuntimeInstance(opts);
  activeRuntime.launch();
}

export function stopGame() {
  activeRuntime?.destroy();
  activeRuntime = null;
}

/* =========================================================
   RUNTIME
========================================================= */

class GameRuntimeInstance {
  private game: Game | null = null;
  private room: Room<SnakeRoomState> | null = null;

  constructor(private opts: GameRuntimeOptions) {}

  async launch() {
    const [{ Client }, { default: Phaser }] = await Promise.all([
      import("colyseus.js"),
      import("phaser"),
    ]);

    const client = new Client(this.opts.wsUrl);
    this.room = await client.joinOrCreate(this.opts.roomName, this.opts.joinOptions);

    const room = this.room;
    const baseGrid = 18;
    const onStatsCallback = this.opts.onStats; // Store callback for use in MainScene

    class MainScene extends Phaser.Scene {
      dummyCam!: Phaser.GameObjects.Image;
      private canvasTexture!: Phaser.Textures.CanvasTexture;
      private ctx!: CanvasRenderingContext2D;
      private lastRenderTime = 0;
      private readonly renderInterval = 1000 / 30;
      private readonly maxSegmentBatch = 600;
      private segX = new Float32Array(this.maxSegmentBatch);
      private segY = new Float32Array(this.maxSegmentBatch);
      private segR = new Float32Array(this.maxSegmentBatch);
      private segStripe = new Uint8Array(this.maxSegmentBatch);
      private segOutline = new Uint8Array(this.maxSegmentBatch);

      visuals = new Map<
        string,
        {
          x: number;
          y: number;
          angle: number;
          lastAngle: number;
          turnIntensity: number;
          relaxAllowed: boolean;
          history: { x: number; y: number }[];
          frozenHistory: { x: number; y: number }[];
          radius: number;
          skin: number;
        }
      >();

      // Worms Zone radius calculation
      private calculateSnakeRadius(segmentCount: number): number {
        const scaledRadius = segmentCount * 0.001;
        return Math.min(10, Math.max(4, scaledRadius));
      }

      create() {
        const { width, height } = this.scale.gameSize;
        const tex = this.textures.createCanvas("__B21_RENDER_CANVAS__", Math.max(1, width), Math.max(1, height));
        if (!tex) {
          throw new Error("Failed to create canvas texture");
        }
        this.canvasTexture = tex;
        this.ctx = this.canvasTexture.getContext();
        this.add.image(0, 0, "__B21_RENDER_CANVAS__").setOrigin(0, 0).setScrollFactor(0);

        this.dummyCam = this.add.image(0, 0, "__WHITE").setVisible(false);
        this.cameras.main.setRoundPixels(true);
        this.cameras.main.setZoom(1.05);
        this.cameras.main.startFollow(this.dummyCam, true, 0.1, 0.1);

        this.scale.on("resize", (gameSize: { width: number; height: number }) => {
          const w = Math.max(1, gameSize.width | 0);
          const h = Math.max(1, gameSize.height | 0);
          this.canvasTexture.setSize(w, h);
        });
      }

      private colorToCss(color: number): string {
        return `#${(color >>> 0).toString(16).padStart(6, "0")}`;
      }

      update(time: number) {
        if (!room?.state) return;

        const MAX_TURN_RATE = 0.12;

        let localVisual: any = null;
        let localPlayer: any = null;

        room.state.players.forEach((p: any, id: string) => {
          let v = this.visuals.get(id);
          if (!v) {
            v = {
              x: p.x,
              y: p.y,
              angle: p.angle,
              lastAngle: p.angle,
              turnIntensity: 0,
              relaxAllowed: true,
              history: [],
              frozenHistory: [],
              radius: this.calculateSnakeRadius(p.length || 0),
              skin: p.skin || 0,
            };
            for (let i = 0; i < 300; i++) {
              const pt = vectorPool.acquire();
              pt.x = p.x;
              pt.y = p.y;
              v.history.push(pt);
            }
            this.visuals.set(id, v);
          }

          v.radius = this.calculateSnakeRadius(p.length || 0);
          v.skin = p.skin || 0;

          /* ---- HEAD INTERPOLATION ONLY ---- */
          v.x += (p.x - v.x) * 0.18;
          v.y += (p.y - v.y) * 0.18;
          v.angle = Phaser.Math.Angle.RotateTo(v.angle, p.angle, MAX_TURN_RATE);

          /* ---- TURN DETECTION ---- */
          const dA = Phaser.Math.Angle.Wrap(v.angle - v.lastAngle);
          v.turnIntensity = Phaser.Math.Clamp(Math.abs(dA) / MAX_TURN_RATE, 0, 1);
          v.lastAngle = v.angle;

          /* ---- HISTORY ---- */
          const newPt = vectorPool.acquire();
          newPt.x = v.x;
          newPt.y = v.y;
          v.history.unshift(newPt);
          if (v.history.length > 300) {
            const old = v.history.pop();
            if (old) vectorPool.release(old);
          }

          if (id === room.sessionId) {
            this.dummyCam.setPosition(v.x * baseGrid, v.y * baseGrid);
            localVisual = v;
            localPlayer = p;
          }
        });

        if (localVisual && localPlayer && onStatsCallback) {
          onStatsCallback({
            score: localPlayer.score || 0,
            mass: localPlayer.mass || 0,
            length: localPlayer.length || 0,
            radius: localVisual.radius,
            alive: localPlayer.alive !== false,
          });
        }

        if (localPlayer) {
          const len = localPlayer.length || 0;
          const t = Math.min(1, Math.max(0, len / 500));
          const targetZoom = 1.1 - 0.1 * t;
          const cam = this.cameras.main;
          const nextZoom = cam.zoom + (targetZoom - cam.zoom) * 0.05;
          cam.setZoom(Math.max(1, Math.min(1.15, nextZoom)));
        }

        if (time - this.lastRenderTime < this.renderInterval) return;
        this.lastRenderTime = time;

        const cam = this.cameras.main;
        const w = this.canvasTexture.canvas.width;
        const h = this.canvasTexture.canvas.height;
        const zoom = cam.zoom || 1;
        const viewW = cam.width / zoom;
        const viewH = cam.height / zoom;
        const margin = 240;
        const leftBound = cam.scrollX - margin;
        const topBound = cam.scrollY - margin;
        const rightBound = cam.scrollX + viewW + margin;
        const bottomBound = cam.scrollY + viewH + margin;
        const centerX = cam.scrollX + viewW * 0.5;
        const centerY = cam.scrollY + viewH * 0.5;
        const far1 = Math.max(viewW, viewH) * 0.75;
        const far2 = Math.max(viewW, viewH) * 1.5;
        const far1Sq = far1 * far1;
        const far2Sq = far2 * far2;

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, w, h);
        this.ctx.setTransform(zoom, 0, 0, zoom, -cam.scrollX * zoom, -cam.scrollY * zoom);

        room.state.players.forEach((p: any, id: string) => {
          const v = this.visuals.get(id);
          if (!v) return;

          const headX = v.x * baseGrid;
          const headY = v.y * baseGrid;
          if (headX < leftBound || headX > rightBound || headY < topBound || headY > bottomBound) return;

          const ddx = headX - centerX;
          const ddy = headY - centerY;
          const distSq = ddx * ddx + ddy * ddy;

          if (v.turnIntensity < 0.3) {
            const turnFactor = Phaser.Math.Clamp((0.3 - v.turnIntensity) / 0.3, 0, 1);
            const baseStrength = 0.22 * turnFactor;
            const maxMove = 2.5;
            const relaxWindow = 300;
            for (let i = 2; i < Math.min(relaxWindow, v.history.length); i++) {
              const a = v.history[i - 2];
              const b = v.history[i - 1];
              const c = v.history[i];

              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const len = Math.hypot(dx, dy);
              if (len < 0.0001) continue;

              const nx = dx / len;
              const ny = dy / len;
              const tx = b.x + nx * 14;
              const ty = b.y + ny * 14;

              const decay = Math.exp(-i * 0.04);
              const strength = baseStrength * decay;
              c.x += Phaser.Math.Clamp((tx - c.x) * strength, -maxMove, maxMove);
              c.y += Phaser.Math.Clamp((ty - c.y) * strength, -maxMove, maxMove);
            }
          }

          const skinData = SKIN_PALETTES[SKIN_OPTIONS[v.skin % SKIN_OPTIONS.length] || "classic"];
          const primary = this.colorToCss(skinData.primary);
          const secondary = this.colorToCss(skinData.secondary);
          const outline = this.colorToCss(skinData.outline);
          const eye = this.colorToCss(skinData.eye);
          const pupil = this.colorToCss(skinData.pupil);
          const tongue = this.colorToCss(skinData.tongue);

          let renderStep = Math.max(1, Math.floor(v.radius));
          let maxLen = Math.min(p.length || 0, 500);
          let drawDetails = true;

          if (distSq > far2Sq) {
            maxLen = Math.min(maxLen, 80);
            renderStep = Math.max(renderStep, 4);
            drawDetails = false;
          } else if (distSq > far1Sq) {
            maxLen = Math.min(maxLen, 160);
            renderStep = Math.max(renderStep, 2);
            drawDetails = false;
          }

          let segCount = 0;
          for (let i = 1; i < maxLen; i += renderStep) {
            const targetDist = i * 14;
            let historyIndex = 0;
            let traveled = 0;

            while (historyIndex < v.history.length - 1) {
              const p1 = v.history[historyIndex];
              const p2 = v.history[historyIndex + 1];
              const segLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
              if (traveled + segLen >= targetDist) {
                const remain = targetDist - traveled;
                const ratio = segLen > 0 ? remain / segLen : 0;
                const px = p1.x + (p2.x - p1.x) * ratio;
                const py = p1.y + (p2.y - p1.y) * ratio;

                const t = i / maxLen;
                const taperStart = 0.9;
                let taperT = (t - taperStart) / (1 - taperStart);
                taperT = Math.min(1, Math.max(0, taperT));
                const scale = 1 - taperT * 0.5;

                const segmentRadius = v.radius * scale * baseGrid * 0.45;
                if (segCount < this.maxSegmentBatch) {
                  this.segX[segCount] = px * baseGrid;
                  this.segY[segCount] = py * baseGrid;
                  this.segR[segCount] = segmentRadius;
                  this.segStripe[segCount] = drawDetails && Math.floor(i / 2) % 2 === 0 ? 0 : 1;
                  this.segOutline[segCount] = drawDetails && segmentRadius > 3 ? 1 : 0;
                  segCount++;
                }
                break;
              }
              traveled += segLen;
              historyIndex += 1;
            }
          }

          if (segCount > 0) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.18;
            this.ctx.shadowColor = outline;
            this.ctx.shadowBlur = 10;
            this.ctx.fillStyle = outline;
            this.ctx.beginPath();
            for (let s = 0; s < segCount; s++) {
              const x = this.segX[s];
              const y = this.segY[s];
              const r = this.segR[s] + 2;
              this.ctx.moveTo(x + r, y);
              this.ctx.arc(x, y, r, 0, Math.PI * 2);
            }
            this.ctx.fill();
            this.ctx.restore();

            this.ctx.fillStyle = primary;
            this.ctx.beginPath();
            for (let s = 0; s < segCount; s++) {
              if (this.segStripe[s] !== 0) continue;
              const x = this.segX[s];
              const y = this.segY[s];
              const r = this.segR[s];
              this.ctx.moveTo(x + r, y);
              this.ctx.arc(x, y, r, 0, Math.PI * 2);
            }
            this.ctx.fill();

            this.ctx.fillStyle = secondary;
            this.ctx.beginPath();
            for (let s = 0; s < segCount; s++) {
              if (this.segStripe[s] !== 1) continue;
              const x = this.segX[s];
              const y = this.segY[s];
              const r = this.segR[s];
              this.ctx.moveTo(x + r, y);
              this.ctx.arc(x, y, r, 0, Math.PI * 2);
            }
            this.ctx.fill();

            if (drawDetails) {
              this.ctx.strokeStyle = outline;
              this.ctx.lineWidth = 1;
              this.ctx.globalAlpha = 0.8;
              this.ctx.beginPath();
              for (let s = 0; s < segCount; s++) {
                if (this.segOutline[s] !== 1) continue;
                const x = this.segX[s];
                const y = this.segY[s];
                const r = this.segR[s];
                this.ctx.moveTo(x + r, y);
                this.ctx.arc(x, y, r, 0, Math.PI * 2);
              }
              this.ctx.stroke();
              this.ctx.globalAlpha = 1;
            }
          }

          const headRadius = v.radius * baseGrid * 0.45 * 1.05;
          this.ctx.fillStyle = primary;
          this.ctx.beginPath();
          this.ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
          this.ctx.fill();
          if (drawDetails) {
            const shineX = headX + Math.cos(v.angle - 0.6) * headRadius * 0.35;
            const shineY = headY + Math.sin(v.angle - 0.6) * headRadius * 0.35;
            this.ctx.globalAlpha = 0.18;
            this.ctx.fillStyle = "#ffffff";
            this.ctx.beginPath();
            this.ctx.arc(shineX, shineY, headRadius * 0.55, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
          }
          if (drawDetails) {
            this.ctx.strokeStyle = outline;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
            this.ctx.stroke();
          }

          if (!drawDetails) return;

          const eyeRadius = headRadius * 0.35;
          const eyeOffsetX = headRadius * 0.4;
          const eyeOffsetY = headRadius * 0.35;

          const leftEyeX = headX + eyeOffsetX * Math.cos(v.angle) - (-eyeOffsetY) * Math.sin(v.angle);
          const leftEyeY = headY + eyeOffsetX * Math.sin(v.angle) + (-eyeOffsetY) * Math.cos(v.angle);

          const rightEyeX = headX + eyeOffsetX * Math.cos(v.angle) - eyeOffsetY * Math.sin(v.angle);
          const rightEyeY = headY + eyeOffsetX * Math.sin(v.angle) + eyeOffsetY * Math.cos(v.angle);

          this.ctx.fillStyle = eye;
          this.ctx.beginPath();
          this.ctx.arc(leftEyeX, leftEyeY, eyeRadius, 0, Math.PI * 2);
          this.ctx.arc(rightEyeX, rightEyeY, eyeRadius, 0, Math.PI * 2);
          this.ctx.fill();

          const pupilRadius = eyeRadius * 0.5;
          const pupilOffset = eyeRadius * 0.2;

          const pupilLX = leftEyeX + pupilOffset * Math.cos(v.angle);
          const pupilLY = leftEyeY + pupilOffset * Math.sin(v.angle);
          const pupilRX = rightEyeX + pupilOffset * Math.cos(v.angle);
          const pupilRY = rightEyeY + pupilOffset * Math.sin(v.angle);

          this.ctx.fillStyle = pupil;
          this.ctx.beginPath();
          this.ctx.arc(pupilLX, pupilLY, pupilRadius, 0, Math.PI * 2);
          this.ctx.arc(pupilRX, pupilRY, pupilRadius, 0, Math.PI * 2);
          this.ctx.fill();

          const earRadius = headRadius * 0.2;
          const earOffset = headRadius * 0.8;

          const leftEarX = headX + earOffset * Math.cos(v.angle - Math.PI / 2);
          const leftEarY = headY + earOffset * Math.sin(v.angle - Math.PI / 2);
          const rightEarX = headX + earOffset * Math.cos(v.angle + Math.PI / 2);
          const rightEarY = headY + earOffset * Math.sin(v.angle + Math.PI / 2);

          this.ctx.fillStyle = primary;
          this.ctx.beginPath();
          this.ctx.arc(leftEarX, leftEarY, earRadius, 0, Math.PI * 2);
          this.ctx.arc(rightEarX, rightEarY, earRadius, 0, Math.PI * 2);
          this.ctx.fill();

          const mouthRadius = headRadius * 0.15;
          const mouthOffset = headRadius * 0.6;
          const mouthX = headX + mouthOffset * Math.cos(v.angle);
          const mouthY = headY + mouthOffset * Math.sin(v.angle);

          this.ctx.fillStyle = tongue;
          this.ctx.beginPath();
          this.ctx.arc(mouthX, mouthY, mouthRadius, 0, Math.PI * 2);
          this.ctx.fill();
        });

        if (room.state.foods) {
          this.ctx.fillStyle = "#ff6b6b";
          this.ctx.beginPath();
          room.state.foods.forEach((food: any) => {
            const fx = food.x * baseGrid;
            const fy = food.y * baseGrid;
            if (fx < leftBound || fx > rightBound || fy < topBound || fy > bottomBound) return;
            this.ctx.moveTo(fx + 3, fy);
            this.ctx.arc(fx, fy, 3, 0, Math.PI * 2);
          });
          this.ctx.fill();
        }

        this.canvasTexture.refresh();
      }
    }

    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: this.opts.container,
      width: "100%",
      height: "100%",
      scale: { mode: Phaser.Scale.RESIZE },
      scene: [MainScene],
    });
  }

  destroy() {
    this.room?.leave();
    this.game?.destroy(true);
    this.room = null;
    this.game = null;
  }
}
