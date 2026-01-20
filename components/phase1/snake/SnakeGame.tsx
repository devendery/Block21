"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { parseUnits } from "viem";
import type { Room } from "colyseus.js";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Meteors } from "@/components/ui/meteors";
import { MagicCard } from "@/components/ui/magic-card";
import { BorderBeam } from "@/components/ui/border-beam";
import { cn, B21_CONTRACT_ADDRESS, OWNER_WALLET_ADDRESS } from "@/lib/utils";

const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

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

const SKIN_OPTIONS = ["classic", "neon", "magma", "toxic", "void", "scales", "custom"] as const;
const EYES_OPTIONS = ["cat", "round", "angry"] as const;
const MOUTH_OPTIONS = ["tongue", "smile", "fangs"] as const;

const SKIN_PALETTES: Record<
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

export default function SnakeGame({ roomName = "snake_arena" }: { roomName?: string }) {
  const { address, isConnected } = useAccount();
  const [guestAddress, setGuestAddress] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const phaserRef = useRef<any>(null);
  const roomRef = useRef<Room<SnakeRoomState> | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "playing" | "over" | "error" | "paying">("idle");
  const [result, setResult] = useState<{ winnerAddress: string | null; players: any[] } | null>(null);
  const [roomStatus, setRoomStatus] = useState<string>("idle");
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [latency, setLatency] = useState<number>(0);

  const { writeContractAsync } = useWriteContract();
  const { data: b21Balance } = useReadContract({
    address: B21_CONTRACT_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const [sessionKey, setSessionKey] = useState(0);
  const [serverHealth, setServerHealth] = useState<{ ok: boolean; error?: string } | null>(null);
  const [skin, setSkin] = useState<(typeof SKIN_OPTIONS)[number]>("classic");
  const [eyes, setEyes] = useState<(typeof EYES_OPTIONS)[number]>("cat");
  const [mouth, setMouth] = useState<(typeof MOUTH_OPTIONS)[number]>("tongue");
  const [customPalette, setCustomPalette] = useState<{ primary: number; secondary: number } | null>(null);
  const [loadedFromServer, setLoadedFromServer] = useState(false);
  const [control, setControl] = useState<"keys" | "mouse">("keys");
  const [myScore, setMyScore] = useState<number>(0);
  const [myRank, setMyRank] = useState<number>(0);
  const [aliveCount, setAliveCount] = useState<number>(0);
  const [myPower, setMyPower] = useState<string>("");
  const [myPowerEndsAt, setMyPowerEndsAt] = useState<number>(0);
  const [myRewardMultBps, setMyRewardMultBps] = useState<number>(0);
  const [myLastFood, setMyLastFood] = useState<string>("");
  const [myLastRarity, setMyLastRarity] = useState<string>("");
  const [rewardFlashUntil, setRewardFlashUntil] = useState<number>(0);
  const [hasStarted, setHasStarted] = useState(false);

  const wsUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_COLYSEUS_URL || "ws://localhost:2567";
  }, []);

  const identityKey = useMemo(() => {
    if (isConnected && address) return address.toLowerCase();
    if (guestAddress) return guestAddress.toLowerCase();
    return null;
  }, [address, guestAddress, isConnected]);

  useEffect(() => {
    if (!identityKey) return;
    if (!isConnected || !address) return;
    if (loadedFromServer) return;
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch("/api/phase1/cosmetic", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json().catch(() => null)) as any;
        const c = data?.cosmetic;
        if (!c) return;
        if (cancelled) return;
        if (SKIN_OPTIONS.includes(c?.skin)) setSkin(c.skin);
        if (EYES_OPTIONS.includes(c?.eyes)) setEyes(c.eyes);
        if (MOUTH_OPTIONS.includes(c?.mouth)) setMouth(c.mouth);
        if (c?.customPalette && typeof c.customPalette === "object") {
          const primary = Number(c.customPalette.primary);
          const secondary = Number(c.customPalette.secondary);
          if (Number.isFinite(primary) && Number.isFinite(secondary)) setCustomPalette({ primary, secondary });
        }
        try {
          window.localStorage.setItem(`b21_snake_cosmetic:${identityKey}`, JSON.stringify({ skin: c.skin, eyes: c.eyes, mouth: c.mouth }));
          if (c?.customPalette && typeof c.customPalette.primary === "number" && typeof c.customPalette.secondary === "number") {
            const toHex = (v: number) => `#${Math.max(0, Math.min(0xffffff, Math.floor(v))).toString(16).padStart(6, "0")}`;
            window.localStorage.setItem(
              `b21_snake_custom_palette:${identityKey}`,
              JSON.stringify({ primary: toHex(c.customPalette.primary), secondary: toHex(c.customPalette.secondary) })
            );
          }
          window.dispatchEvent(new Event("b21_snake_cosmetic_updated"));
        } catch {
        }
      } finally {
        if (!cancelled) setLoadedFromServer(true);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [address, identityKey, isConnected, loadedFromServer]);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch("/api/phase1/server-health", { cache: "no-store" });
        const data = (await res.json().catch(() => null)) as any;
        if (cancelled) return;
        setServerHealth({ ok: Boolean(data?.ok), error: data?.error });
      } catch {
        if (cancelled) return;
        setServerHealth({ ok: false, error: "Health check failed" });
      }
    };
    check();
    const t = setInterval(check, 5000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  useEffect(() => {
    if (isConnected && address) return;
    if (roomName === "snake") return;
    try {
      const key = "b21_guest_address";
      const existing = window.localStorage.getItem(key);
      if (existing && typeof existing === "string") {
        setGuestAddress(existing);
        return;
      }
      const next = `guest-${crypto.randomUUID()}`;
      window.localStorage.setItem(key, next);
      setGuestAddress(next);
    } catch {
      setGuestAddress("guest");
    }
  }, [address, isConnected, roomName]);

  useEffect(() => {
    if (!identityKey) return;
    try {
      const raw = window.localStorage.getItem(`b21_snake_cosmetic:${identityKey}`);
      if (!raw) return;
      const parsed = JSON.parse(raw) as any;
      if (SKIN_OPTIONS.includes(parsed?.skin)) setSkin(parsed.skin);
      if (EYES_OPTIONS.includes(parsed?.eyes)) setEyes(parsed.eyes);
      if (MOUTH_OPTIONS.includes(parsed?.mouth)) setMouth(parsed.mouth);
    } catch {
    }
  }, [identityKey]);

  useEffect(() => {
    if (!identityKey) return;
    try {
      const raw = window.localStorage.getItem(`b21_snake_custom_palette:${identityKey}`);
      if (!raw) return;
      const parsed = JSON.parse(raw) as any;
      const parseColor = (v: any) => {
        if (typeof v === "number" && Number.isFinite(v)) return v;
        if (typeof v === "string") {
          const s = v.trim().replace("#", "");
          const n = Number.parseInt(s.slice(0, 6), 16);
          if (Number.isFinite(n)) return n;
        }
        return null;
      };
      const primary = parseColor(parsed?.primary);
      const secondary = parseColor(parsed?.secondary);
      if (Number.isFinite(primary) && Number.isFinite(secondary)) {
        setCustomPalette({ primary: Number(primary), secondary: Number(secondary) });
      }
    } catch {
    }
  }, [identityKey]);

  useEffect(() => {
    if (!identityKey) return;
    try {
      const raw = window.localStorage.getItem(`b21_snake_control:${identityKey}`);
      if (raw === "mouse" || raw === "keys") setControl(raw);
    } catch {
    }
  }, [identityKey]);

  useEffect(() => {
    if (!identityKey) return;
    try {
      window.localStorage.setItem(`b21_snake_cosmetic:${identityKey}`, JSON.stringify({ skin, eyes, mouth }));
      window.dispatchEvent(new Event("b21_snake_cosmetic_updated"));
    } catch {
    }
  }, [eyes, identityKey, mouth, skin]);

  useEffect(() => {
    if (!identityKey) return;
    try {
      window.localStorage.setItem(`b21_snake_control:${identityKey}`, control);
    } catch {
    }
  }, [control, identityKey]);

  useEffect(() => {
    const room = roomRef.current;
    if (!room) return;
    try {
      room.send("cosmetic", { skin, eyes, mouth });
    } catch {
    }
  }, [eyes, mouth, skin]);

  useEffect(() => {
    const joinAddress = isConnected && address ? address : roomName === "snake" ? null : guestAddress;
    if (!joinAddress) return;
    if (!containerRef.current) return;
    if (!hasStarted) return;

    let destroyed = false;

    const start = async () => {
      // Token Entry Fee Logic
      if (roomName !== "snake_practice" && isConnected && address) {
        setStatus("paying");
        try {
          // DEV BYPASS: Skip payment in local dev
          const isDev = process.env.NODE_ENV === "development";
          
          let txHash = "dev_bypass_tx_" + Date.now();
          
          if (!isDev) {
             const fee = parseUnits("10", 8); // 10 B21
             if (b21Balance && b21Balance < fee) {
               alert("Insufficient B21 Balance! You need 10 B21 to play.");
               setStatus("idle");
               setHasStarted(false);
               return;
             }
             // Note: Ideally we should use approve + transferFrom via a game contract.
             // For now, we transfer directly to the owner/treasury wallet.
             txHash = await writeContractAsync({
               address: B21_CONTRACT_ADDRESS as `0x${string}`,
               abi: ERC20_ABI,
               functionName: "transfer",
               args: [OWNER_WALLET_ADDRESS as `0x${string}`, fee],
             });
          }

          // Record transaction (even if bypassed in dev, log it as a mock tx)
          await fetch("/api/phase1/transaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              txHash,
              amount: 10,
              currency: "B21",
              type: "entry_fee",
              gameName: "Snake",
            }),
          });
        } catch (err) {
          console.error("Payment failed", err);
          setStatus("idle");
          setHasStarted(false);
          return;
        }
      }

      setStatus("connecting");
      setResult(null);
      try {
        const container = containerRef.current;
        if (!container) throw new Error("Missing container");
        const baseGridSize = 18;
        const addressLower = joinAddress.toLowerCase();
        const [{ Client }, Phaser] = await Promise.all([import("colyseus.js"), import("phaser")]);
        const client = new Client(wsUrl);
        const joinOptions: any = { address: joinAddress, skin, eyes, mouth };
        if (roomName === "snake_practice") joinOptions.bots = 10;
        const room = await client.joinOrCreate<SnakeRoomState>(roomName, joinOptions);
        if (destroyed) return;
        roomRef.current = room;
        setStatus("playing");
        setRoomStatus((room.state as any)?.status ?? "unknown");

        if (roomName === "snake") {
          room.onMessage("game_over", (payload: any) => {
            setResult({ winnerAddress: payload?.winnerAddress ?? null, players: payload?.players ?? [] });
            setStatus("over");
          });
        }

        room.onMessage("reward_indicator", (payload: any) => {
          const target = typeof payload?.address === "string" ? payload.address.toLowerCase() : "";
          if (!target || target !== addressLower) return;
          setRewardFlashUntil(Date.now() + 3000);
        });

        room.onStateChange((state: any) => {
          const playersAny = state?.players as any;
          let count = 0;
          const list: any[] = [];
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
          setPlayerCount(count);
          setRoomStatus(state?.status ?? "unknown");

          const alive = list.filter((p) => p && p.alive);
          setAliveCount(alive.length);
          const ranked = [...alive].sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
          const me = list.find((p) => p?.id === room.sessionId) || null;
          const rankIndex = ranked.findIndex((p) => p?.id === room.sessionId);
          setMyRank(rankIndex >= 0 ? rankIndex + 1 : 0);
          setMyScore(Number(me?.score) || 0);
          setMyPower(typeof me?.power === "string" ? me.power : "");
          setMyPowerEndsAt(Number(me?.powerEndsAt) || 0);
          setMyRewardMultBps(Number(me?.rewardMultBps) || 0);
          setMyLastFood(typeof me?.lastFood === "string" ? me.lastFood : "");
          setMyLastRarity(typeof me?.lastRarity === "string" ? me.lastRarity : "");
        });

        const gridW = Number((room.state as any)?.gridW) || 96;
        const gridH = Number((room.state as any)?.gridH) || 56;
        const width = gridW * baseGridSize;
        const height = gridH * baseGridSize;
        let lastMouseDir: string | null = null;
        let lastMouseDirAt = 0;

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
            this.cameras.main.startFollow(this.dummyCam, true, 0.08, 0.08);
            this.cameras.main.setZoom(1.0);
            
            // Set bounds to world size
            this.cameras.main.setBounds(0, 0, width, height);

            this.drawGrid(width, height, baseGridSize);
            
            // Handle window resize
            this.scale.on("resize", (gameSize: any) => {
               this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
            });

            // Mouse control only as requested
            
            this.input.on("pointermove", (pointer: any) => {
              const players = (room.state as any)?.players;
              const me = players?.get ? players.get(room.sessionId) : null;
              if (!me || !me.alive) return;
              
              // Use visual position for smoother control reference
              const vis = this.visuals.get(room.sessionId);
              const cx = (vis ? vis.x : typeof me?.x === "number" ? me.x : 0) * baseGridSize + baseGridSize / 2;
              const cy = (vis ? vis.y : typeof me?.y === "number" ? me.y : 0) * baseGridSize + baseGridSize / 2;

              const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
              const dx = world.x - cx;
              const dy = world.y - cy;
              const targetAngle = Math.atan2(dy, dx);
              const now = Date.now();
              if (now - lastMouseDirAt < 50) return;
              lastMouseDirAt = now;
              room.send("input", { targetAngle, boost: false });
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
            const state = room.state;
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
               const isMe = typeof p?.address === "string" && p.address.toLowerCase() === addressLower;
               const alive = Boolean(p?.alive);
               const skinName = (SKIN_OPTIONS as readonly string[]).includes(p?.skin)
                 ? (p.skin as (typeof SKIN_OPTIONS)[number])
                 : pickSkin(typeof p?.address === "string" ? p.address : "");
               let palette = SKIN_PALETTES[skinName];
               const eyeStyle = EYES_OPTIONS.includes(p?.eyes) ? p.eyes : "cat";
               const mouthStyle = MOUTH_OPTIONS.includes(p?.mouth) ? p.mouth : "tongue";
               if (skinName === "custom" && isMe && customPalette) {
                 palette = { ...palette, primary: customPalette.primary, secondary: customPalette.secondary };
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

        container.innerHTML = "";
        const game = new Phaser.Game({
          type: Phaser.AUTO,
          width: "100%",
          height: "100%",
          parent: container,
          scale: {
            mode: Phaser.Scale.RESIZE, // Use RESIZE for full screen
            autoCenter: Phaser.Scale.NO_CENTER,
          },
          scene: [MainScene],
          fps: { target: 60, forceSetTimeOut: true },
        });

        phaserRef.current = game;
        const canvas = game.canvas as HTMLCanvasElement | undefined;
        if (canvas) {
          canvas.style.width = "100%";
          canvas.style.height = "100%";
          canvas.style.display = "block"; // Ensure no inline-block gaps
          canvas.tabIndex = 0;
          canvas.focus();
        }
      } catch {
        setStatus("error");
      }
    };

    start();

    return () => {
      destroyed = true;
      const room = roomRef.current;
      roomRef.current = null;
      if (room) {
        try {
          const maybePromise = room.leave();
          if (maybePromise && typeof (maybePromise as any).catch === "function") {
            (maybePromise as any).catch(() => null);
          }
        } catch {
        }
      }
      const game = phaserRef.current;
      phaserRef.current = null;
      game?.destroy(true);
    };
  }, [address, eyes, guestAddress, isConnected, mouth, roomName, sessionKey, skin, wsUrl, control, hasStarted, customPalette]);

  if (roomName === "snake" && (!isConnected || !address)) {
    return (
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold text-white mb-2">Connect Wallet to Play</h2>
        <p className="text-gray-400 text-sm">
          Wallet login is required for Phase-1 so matches, leaderboard, and rewards are tied to your address.
        </p>
      </div>
    );
  }

  const subtitle =
    status === "paying"
      ? "Confirm Transaction in Wallet..."
      : status === "connecting"
      ? "Connecting to room..."
      : status === "playing"
        ? roomName === "snake" && roomStatus === "waiting"
          ? `Waiting for players (${playerCount}/2). Open another browser or switch to Arena.`
          : roomName === "snake_arena"
            ? `Arena live (${playerCount} players)`
            : roomName === "snake_practice"
              ? `Practice live (${playerCount} players)`
              : "Playing (server-authoritative)"
        : status === "over"
          ? "Match complete"
          : status === "error"
            ? "Connection error"
            : "Idle";

  const powerLeftMs = myPower && myPowerEndsAt ? myPowerEndsAt - Date.now() : 0;
  const powerLeftS = powerLeftMs > 0 ? Math.ceil(powerLeftMs / 1000) : 0;
  const showRewards = roomName !== "snake_practice";
  const showRewardFlash = rewardFlashUntil > Date.now();

  return (
    <div className={cn("flex flex-col gap-4 h-full min-h-0 relative", hasStarted && "fixed inset-0 z-50 bg-black p-0")}>
      {!hasStarted && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 overflow-hidden">
          <Meteors number={40} />
          <div className="relative z-10 flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-500">
             <div className="text-center space-y-2">
                <h1 className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500">
                  BLOCK21
                </h1>
                <div className="text-2xl font-bold text-primary tracking-widest">SNAKE ARENA</div>
                {status === "paying" && <div className="text-yellow-400 animate-pulse">Waiting for Payment Confirmation...</div>}
             </div>

             <div className="w-full max-w-4xl px-4">
               <MagicCard className="p-6 bg-zinc-900/50 border-white/10" gradientColor="#7c3aed">
                 <BorderBeam size={120} duration={10} delay={0} colorFrom="#7c3aed" colorTo="#22c55e" />
                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                   <div className="text-center md:text-left">
                     <h3 className="text-lg font-black text-white mb-1">Loadout Locked</h3>
                     <p className="text-xs text-gray-400">
                       Customize your worm in Wardrobe. In-game changes are disabled.
                     </p>
                   </div>
                   <div className="flex items-center justify-center gap-3">
                     <div className="rounded-xl bg-black/40 border border-white/10 px-4 py-2 text-xs font-black text-white/80 uppercase">
                       {skin} / {eyes} / {mouth}
                     </div>
                     <button
                       type="button"
                       onClick={() => {
                         try {
                           window.location.href = "/play?screen=wardrobe";
                         } catch {
                         }
                       }}
                       className="rounded-xl px-5 py-2 text-xs font-black bg-white/10 border border-white/10 text-white hover:bg-white/15 transition"
                     >
                       Open Wardrobe
                     </button>
                   </div>
                 </div>
               </MagicCard>
             </div>

             <div className="pt-8">
               <ShimmerButton 
                 className="text-2xl font-black tracking-wide px-16 py-6 shadow-2xl shadow-primary/20"
                 background="radial-gradient(circle at center, #FF0033 0%, #99001f 100%)"
                 shimmerColor="#FF99AA"
                 onClick={() => {
                   setHasStarted(true);
                   setControl("mouse");
                 }}
               >
                 PLAY NOW
               </ShimmerButton>
             </div>
          </div>
        </div>
      )}

      <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-3 glass-panel p-4 absolute top-4 left-4 right-4 z-40 transition-all duration-500", !hasStarted && "opacity-0 pointer-events-none translate-y-[-20px]")}>
        <div>
          <div className="text-white font-bold text-shadow-sm">
            {roomName === "snake_practice" ? "Practice Room" : roomName === "snake" ? "Match Room" : "Arena Room"}
          </div>
          <div className="text-xs text-gray-400">{subtitle}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 backdrop-blur-md">
              <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Score</div>
              <div className="text-sm font-black text-white tabular-nums">{myScore}</div>
            </div>
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 backdrop-blur-md">
              <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Rank</div>
              <div className="text-sm font-black text-white tabular-nums">
                {myRank ? `#${myRank}` : "-"}
              </div>
            </div>
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 backdrop-blur-md">
              <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Alive</div>
              <div className="text-sm font-black text-white tabular-nums">{aliveCount}</div>
            </div>
            {(myPower && powerLeftS > 0) && (
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 backdrop-blur-md animate-pulse">
                <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Power</div>
                <div className="text-sm font-black text-white tabular-nums">
                  {myPower} {powerLeftS}s
                </div>
              </div>
            )}
            {(myLastRarity || myLastFood) && (
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 backdrop-blur-md">
                <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Last</div>
                <div className="text-xs font-bold text-white">
                  {myLastRarity ? myLastRarity : "common"} {myLastFood ? myLastFood.replaceAll("_", " ") : ""}
                </div>
              </div>
            )}
            {showRewards && (
              <div
                className={
                  "flex items-center gap-2 border rounded-lg px-3 py-1.5 backdrop-blur-md transition-colors duration-300 " +
                  (showRewardFlash
                    ? "bg-yellow-500/20 border-yellow-500 text-yellow-200 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                    : "bg-black/40 border-white/10 text-gray-300")
                }
              >
                <div className="text-[10px] font-bold uppercase tracking-wider">Reward</div>
                <div className="text-sm font-black tabular-nums">
                  {myRewardMultBps > 0 ? `+${(myRewardMultBps / 100).toFixed(0)}%` : "0%"}
                </div>
              </div>
            )}
            <div
              className={
                "text-xs font-bold px-3 py-1.5 rounded-lg border backdrop-blur-md " +
                (serverHealth === null
                  ? "text-gray-300 border-white/10 bg-black/40"
                  : serverHealth.ok
                    ? "text-emerald-200 border-emerald-500/30 bg-emerald-500/10"
                    : "text-red-200 border-red-500/30 bg-red-500/10")
              }
              title={serverHealth?.error || ""}
            >
              {serverHealth === null ? "..." : serverHealth.ok ? `${latency}ms` : "OFFLINE"}
            </div>
          </div>
          
           <button
             onClick={() => setHasStarted(false)}
             className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500/20 text-red-200 border border-red-500/50 hover:bg-red-500/30 transition-colors backdrop-blur-md"
           >
             EXIT
           </button>
        </div>
      </div>

      {roomName === "snake" && status === "over" && result && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 glass-panel p-8 bg-black/90 border-primary/30 min-w-[300px] flex flex-col items-center gap-4 animate-in fade-in zoom-in">
          <div className="text-white font-black text-3xl uppercase tracking-tighter">Match Complete</div>
          <div className="text-sm text-gray-400 text-center">
            Winner
            <span className="text-primary font-mono block text-xl mt-2 font-bold break-all">
              {result.winnerAddress ? result.winnerAddress : "No winner"}
            </span>
          </div>
           <button
              onClick={() => setSessionKey((k) => k + 1)}
              className="mt-4 w-full text-sm font-bold px-6 py-3 rounded-md bg-primary text-black hover:bg-primary/90 transition-transform active:scale-95"
            >
              PLAY AGAIN
            </button>
        </div>
      )}
      
      {(status === "over" || status === "error") && roomName !== "snake" && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 glass-panel p-6 bg-black/80 flex flex-col items-center gap-4">
            <div className="text-xl font-bold text-white">{status === "error" ? "Connection Error" : "Game Over"}</div>
            <div className="flex gap-3">
                <button
                onClick={() => setHasStarted(false)}
                className="text-xs font-bold px-4 py-2 rounded-md bg-white/10 text-white hover:bg-white/20"
                >
                Exit
                </button>
                <button
                onClick={() => setSessionKey((k) => k + 1)}
                className="text-xs font-bold px-4 py-2 rounded-md bg-primary text-black hover:bg-primary/90"
                >
                Respawn
                </button>
            </div>
          </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden rounded-none border-none bg-black relative w-full h-full">
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
