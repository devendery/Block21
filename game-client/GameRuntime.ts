/**
 * PHASE-1 ARCHITECTURE FROZEN
 * 
 * Boundary Rules:
 * 1. This file OWNS Phaser, Colyseus, Input, Rendering.
 * 2. NO React imports allowed (useEffect, useState, etc).
 * 3. NO UI logic allowed (HTML overlays, buttons).
 * 4. Communication to UI via callbacks only (GameRuntimeOptions).
 */

import type { Room } from "colyseus.js";
import type { Game } from "phaser";

// --- Constants ---
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

// --- Types ---

export type GameRuntimeOptions = {
  container: HTMLElement;
  wsUrl: string;
  roomName: string;
  joinOptions: {
    address: string;
    skin: string;
    eyes: string;
    mouth: string;
    [key: string]: any; // Allow other options like customPalette, bots
  };
  onStats?: (stats: {
    score: number;
    rank: number;
    aliveCount: number;
    playerCount: number;
    power?: string;
    powerEndsAt?: number;
    rewardMultBps?: number;
    lastFood?: string;
    lastRarity?: string;
    roomStatus?: string;
  }) => void;
  onStatus?: (status: "connecting" | "playing" | "over" | "error") => void;
  // Extra callbacks for things not covered by generic Stats/Status
  onGameOver?: (result: { winnerAddress: string | null; players: any[] }) => void;
  onRewardIndicator?: (targetAddress: string) => void;
};

type SnakeRoomState = {
  status: string;
  coinX?: number;
  coinY?: number;
  coins?: any;
  foods?: any;
  gridW?: number;
  gridH?: number;
  players: any;
};

// --- Internal Singleton State ---
let activeRuntime: GameRuntimeInstance | null = null;

export function startGame(opts: GameRuntimeOptions): void {
  if (activeRuntime) {
    activeRuntime.destroy();
  }
  
  if (typeof window === "undefined") {
    throw new Error("GameRuntime cannot run on server");
  }

  activeRuntime = new GameRuntimeInstance(opts);
  activeRuntime.launch();
}

export function stopGame(): void {
  if (activeRuntime) {
    activeRuntime.destroy();
    activeRuntime = null;
  }
}

export function updateCosmetics(skin: string, eyes: string, mouth: string): void {
  if (activeRuntime) {
    activeRuntime.updateCosmetics(skin, eyes, mouth);
  }
}

// --- Internal Implementation ---

class GameRuntimeInstance {
  private game: Game | null = null;
  private room: Room<SnakeRoomState> | null = null;
  private destroyed = false;
  
  constructor(private opts: GameRuntimeOptions) {}

  updateCosmetics(skin: string, eyes: string, mouth: string) {
    if (this.room) {
        try {
            this.room.send("cosmetic", { skin, eyes, mouth });
        } catch {}
    }
  }

  async launch() {
    if (this.destroyed) return;

    try {
      this.opts.onStatus?.("connecting");
      
      // Dynamic import
      const [{ Client }, { default: Phaser }] = await Promise.all([import("colyseus.js"), import("phaser")]);
      
      if (this.destroyed) return;

      const client = new Client(this.opts.wsUrl);
      const room = await client.joinOrCreate<SnakeRoomState>(this.opts.roomName, this.opts.joinOptions);
      
      if (this.destroyed) {
        room.leave();
        return;
      }
      
      this.room = room;
      this.opts.onStatus?.("playing");

      // --- Room Listeners ---

      if (this.opts.roomName === "snake") {
        room.onMessage("game_over", (payload: any) => {
          this.opts.onStatus?.("over");
          this.opts.onGameOver?.({ 
            winnerAddress: payload?.winnerAddress ?? null, 
            players: payload?.players ?? [] 
          });
        });
      }

      room.onMessage("reward_indicator", (payload: any) => {
        const target = typeof payload?.address === "string" ? payload.address.toLowerCase() : "";
        this.opts.onRewardIndicator?.(target);
      });

      room.onStateChange((state: SnakeRoomState) => {
        const playersAny = (state as any).players;
        let count = 0;
        const list: any[] = [];
        
        // Helper to convert map/obj to list
        if (playersAny && typeof playersAny.forEach === "function") {
            playersAny.forEach((p: any, key: any) => {
              count += 1;
              list.push({ id: String(key), ...p });
            });
        } else if (playersAny && typeof playersAny.size === "number") {
            count = playersAny.size;
            if (playersAny && typeof playersAny.entries === "function") {
                for (const [key, p] of playersAny.entries()) {
                  list.push({ id: String(key), ...p });
                }
            }
        } else {
            count = Object.keys(playersAny || {}).length;
            const keys = Object.keys(playersAny || {});
            keys.forEach((k) => list.push({ id: String(k), ...(playersAny || {})[k] }));
        }

        const alive = list.filter((p) => p && p.alive);
        const aliveCount = alive.length;
        
        const me = list.find((p) => p?.id === room.sessionId);
        const score = Number(me?.score) || 0;
        
        const ranked = [...alive].sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
        const rankIndex = ranked.findIndex((p) => p?.id === room.sessionId);
        const rank = rankIndex >= 0 ? rankIndex + 1 : 0;

        this.opts.onStats?.({
            score,
            rank,
            aliveCount,
            playerCount: count,
            power: typeof me?.power === "string" ? me.power : "",
            powerEndsAt: Number(me?.powerEndsAt) || 0,
            rewardMultBps: Number(me?.rewardMultBps) || 0,
            lastFood: typeof me?.lastFood === "string" ? me.lastFood : "",
            lastRarity: typeof me?.lastRarity === "string" ? me.lastRarity : "",
            roomStatus: state.status || "unknown"
        });
      });

      // --- Phaser Game Setup ---

      const baseGridSize = 18;
      const gridW = Number((room.state as any)?.gridW) || 96;
      const gridH = Number((room.state as any)?.gridH) || 56;
      const width = gridW * baseGridSize;
      const height = gridH * baseGridSize;
      
      let lastMouseDirAt = 0;
      const self = this;
      const currentAddress = this.opts.joinOptions.address || "";

      const pickSkin = (addr: string) => {
        let h = 0;
        for (let i = 0; i < addr.length; i++) h = (h * 31 + addr.charCodeAt(i)) >>> 0;
        return SKIN_OPTIONS[h % SKIN_OPTIONS.length];
      };

      class MainScene extends Phaser.Scene {
        grid!: Phaser.GameObjects.Graphics;
        sprites!: Phaser.GameObjects.Graphics;
        coin!: Phaser.GameObjects.Graphics;
        dummyCam!: Phaser.GameObjects.Image; // Dummy object for camera to follow

        visuals: Map<string, { x: number; y: number; angle: number; history: { x: number; y: number }[] }> = new Map();

        create() {
          // Fantasy Garden background
          this.cameras.main.setBackgroundColor(0x1e2a22);

          const bg = this.add.graphics();
          bg.fillStyle(0x3e5a4a, 0.08);
          for (let i = 0; i < 260; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const r = 0.6 + Math.random() * 1.4;
            bg.fillCircle(x, y, r);
          }
          bg.fillStyle(0x2c3f34, 0.12);
          for (let i = 0; i < 24; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const r = 18 + Math.random() * 46;
            bg.fillCircle(x, y, r);
          }

          this.grid = this.add.graphics();
          this.sprites = this.add.graphics();
          this.coin = this.add.graphics();
          
          this.sprites.setBlendMode(Phaser.BlendModes.ADD);
          this.coin.setBlendMode(Phaser.BlendModes.ADD);
          
          // Create dummy object for camera follow
          this.dummyCam = this.add.image(0, 0, "__WHITE").setVisible(false);
          // TEMP DEBUG: Disable follow smoothing
          this.cameras.main.startFollow(this.dummyCam, true, 1.0, 1.0); 
          // this.cameras.main.startFollow(this.dummyCam, true, 0.08, 0.08);
          this.cameras.main.setZoom(1.0);
          
          // Set bounds to world size
          this.cameras.main.setBounds(0, 0, width, height);

          this.drawGrid(width, height, baseGridSize);
          
          // Handle window resize
          this.scale.on("resize", (gameSize: any) => {
             this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
          });

          // Mouse control
          this.input.on("pointermove", (pointer: any) => {
            if (!self.room) return;
            const players = (self.room.state as any)?.players;
            const me = players?.get ? players.get(self.room.sessionId) : null;
            if (!me || !me.alive) return;
            
            // Use visual position for smoother control reference
            const vis = this.visuals.get(self.room.sessionId);
            const cx = (vis ? vis.x : typeof me?.x === "number" ? me.x : 0) * baseGridSize + baseGridSize / 2;
            const cy = (vis ? vis.y : typeof me?.y === "number" ? me.y : 0) * baseGridSize + baseGridSize / 2;

            const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            const dx = world.x - cx;
            const dy = world.y - cy;
            const targetAngle = Math.atan2(dy, dx);
            const now = Date.now();
            if (now - lastMouseDirAt < 50) return;
            lastMouseDirAt = now;
            self.room.send("input", { targetAngle, boost: false });
          });
        }

        drawBody(x: number, y: number, i: number, palette: any, alive: boolean, skinName: string) {
          const px = x * baseGridSize + baseGridSize / 2;
          const py = y * baseGridSize + baseGridSize / 2;
          const s = baseGridSize - 2; // Slightly smaller for separation
          const alpha = alive ? Math.max(0.2, 1 - i * 0.02) : 0.35;
          
          this.sprites.fillStyle(alive ? palette.secondary : 0x2b2b2b, alpha);
          this.sprites.fillCircle(px, py, s / 2);
          
          // Inner core
          this.sprites.fillStyle(alive ? palette.primary : 0x444444, alpha * 0.9);
          this.sprites.fillCircle(px, py, s * 0.3);

          if (alive && skinName === "scales") {
            const ring = s * 0.22;
            const r = s * 0.12;
            const phase = (i % 2) * 0.35;
            const tint = (i % 3) * 0.04;
            this.sprites.fillStyle(palette.outline, Math.max(0.12, alpha * (0.22 + tint)));
            for (let k = 0; k < 5; k++) {
              const a = phase + (k / 5) * Math.PI * 2;
              const sx = px + Math.cos(a) * ring;
              const sy = py + Math.sin(a) * ring;
              this.sprites.fillTriangle(sx, sy - r, sx + r, sy, sx, sy + r);
              this.sprites.fillTriangle(sx, sy - r, sx - r, sy, sx, sy + r);
            }
          }
        }

        drawHead(x: number, y: number, angle: number, palette: any, eyeStyle: string, mouthStyle: string, alive: boolean, skinName: string) {
          const px = x * baseGridSize + baseGridSize / 2;
          const py = y * baseGridSize + baseGridSize / 2;
          const size = baseGridSize;
          const alpha = alive ? 1 : 0.45;
          
          this.sprites.fillStyle(alive ? palette.secondary : 0x2b2b2b, alpha);
          this.sprites.fillCircle(px, py, size * 0.55);
          
          this.sprites.fillStyle(alive ? palette.primary : 0x444444, alpha * 0.9);
          this.sprites.fillCircle(px, py, size * 0.35);

          const eyeOff = size * 0.25;
          const eyeR = size * 0.12;
          
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);

          if (alive && skinName === "scales") {
            const ring = size * 0.28;
            const r = size * 0.09;
            this.sprites.fillStyle(palette.outline, 0.18);
            for (let k = 0; k < 4; k++) {
              const a = angle + Math.PI + (k - 1.5) * 0.45;
              const sx = px + Math.cos(a) * ring;
              const sy = py + Math.sin(a) * ring;
              this.sprites.fillTriangle(sx, sy - r, sx + r, sy, sx, sy + r);
              this.sprites.fillTriangle(sx, sy - r, sx - r, sy, sx, sy + r);
            }
          }
          
          const lx = px + (cos * eyeOff) - (sin * eyeOff);
          const ly = py + (sin * eyeOff) + (cos * eyeOff);
          
          const rx = px + (cos * eyeOff) + (sin * eyeOff);
          const ry = py + (sin * eyeOff) - (cos * eyeOff);

          const eyeAlpha = alive ? 1 : 0.65;

          if (eyeStyle === "cat") {
            this.sprites.fillStyle(palette.eye, eyeAlpha);
            this.sprites.fillEllipse(lx, ly, eyeR * 2.2, eyeR * 1.8);
            this.sprites.fillEllipse(rx, ry, eyeR * 2.2, eyeR * 1.8);

            this.sprites.fillStyle(palette.pupil, eyeAlpha);
            this.sprites.fillEllipse(lx + cos * eyeR * 0.55, ly + sin * eyeR * 0.55, eyeR * 0.65, eyeR * 1.5);
            this.sprites.fillEllipse(rx + cos * eyeR * 0.55, ry + sin * eyeR * 0.55, eyeR * 0.65, eyeR * 1.5);
          } else if (eyeStyle === "angry") {
            this.sprites.lineStyle(Math.max(1, Math.floor(size * 0.07)), palette.eye, eyeAlpha);
            this.sprites.beginPath();
            this.sprites.moveTo(lx - eyeR * 1.8, ly - eyeR * 1.4);
            this.sprites.lineTo(lx + eyeR * 1.6, ly - eyeR * 0.9);
            this.sprites.moveTo(rx - eyeR * 1.6, ry - eyeR * 0.9);
            this.sprites.lineTo(rx + eyeR * 1.8, ry - eyeR * 1.4);
            this.sprites.strokePath();

            this.sprites.fillStyle(palette.eye, eyeAlpha);
            this.sprites.fillCircle(lx, ly, eyeR * 1.05);
            this.sprites.fillCircle(rx, ry, eyeR * 1.05);

            this.sprites.fillStyle(palette.pupil, eyeAlpha);
            this.sprites.fillCircle(lx + cos * eyeR * 0.45, ly + sin * eyeR * 0.45, eyeR * 0.55);
            this.sprites.fillCircle(rx + cos * eyeR * 0.45, ry + sin * eyeR * 0.45, eyeR * 0.55);
          } else {
            this.sprites.fillStyle(palette.eye, eyeAlpha);
            this.sprites.fillCircle(lx, ly, eyeR);
            this.sprites.fillCircle(rx, ry, eyeR);

            this.sprites.fillStyle(palette.pupil, eyeAlpha);
            this.sprites.fillCircle(lx + cos * eyeR * 0.5, ly + sin * eyeR * 0.5, eyeR * 0.5);
            this.sprites.fillCircle(rx + cos * eyeR * 0.5, ry + sin * eyeR * 0.5, eyeR * 0.5);
          }

          const mouthAlpha = alive ? 0.95 : 0.55;
          const mx = px + cos * size * 0.28;
          const my = py + sin * size * 0.28;

          if (mouthStyle === "tongue") {
            this.sprites.fillStyle(palette.tongue, mouthAlpha);
            this.sprites.fillEllipse(mx + cos * size * 0.18, my + sin * size * 0.18, size * 0.42, size * 0.3);
            this.sprites.fillStyle(0xfb7185, mouthAlpha);
            this.sprites.fillEllipse(mx + cos * size * 0.28, my + sin * size * 0.22, size * 0.22, size * 0.16);
          } else if (mouthStyle === "fangs") {
            this.sprites.lineStyle(Math.max(1, Math.floor(size * 0.07)), palette.eye, mouthAlpha);
            this.sprites.beginPath();
            this.sprites.arc(mx + cos * size * 0.22, my + sin * size * 0.22, size * 0.18, angle - 0.9, angle + 0.9, false);
            this.sprites.strokePath();

            this.sprites.fillStyle(palette.eye, mouthAlpha);
            this.sprites.fillTriangle(
              mx + cos * size * 0.22 - sin * size * 0.06,
              my + sin * size * 0.22 + cos * size * 0.06,
              mx + cos * size * 0.26 - sin * size * 0.02,
              my + sin * size * 0.26 + cos * size * 0.02,
              mx + cos * size * 0.18 - sin * size * 0.02,
              my + sin * size * 0.18 + cos * size * 0.02
            );
            this.sprites.fillTriangle(
              mx + cos * size * 0.22 + sin * size * 0.06,
              my + sin * size * 0.22 - cos * size * 0.06,
              mx + cos * size * 0.26 + sin * size * 0.02,
              my + sin * size * 0.26 - cos * size * 0.02,
              mx + cos * size * 0.18 + sin * size * 0.02,
              my + sin * size * 0.18 - cos * size * 0.02
            );
          } else {
            this.sprites.lineStyle(Math.max(1, Math.floor(size * 0.07)), palette.eye, mouthAlpha);
            this.sprites.beginPath();
            this.sprites.arc(mx + cos * size * 0.22, my + sin * size * 0.22, size * 0.18, angle - 0.8, angle + 0.8, false);
            this.sprites.strokePath();
          }
        }

        drawFood(kind: string, rarity: string, x: number, y: number, spawnedAt: number, seed: number) {
          const px = x * baseGridSize + baseGridSize / 2;
          const py = y * baseGridSize + baseGridSize / 2;
          const size = baseGridSize * 0.8;

          let core = 0xffe066;
          let glow = 0xfff3bf;
          let glowAlpha = 0.22;

          if (rarity === "rare") {
            core = 0xff6b6b;
            glow = 0xffa8a8;
            glowAlpha = 0.22;
          } else if (rarity === "epic") {
            core = 0x5eead4;
            glow = 0x99f6e4;
            glowAlpha = 0.22;
          } else if (rarity === "golden") {
            core = 0xffe066;
            glow = 0xffd43b;
            glowAlpha = 0.28;
          }

          const phase = (Number.isFinite(seed) ? (seed % 997) / 997 : 0) * Math.PI * 2;
          const t = this.time.now / 1000;
          const pulse = 1 + Math.sin(t * 2 + phase) * 0.08;
          const float = Math.sin(t * 1.2 + phase) * 2.0;

          const fx = px;
          const fy = py + float;

          this.sprites.fillStyle(glow, glowAlpha);
          this.sprites.fillCircle(fx, fy, size * 0.85 * pulse);

          this.sprites.fillStyle(core, 1);
          this.sprites.fillCircle(fx, fy, size * 0.52 * pulse);

          this.sprites.fillStyle(0xffffff, 0.65);
          this.sprites.fillCircle(fx - size * 0.18, fy - size * 0.2, size * 0.12);
        }

        update() {
          const room = self.room;
          const state = room?.state;
          if (!state) return;

          this.sprites.clear();
          this.coin.clear();

          // Draw Food
          const foodsAny = (state as any).foods ?? (state as any).coins;
          const hasFoods = foodsAny && (Array.isArray(foodsAny) || typeof foodsAny.forEach === "function");
          if (hasFoods) {
            if (typeof foodsAny.forEach === "function") {
              foodsAny.forEach((f: any) => {
                this.drawFood(String(f.kind || "apple"), String(f.rarity || "common"), Number(f.x), Number(f.y), Number(f.spawnedAt), Number(f.seed));
              });
            } else {
              (foodsAny as any[]).forEach((f: any) => {
                this.drawFood(String(f.kind || "apple"), String(f.rarity || "common"), Number(f.x), Number(f.y), Number(f.spawnedAt), Number(f.seed));
              });
            }
          } else if (typeof (state as any).coinX === "number" && typeof (state as any).coinY === "number") {
            this.drawFood("apple", "common", Number((state as any).coinX), Number((state as any).coinY), 0, 0);
          }

          const playersAny = (state as any).players;
          
          const drawPlayerSmooth = (p: any, key: string) => {
             const isMe = typeof p?.address === "string" && p.address.toLowerCase() === (currentAddress || "").toLowerCase();
             const alive = Boolean(p?.alive);
             const skinName = (SKIN_OPTIONS as readonly string[]).includes(p?.skin)
               ? (p.skin as (typeof SKIN_OPTIONS)[number])
               : pickSkin(typeof p?.address === "string" ? p.address : "");
             let palette = SKIN_PALETTES[skinName];
             const eyeStyle = EYES_OPTIONS.includes(p?.eyes) ? p.eyes : "cat";
             const mouthStyle = MOUTH_OPTIONS.includes(p?.mouth) ? p.mouth : "tongue";
             
             // Custom palette logic
             if (skinName === "custom" && isMe && self.opts.joinOptions.customPalette) {
                 palette = { ...palette, ...self.opts.joinOptions.customPalette };
             } else if (isMe) {
               palette = { ...palette, primary: 0x7c3aed };
             }
             const paletteMe = palette;

             const sx = typeof p?.x === "number" ? p.x : null;
             const sy = typeof p?.y === "number" ? p.y : null;
             const serverAngle = typeof p?.angle === "number" ? p.angle : null;
             const length = typeof p?.length === "number" ? p.length : 0;
             if (sx === null || sy === null) return;
             
             let vis = this.visuals.get(key);
             if (!vis) {
               vis = { x: sx, y: sy, angle: serverAngle ?? 0, history: [] };
               this.visuals.set(key, vis);
             }

             vis.x = vis.x + (sx - vis.x) * 0.18;
             vis.y = vis.y + (sy - vis.y) * 0.18;
             if (serverAngle !== null) {
               vis.angle = Phaser.Math.Angle.RotateTo(vis.angle, serverAngle, 0.22);
             }
             
             vis.history.unshift({ x: vis.x, y: vis.y });
             const spacing = 5;
             const maxRendered = 120;
             const renderCount = Math.max(0, Math.min(length, maxRendered));
             const lodFactor = renderCount > 0 ? Math.max(1, length / renderCount) : 1;
             const maxLen = Math.floor(renderCount * spacing * lodFactor + 20);
             if (vis.history.length > maxLen) {
               vis.history.pop();
             }

             this.drawHead(vis.x, vis.y, vis.angle, paletteMe, eyeStyle, mouthStyle, alive, skinName);

             for (let i = 1; i < renderCount; i++) {
               const historyIdx = Math.floor(i * spacing * lodFactor);
               if (historyIdx >= vis.history.length) break;
               const pt = vis.history[historyIdx];
               this.drawBody(pt.x, pt.y, i, paletteMe, alive, skinName);
             }

             if (isMe) {
               this.dummyCam.setPosition(vis.x * baseGridSize, vis.y * baseGridSize);
               const targetZoom = Phaser.Math.Clamp(1.1 - length * 0.0012, 0.65, 1.1);
               this.cameras.main.setZoom(this.cameras.main.zoom + (targetZoom - this.cameras.main.zoom) * 0.05);
             }
          };

          if (playersAny && typeof playersAny.forEach === "function") {
            playersAny.forEach((p: any, key: any) => drawPlayerSmooth(p, String(key)));
          } else {
            const keys = Object.keys(playersAny || {});
            keys.forEach((k) => drawPlayerSmooth(playersAny[k], k));
          }
        }

        drawGrid(w: number, h: number, s: number) {
          this.grid.clear();
          this.grid.fillStyle(0x2c3f34, 0.22);
          for (let x = 0; x <= w; x += s) {
            for (let y = 0; y <= h; y += s) {
              this.grid.fillCircle(x, y, 1.5);
            }
          }
        }
      }

      this.opts.container.innerHTML = "";
      this.game = new Phaser.Game({
        type: Phaser.AUTO,
        width: "100%",
        height: "100%",
        parent: this.opts.container,
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.NO_CENTER,
        },
        scene: [MainScene],
        fps: { target: 60, forceSetTimeOut: true },
      });

      const canvas = this.game.canvas;
      if (canvas) {
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        canvas.tabIndex = 0;
        canvas.focus();
      }

    } catch (err) {
      console.error(err);
      this.opts.onStatus?.("error");
    }
  }

  destroy() {
    this.destroyed = true;
    if (this.room) {
      try {
        this.room.leave().catch(() => {});
      } catch {}
      this.room = null;
    }
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }
}
