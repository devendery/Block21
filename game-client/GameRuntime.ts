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
      sprites!: Phaser.GameObjects.Graphics;
      dummyCam!: Phaser.GameObjects.Image;

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
        this.sprites = this.add.graphics();
        this.dummyCam = this.add.image(0, 0, "__WHITE").setVisible(false);
        this.cameras.main.startFollow(this.dummyCam, true, 0.08, 0.08);
      }

      update() {
        if (!room?.state) return;
        this.sprites.clear();

        const MAX_TURN_RATE = 0.12;

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
            for (let i = 0; i < 400; i++) v.history.push({ x: p.x, y: p.y });
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
          v.history.unshift({ x: v.x, y: v.y });
          if (v.history.length > 1500) v.history.pop();

          /* ---- RELAX ---- */
          if (v.turnIntensity < 0.3) {
            const turnFactor = Phaser.Math.Clamp((0.3 - v.turnIntensity) / 0.3, 0, 1);
            const BASE_STRENGTH = 0.15 * turnFactor;
            const MAX_MOVE = 2.5;
            const RELAX_WINDOW = 500;
            for (let i = 2; i < Math.min(RELAX_WINDOW, v.history.length); i++) {
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

              const decay = Math.exp(-i * 0.05);
              const strength = BASE_STRENGTH * decay;
              c.x += Phaser.Math.Clamp((tx - c.x) * strength, -MAX_MOVE, MAX_MOVE);
              c.y += Phaser.Math.Clamp((ty - c.y) * strength, -MAX_MOVE, MAX_MOVE);
            }
          }

          /* ---- DRAW ---- */
          const skinData = SKIN_PALETTES[SKIN_OPTIONS[v.skin % SKIN_OPTIONS.length] || "classic"];
          const renderStep = Math.max(1, Math.floor(v.radius));
          
          for (let i = 1; i < Math.min(p.length, 500); i += renderStep) {
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
                
                const t = i / Math.min(p.length, 500);
                const taperStart = 0.9;
                let taperT = (t - taperStart) / (1 - taperStart);
                taperT = Math.min(1, Math.max(0, taperT));
                const scale = 1 - taperT * 0.5;
                
                const segmentRadius = v.radius * scale * baseGrid * 0.45;
                
                const isStripe = Math.floor(i / 2) % 2 === 0;
                const fillColor = isStripe ? skinData.primary : skinData.secondary;
                
                this.sprites.fillStyle(fillColor, 1);
                this.sprites.fillCircle(px * baseGrid, py * baseGrid, segmentRadius);
                
                if (segmentRadius > 3) {
                  this.sprites.lineStyle(1, skinData.outline, 0.8);
                  this.sprites.strokeCircle(px * baseGrid, py * baseGrid, segmentRadius);
                }
                break;
              }
              traveled += segLen;
              historyIndex += 1;
            }
          }

          const headRadius = v.radius * baseGrid * 0.45;
          const headX = v.x * baseGrid;
          const headY = v.y * baseGrid;
          
          this.sprites.fillStyle(skinData.primary, 1);
          this.sprites.fillCircle(headX, headY, headRadius);
          this.sprites.lineStyle(2, skinData.outline, 1);
          this.sprites.strokeCircle(headX, headY, headRadius);
          
          const eyeRadius = headRadius * 0.35;
          const eyeOffsetX = headRadius * 0.4;
          const eyeOffsetY = headRadius * 0.35;
          
          const leftEyeX = headX + eyeOffsetX * Math.cos(v.angle) - (-eyeOffsetY) * Math.sin(v.angle);
          const leftEyeY = headY + eyeOffsetX * Math.sin(v.angle) + (-eyeOffsetY) * Math.cos(v.angle);
          
          const rightEyeX = headX + eyeOffsetX * Math.cos(v.angle) - (eyeOffsetY) * Math.sin(v.angle);
          const rightEyeY = headY + eyeOffsetX * Math.sin(v.angle) + (eyeOffsetY) * Math.cos(v.angle);
          
          this.sprites.fillStyle(skinData.eye, 1);
          this.sprites.fillCircle(leftEyeX, leftEyeY, eyeRadius);
          this.sprites.fillCircle(rightEyeX, rightEyeY, eyeRadius);
          
          const pupilRadius = eyeRadius * 0.5;
          const pupilOffset = eyeRadius * 0.2;
          
          const pupilLX = leftEyeX + pupilOffset * Math.cos(v.angle);
          const pupilLY = leftEyeY + pupilOffset * Math.sin(v.angle);
          const pupilRX = rightEyeX + pupilOffset * Math.cos(v.angle);
          const pupilRY = rightEyeY + pupilOffset * Math.sin(v.angle);
          
          this.sprites.fillStyle(skinData.pupil, 1);
          this.sprites.fillCircle(pupilLX, pupilLY, pupilRadius);
          this.sprites.fillCircle(pupilRX, pupilRY, pupilRadius);
          
          const earRadius = headRadius * 0.2;
          const earOffset = headRadius * 0.8;
          
          const leftEarX = headX + earOffset * Math.cos(v.angle - Math.PI/2);
          const leftEarY = headY + earOffset * Math.sin(v.angle - Math.PI/2);
          const rightEarX = headX + earOffset * Math.cos(v.angle + Math.PI/2);
          const rightEarY = headY + earOffset * Math.sin(v.angle + Math.PI/2);
          
          this.sprites.fillStyle(skinData.primary, 1);
          this.sprites.fillCircle(leftEarX, leftEarY, earRadius);
          this.sprites.fillCircle(rightEarX, rightEarY, earRadius);
          
          const mouthRadius = headRadius * 0.15;
          const mouthOffset = headRadius * 0.6;
          const mouthX = headX + mouthOffset * Math.cos(v.angle);
          const mouthY = headY + mouthOffset * Math.sin(v.angle);
          
          this.sprites.fillStyle(skinData.tongue, 1);
          this.sprites.fillCircle(mouthX, mouthY, mouthRadius);

          if (id === room.sessionId) {
            this.dummyCam.setPosition(v.x * baseGrid, v.y * baseGrid);
            
            if (onStatsCallback) {
              onStatsCallback({
                score: p.score || 0,
                mass: p.mass || 0,
                length: p.length || 0,
                radius: v.radius,
                alive: p.alive !== false
              });
            }
          }
        });
        
        if (room.state.foods) {
          room.state.foods.forEach((food: any) => {
            this.sprites.fillStyle(0xff6b6b, 1);
            this.sprites.fillCircle(food.x * baseGrid, food.y * baseGrid, 3);
          });
        }
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