"use client";

/**
 * PHASE-1 ARCHITECTURE FROZEN
 * 
 * Boundary Rules:
 * 1. This file OWNS React UI, Wallet, Overlays.
 * 2. NO Phaser or Colyseus imports allowed directly.
 * 3. MUST use GameRuntime.ts for all game logic.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { parseUnits } from "viem";
import { Meteors } from "@/components/ui/meteors";
import { MagicCard } from "@/components/ui/magic-card";
import { BorderBeam } from "@/components/ui/border-beam";
import { cn, B21_CONTRACT_ADDRESS, OWNER_WALLET_ADDRESS } from "@/lib/utils";
import { 
  startGame, 
  stopGame, 
  updateCosmetics, 
  SKIN_OPTIONS, 
  EYES_OPTIONS, 
  MOUTH_OPTIONS,
  SKIN_PALETTES
} from "../../../game-client/GameRuntime";
import { Trophy, Users, Activity, Zap, Crown } from "lucide-react";

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

const toHex = (color: number) => `#${color.toString(16).padStart(6, '0')}`;

export default function SnakeGame({ roomName = "snake_arena" }: { roomName?: string }) {
  const { address, isConnected } = useAccount();
  const [guestAddress, setGuestAddress] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "playing" | "over" | "error" | "paying">("idle");
  const [result, setResult] = useState<{ winnerAddress: string | null; players: any[] } | null>(null);
  const [roomStatus, setRoomStatus] = useState<string>("idle");
  const [playerCount, setPlayerCount] = useState<number>(0);

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
    if (!hasStarted) return;
    updateCosmetics(skin, eyes, mouth);
  }, [eyes, hasStarted, mouth, skin]);

  useEffect(() => {
    const joinAddress = isConnected && address ? address : roomName === "snake" ? null : guestAddress;
    if (!joinAddress) return;
    if (!containerRef.current) return;
    if (!hasStarted) return;

    let destroyed = false;

    const start = async () => {
      if (roomName !== "snake_practice" && isConnected && address) {
        setStatus("paying");
        try {
          const isDev = process.env.NODE_ENV === "development";
          let txHash = "dev_bypass_tx_" + Date.now();
          
          if (!isDev) {
             const fee = parseUnits("10", 8); 
             if (b21Balance && b21Balance < fee) {
               alert("Insufficient B21 Balance! You need 10 B21 to play.");
               setStatus("idle");
               setHasStarted(false);
               return;
             }
             txHash = await writeContractAsync({
               address: B21_CONTRACT_ADDRESS as `0x${string}`,
               abi: ERC20_ABI,
               functionName: "transfer",
               args: [OWNER_WALLET_ADDRESS as `0x${string}`, fee],
             });
          }

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

      if (destroyed) return;
      
      const joinOptions: any = { address: joinAddress, skin, eyes, mouth };
      if (roomName === "snake_practice") joinOptions.bots = 4;
      if (customPalette) joinOptions.customPalette = customPalette;

      startGame({
        container: containerRef.current!,
        wsUrl,
        roomName,
        joinOptions,
        onStatus: (s) => {
            if (destroyed) return;
            setStatus(s);
        },
        onStats: (stats) => {
            if (destroyed) return;
            setMyScore(stats.score);
            setMyRank(stats.rank);
            setAliveCount(stats.aliveCount);
            if (typeof stats.playerCount === "number") setPlayerCount(stats.playerCount);
            setMyPower(stats.power || "");
            setMyPowerEndsAt(stats.powerEndsAt || 0);
            setMyRewardMultBps(stats.rewardMultBps || 0);
            setMyLastFood(stats.lastFood || "");
            setMyLastRarity(stats.lastRarity || "");
            if (stats.roomStatus) setRoomStatus(stats.roomStatus);
        },
        onGameOver: (res) => {
            if (destroyed) return;
            setResult(res);
        },
        onRewardIndicator: (target) => {
            if (destroyed) return;
            if (target === joinAddress.toLowerCase()) {
                setRewardFlashUntil(Date.now() + 3000);
            }
        }
      });
    };

    start();

    return () => {
      destroyed = true;
      stopGame();
    };
  }, [address, guestAddress, isConnected, roomName, sessionKey, wsUrl, hasStarted, customPalette, b21Balance, writeContractAsync]);

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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <h3 className="text-xl font-bold text-white">How to Play</h3>
                           <ul className="space-y-2 text-sm text-gray-400">
                              <li className="flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                 Eat food to grow and earn points
                              </li>
                              <li className="flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                 Avoid hitting walls and other players
                              </li>
                              <li className="flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                 Boost (Click) to speed up (consumes length)
                              </li>
                           </ul>
                        </div>
                        
                        <div className="space-y-4">
                           <div className="flex gap-2">
                              <div className="flex-1 space-y-1">
                                 <label className="text-xs font-bold text-gray-500 uppercase">Skin</label>
                                 <div className="flex flex-wrap gap-2">
                                    {SKIN_OPTIONS.map((s) => {
                                       const palette = SKIN_PALETTES[s];
                                       const isActive = skin === s;
                                       return (
                                          <button
                                             key={s}
                                             onClick={() => setSkin(s)}
                                             className={cn(
                                                "group relative px-3 py-2 text-xs rounded-lg border transition-all duration-200 flex flex-col items-center gap-1.5 min-w-[60px]",
                                                isActive 
                                                   ? "bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(34,197,94,0.3)]" 
                                                   : "bg-black/40 border-white/10 text-gray-400 hover:border-white/30 hover:bg-white/5"
                                             )}
                                          >
                                             <div 
                                                className="w-6 h-6 rounded-full shadow-sm border border-white/10"
                                                style={{ 
                                                   background: `linear-gradient(135deg, ${toHex(palette.primary)} 0%, ${toHex(palette.secondary)} 100%)` 
                                                }}
                                             />
                                             <span className="capitalize font-medium">{s}</span>
                                          </button>
                                       );
                                    })}
                                 </div>
                              </div>
                           </div>
                           <div className="flex gap-4">
                              <div className="flex-1 space-y-1">
                                 <label className="text-xs font-bold text-gray-500 uppercase">Eyes</label>
                                 <div className="flex flex-wrap gap-1">
                                    {EYES_OPTIONS.map((e) => (
                                       <button
                                          key={e}
                                          onClick={() => setEyes(e)}
                                          className={cn(
                                             "px-2 py-1 text-xs rounded border transition-colors",
                                             eyes === e ? "bg-primary text-black border-primary" : "bg-black/40 border-white/10 text-gray-400 hover:border-white/30"
                                          )}
                                       >
                                          {e}
                                       </button>
                                    ))}
                                 </div>
                              </div>
                              <div className="flex-1 space-y-1">
                                 <label className="text-xs font-bold text-gray-500 uppercase">Mouth</label>
                                 <div className="flex flex-wrap gap-1">
                                    {MOUTH_OPTIONS.map((m) => (
                                       <button
                                          key={m}
                                          onClick={() => setMouth(m)}
                                          className={cn(
                                             "px-2 py-1 text-xs rounded border transition-colors",
                                             mouth === m ? "bg-primary text-black border-primary" : "bg-black/40 border-white/10 text-gray-400 hover:border-white/30"
                                          )}
                                       >
                                          {m}
                                       </button>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-col justify-between gap-6">
                        <div className="space-y-4">
                           <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                 <span className="text-gray-400">Server Status</span>
                                 <div className="flex items-center gap-2">
                                    <div className={cn("w-2 h-2 rounded-full animate-pulse", serverHealth?.ok ? "bg-green-500" : "bg-red-500")} />
                                    <span className={cn("font-bold", serverHealth?.ok ? "text-green-500" : "text-red-500")}>
                                       {serverHealth?.ok ? "Online" : "Offline"}
                                    </span>
                                 </div>
                              </div>
                              {serverHealth?.error && (
                                 <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded">{serverHealth.error}</div>
                              )}
                              <div className="flex items-center justify-between text-sm">
                                 <span className="text-gray-400">Active Players</span>
                                 <span className="text-white font-bold tabular-nums">{playerCount}</span>
                              </div>
                           </div>

                           {roomName === "snake" && (
                              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                 <div className="text-yellow-500 font-bold text-sm mb-1">Ranked Match</div>
                                 <div className="text-xs text-yellow-200/80">
                                    Entry Fee: <span className="text-white font-bold">10 B21</span>
                                    <br />
                                    Winner takes 90% of pot.
                                 </div>
                              </div>
                           )}
                        </div>

                        <button
                           disabled={!serverHealth?.ok || status === "paying"}
                           onClick={() => setHasStarted(true)}
                           className="w-full group relative overflow-hidden rounded-lg bg-primary px-8 py-4 transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                        >
                           <div className="relative z-10 flex items-center justify-center gap-2 text-black font-black text-xl uppercase tracking-widest">
                              {status === "paying" ? "Processing..." : "Enter Arena"}
                           </div>
                           <div className="absolute inset-0 z-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>
                     </div>
                  </div>
               </MagicCard>
             </div>
          </div>
        </div>
      )}

      {hasStarted && (
        <div className="absolute top-4 left-4 right-4 z-40 flex items-start justify-between pointer-events-none">
          <div>
           <div className="text-white font-bold text-shadow-sm">
            {roomName === "snake_practice" ? "Practice Room" : roomName === "snake" ? "Match Room" : "Arena Room"}
          </div>
          <div className="text-xs text-gray-400">{subtitle}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-3 bg-black/60 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-md shadow-xl">
               <Trophy className="w-4 h-4 text-yellow-500" />
               <div className="flex flex-col leading-none">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Score</div>
                  <div className="text-sm font-black text-white tabular-nums">{myScore}</div>
               </div>
            </div>
            <div className="flex items-center gap-3 bg-black/60 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-md shadow-xl">
               <Crown className="w-4 h-4 text-purple-400" />
               <div className="flex flex-col leading-none">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Rank</div>
                  <div className="text-sm font-black text-white tabular-nums">
                    {myRank ? `#${myRank}` : "-"}
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-3 bg-black/60 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-md shadow-xl">
               <Users className="w-4 h-4 text-blue-400" />
               <div className="flex flex-col leading-none">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Alive</div>
                  <div className="text-sm font-black text-white tabular-nums">{aliveCount}</div>
               </div>
            </div>
            {myPower && (
                 <div className="flex items-center gap-3 bg-purple-500/20 border border-purple-500/50 rounded-xl px-4 py-2 backdrop-blur-md animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                    <Zap className="w-4 h-4 text-purple-300" />
                    <div className="flex flex-col leading-none">
                       <div className="text-[9px] font-bold text-purple-300 uppercase tracking-wider mb-0.5">{myPower}</div>
                       <div className="text-sm font-black text-white tabular-nums">{powerLeftS}s</div>
                    </div>
                 </div>
            )}
            {myRewardMultBps > 0 && (
                 <div className="flex items-center gap-3 bg-yellow-500/20 border border-yellow-500/50 rounded-xl px-4 py-2 backdrop-blur-md">
                    <Activity className="w-4 h-4 text-yellow-300" />
                    <div className="flex flex-col leading-none">
                       <div className="text-[9px] font-bold text-yellow-300 uppercase tracking-wider mb-0.5">Bonus</div>
                       <div className="text-sm font-black text-white tabular-nums">+{myRewardMultBps / 100}%</div>
                    </div>
                 </div>
            )}
          </div>
        </div>
      </div>
      )}

      {showRewardFlash && (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center animate-out fade-out zoom-out duration-1000">
             <div className="text-6xl font-black text-yellow-400 text-shadow-lg drop-shadow-[0_0_30px_rgba(250,204,21,0.6)] animate-bounce">
                REWARD!
             </div>
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
