"use client";

import React, { useState, useEffect } from 'react';
import WormsGame from '@/components/game/WormsGame';
import {
  Gamepad2,
  Coins,
  Trophy,
  Plus,
  Wallet,
  Sparkles,
  Gift,
  Share2,
  Settings,
  Mail,
  Timer,
  TicketPercent,
  PlayCircle,
  Video,
} from 'lucide-react';
import { WalletProvider, useWallet } from '@/components/economy/WalletContext';
import { useWallet as useWeb3Wallet } from '@/hooks/useWallet';
import PaymentModal from '@/components/economy/PaymentModal';
import { UserProfile, WormsMode } from '@/types/game';
import { useRouter } from 'next/navigation';

type GoogleAdBannerProps = {
  slot: string;
  layout?: 'horizontal' | 'rectangle';
};

function GoogleAdBanner({ slot, layout = 'horizontal' }: GoogleAdBannerProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch {
    }
  }, []);

  const style =
    layout === 'horizontal'
      ? { display: 'block', width: '100%', minHeight: 90 }
      : { display: 'block', width: '100%', minHeight: 250 };

  return (
    <ins
      className="adsbygoogle block overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/80"
      style={style as React.CSSProperties}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

function WormsInfoSections() {
  return (
    <div className="mt-16 space-y-16">
      <section
        id="info"
        className="grid md:grid-cols-2 gap-10 items-center rounded-3xl bg-slate-950/60 border border-sky-900/80 px-6 py-8 md:px-10 md:py-12 shadow-[0_0_40px_rgba(8,47,73,0.75)]"
      >
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.28em] text-sky-400 uppercase">
            Worms Zone, Reimagined
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            Dynamic arena with hungry, fast-growing worms
          </h2>
          <p className="text-sm md:text-base text-sky-100/80">
            Start as a tiny explorer on the edge of the grid and spiral into a screen-filling coil.
            Every bite of food and every risky turn increases your mass, stretching your worm into a
            glowing anaconda that can wrap entire sectors of the arena.
          </p>
          <p className="text-xs text-sky-200/80">
            Collide with another body and your trail explodes into loot for everyone else. Survive
            long enough and the arena feels like a living graph of your decisions.
          </p>
        </div>
        <div className="relative h-44 md:h-56">
          <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-emerald-400/25 via-sky-400/15 to-indigo-500/25 border border-cyan-300/40 shadow-[0_0_60px_rgba(56,189,248,0.7)]" />
          <div className="absolute inset-[18%] rounded-[28px] bg-black/60 border border-white/10 flex items-center justify-center">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-tr from-emerald-300 via-sky-300 to-cyan-200 opacity-90 blur-0" />
          </div>
        </div>
      </section>

      <section
        id="customize"
        className="grid md:grid-cols-2 gap-10 items-center rounded-3xl bg-slate-950/60 border border-emerald-900/80 px-6 py-8 md:px-10 md:py-12"
      >
        <div className="order-2 md:order-1 space-y-3">
          <p className="text-xs font-semibold tracking-[0.28em] text-emerald-300 uppercase">
            Worm Wardrobe
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-emerald-100">
            Skins, faces, and expressive coils
          </h2>
          <p className="text-sm md:text-base text-emerald-50/90">
            Swap between neon, shadow, gold and more experimental looks, then head into the arena
            with a worm that actually feels like yours. As the body grows, the thickness scales with
            your length, so big plays literally look heavier on screen.
          </p>
          <p className="text-xs text-emerald-100/80">
            Visit your Worm Wardrobe from this page to manage cosmetics, equip rare trails, and
            prepare a signature look before the next run.
          </p>
        </div>
        <div className="order-1 md:order-2 relative h-44 md:h-56">
          <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-emerald-400/30 via-lime-400/10 to-sky-400/25 border border-emerald-300/50 shadow-[0_0_50px_rgba(16,185,129,0.7)]" />
          <div className="absolute inset-[18%] rounded-[28px] bg-black/60 border border-emerald-500/40 flex items-center justify-center">
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-300 to-cyan-200" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-rose-200" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-300 to-sky-300" />
            </div>
          </div>
        </div>
      </section>

      <section
        id="powerups"
        className="rounded-3xl bg-slate-950/60 border border-indigo-900/80 px-6 py-8 md:px-10 md:py-12"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="max-w-md space-y-3">
            <p className="text-xs font-semibold tracking-[0.28em] text-indigo-300 uppercase">
              Power-Ups
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-indigo-50">
              Tilt the arena with smart boosts
            </h2>
            <p className="text-sm md:text-base text-indigo-100/85">
              Collect temporary boosts that change how your worm behaves. Stack them with timing and
              pathing to overtake massive rivals in a single, risky swoop.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <div className="rounded-2xl bg-slate-900/70 border border-sky-700/70 px-4 py-3 text-xs text-sky-100 space-y-1">
              <div className="font-semibold text-sky-200">Magnet Sweep</div>
              <p className="text-sky-100/75">
                Expands your pickup radius so nearby food and shards slide into your path.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-900/70 border border-amber-700/70 px-4 py-3 text-xs text-amber-100 space-y-1">
              <div className="font-semibold text-amber-200">Food Multiplier</div>
              <p className="text-amber-100/80">
                Increases the value of each bite, letting your worm gain mass much faster.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-900/70 border border-rose-700/70 px-4 py-3 text-xs text-rose-100 space-y-1">
              <div className="font-semibold text-rose-200">Collision Radar</div>
              <p className="text-rose-100/80">
                Highlights recent crashes on the map so you can dive into fresh loot before others.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-900/70 border border-violet-700/70 px-4 py-3 text-xs text-violet-100 space-y-1">
              <div className="font-semibold text-violet-200">Speed, Maneuver, Zoom</div>
              <p className="text-violet-100/80">
                Tune your steering, burst speed and camera zoom to weave through dense traffic.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="rankings"
        className="rounded-3xl bg-slate-950/60 border border-slate-800 px-6 py-8 md:px-10 md:py-12"
      >
        <div className="grid md:grid-cols-[1.2fr,0.8fr] gap-8 items-center">
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-[0.28em] text-amber-300 uppercase">
              Rankings
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-amber-100">
              Climb the size ladder and chase new records
            </h2>
            <p className="text-sm md:text-base text-amber-50/90">
              Each run feeds into a live size ladder that tracks your growth versus bots and other
              pilots in the arena. Grow clean, survive collisions, and your bar dominates the chart.
            </p>
            <p className="text-xs text-amber-100/80">
              Combine Infinity, Time Assault or Treasure Hunt with smart power-ups and you will
              quickly see which strategies actually translate into mass on the board.
            </p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-400/40 px-5 py-4 shadow-[0_0_40px_rgba(251,191,36,0.4)] text-xs text-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.22em] text-slate-300">
                Sample Ladder
              </span>
              <span className="text-[10px] text-amber-200">Mass by food consumed</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-4 text-[10px] text-slate-500 font-mono text-right">1</span>
                <div className="flex-1 h-3 rounded-full bg-slate-800/80 overflow-hidden border border-emerald-400/60">
                  <div className="h-full w-4/5 bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.9)]" />
                </div>
                <span className="w-20 text-[10px] text-right text-emerald-200">You</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 text-[10px] text-slate-500 font-mono text-right">2</span>
                <div className="flex-1 h-3 rounded-full bg-slate-800/80 overflow-hidden border border-slate-600">
                  <div className="h-full w-2/3 bg-slate-300/90" />
                </div>
                <span className="w-20 text-[10px] text-right text-slate-200">Bot Squad</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 text-[10px] text-slate-500 font-mono text-right">3</span>
                <div className="flex-1 h-3 rounded-full bg-slate-800/80 overflow-hidden border border-slate-600">
                  <div className="h-full w-2/5 bg-slate-300/80" />
                </div>
                <span className="w-20 text-[10px] text-right text-slate-200">Arena Crowd</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function GameLobby() {
  const router = useRouter();
  const { balanceB21, payEntryFee, addToHistory } = useWallet();
  const { address } = useWeb3Wallet();
  const [hasPaid, setHasPaid] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [energy, setEnergy] = useState({ current: 10, max: 20 });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedMode, setSelectedMode] = useState<WormsMode>('infinity');

  useEffect(() => {
    if (address) {
      fetch(`/api/user/profile?address=${address}`)
        .then(res => res.json())
        .then(data => {
            if (!data.error) setProfile(data);
        })
        .catch(console.error);
    }
  }, [address]);

  const ENTRY_FEE = 10;

  const handleStartGame = () => {
    if (energy.current <= 0) {
      alert("You are out of energy. Recharge using Cosmic Snacks.");
      return;
    }
    if (payEntryFee(ENTRY_FEE)) {
      setHasPaid(true);
      setLastScore(null);
      setEnergy((prev) => ({ ...prev, current: Math.max(0, prev.current - 1) }));
    } else {
      alert("Not enough B21 Coins. Swap balance to refill.");
      setShowPayment(true);
    }
  };

  const handleGameOver = async (score: number) => {
    setLastScore(score);
    
    let reward = 0;
    if (score > 100) {
      reward = Math.floor(score / 10);
      addToHistory('game_win', reward, `Arena bonus for score ${score}`);
      alert(`Great run! You unlocked a bonus of ${reward} B21 (simulated).`);
    }

    if (address && profile) {
        const newHighScore = Math.max(score, profile.highScore);
        
        await fetch('/api/user/profile', {
            method: 'POST',
            body: JSON.stringify({
                address,
                data: {
                    highScore: newHighScore,
                    gamesPlayed: profile.gamesPlayed + 1,
                    totalB21Earned: profile.totalB21Earned + reward,
                    xp: profile.xp + Math.floor(score / 5)
                }
            })
        });
        
        // Refresh
        fetch(`/api/user/profile?address=${address}`)
            .then(res => res.json())
            .then(data => { if(!data.error) setProfile(data); });
    }
  };

  if (hasPaid) {
    return (
      <div className="fixed inset-x-0 top-20 bottom-0 z-50 bg-black/80 backdrop-blur-md flex items-stretch justify-center px-4">
        <div className="relative w-full max-w-6xl h-full max-h-[calc(100vh-5rem)] rounded-[32px] overflow-hidden border border-slate-700 bg-slate-950 shadow-[0_0_80px_rgba(15,23,42,0.9)]">
          <WormsGame 
            onGameOver={handleGameOver}
            playerName={profile?.username || "Cosmic Captain"}
            skinId={(profile?.activeSkin as any) || "neon"}
            mode={selectedMode}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-6xl mx-auto">
      <PaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} />

      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-900 via-sky-950 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(56,189,248,0.16),transparent_55%),radial-gradient(circle_at_90%_100%,rgba(251,191,36,0.18),transparent_55%)]" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[size:18px_18px]" />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 bg-sky-900/60 border border-sky-500/40 rounded-2xl px-4 py-3 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-orange-400 flex items-center justify-center border-2 border-white/80 shadow-md">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-sm md:text-base">Cosmic Captain</span>
                <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-bold text-amber-300 tracking-wide uppercase">
                  Level 18
                </span>
              </div>
              <div className="w-40 h-2.5 rounded-full bg-sky-950/80 overflow-hidden border border-sky-700/70">
                <div className="h-full w-2/3 bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400" />
              </div>
              <p className="text-[11px] text-sky-100/80">XP Trail: 12,430 / 18,000</p>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/20 text-[11px] font-semibold text-white shadow">
              <PlayCircle className="w-4 h-4 text-green-400" />
              Get it on Play Store
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/20 text-[11px] font-semibold text-white shadow">
              <PlayCircle className="w-4 h-4 text-sky-300" />
              Download on App Store
            </button>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 bg-black/40 rounded-full px-3 py-1 border border-red-400/60 shadow-lg">
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">
                  ⚡
                </div>
                <span className="text-xs font-semibold text-white">Energy</span>
              </div>
              <span className="text-xs font-mono text-red-100">
                {energy.current}/{energy.max}
              </span>
              <button
                type="button"
                onClick={() => setShowPayment(true)}
                className="ml-1 w-5 h-5 rounded-full bg-red-400 text-black flex items-center justify-center text-xs font-bold hover:bg-red-300"
              >
                +
              </button>
            </div>

            <div className="flex items-center gap-2 bg-black/40 rounded-full px-3 py-1 border border-yellow-400/60 shadow-lg">
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-yellow-300" />
                <span className="text-xs font-semibold text-white">B21 Coins</span>
              </div>
              <span className="text-xs font-mono text-amber-100">
                {balanceB21.toLocaleString()}
              </span>
              <button
                type="button"
                onClick={() => setShowPayment(true)}
                className="ml-1 w-5 h-5 rounded-full bg-amber-300 text-black flex items-center justify-center text-xs font-bold hover:bg-amber-200"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[auto,1fr,auto] gap-3 md:gap-6 items-center">
          <div className="flex flex-col gap-3 items-start">
            <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-orange-500/90 border border-orange-300 text-xs font-bold text-black shadow-lg hover:bg-orange-400">
              <Gift className="w-4 h-4" />
              Daily Blast Bonus
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-sky-800/80 border border-sky-500/70 text-xs font-bold text-sky-100 hover:bg-sky-700">
              <Timer className="w-4 h-4 text-emerald-300" />
              Galaxy Sprint • 2d 10h
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-violet-800/80 border border-violet-500/70 text-xs font-bold text-violet-100 hover:bg-violet-700">
              <TicketPercent className="w-4 h-4 text-amber-300" />
              Mystery Crate Event
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-cyan-400/20" />
            <div className="relative mx-auto max-w-md rounded-[32px] bg-sky-900/90 border border-sky-400/60 shadow-[0_0_40px_rgba(56,189,248,0.45)] px-6 py-6 md:px-8 md:py-8">
              <div className="flex items-center justify-center mb-4">
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-semibold tracking-[0.2em] text-cyan-200 uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Neo Worms
                  </span>
                  <h1 className="mt-2 text-4xl md:text-5xl font-black text-yellow-300 drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] tracking-tight">
                    Cosmic Coil
                  </h1>
                  <p className="mt-1 text-xs text-sky-100/80">Eat the galaxy. Out-sprint the swarm.</p>
                </div>
              </div>

              <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-center mt-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-16 h-16 rounded-2xl bg-amber-400 flex items-center justify-center shadow-xl border-4 border-amber-200">
                    <Gift className="w-8 h-8 text-amber-900" />
                  </div>
                  <span className="text-[11px] font-semibold text-amber-100 mt-1">
                    Nova Gift
                  </span>
                  <button className="text-[10px] text-sky-100 underline underline-offset-2">
                    Peek rewards
                  </button>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="px-3 py-1 rounded-full bg-black/40 border border-white/20 text-[10px] font-semibold text-white flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-300" />
                    No-Ads Launch Pack
                  </div>
                  <div className="text-center text-[11px] text-sky-100/90">
                    Includes bonus skin, XP boost, and coin burst.
                  </div>
                  <button className="mt-1 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-400 text-black text-xs font-bold shadow hover:bg-emerald-300">
                    2.99 USD
                  </button>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="w-16 h-16 rounded-2xl bg-sky-800 flex items-center justify-center shadow-lg border-4 border-sky-500/70">
                    <Video className="w-8 h-8 text-cyan-200" />
                  </div>
                  <span className="text-[11px] font-semibold text-sky-100 mt-1">
                    Watch & Win
                  </span>
                  <button className="text-[10px] text-sky-100 underline underline-offset-2">
                    2x reward
                  </button>
                </div>
              </div>

              {lastScore !== null && (
                <div className="mt-4 inline-flex items-center gap-3 rounded-full bg-black/40 border border-emerald-400/50 px-4 py-1.5">
                  <Trophy className="w-4 h-4 text-amber-300" />
                  <span className="text-xs text-emerald-100">
                    Last flight: <span className="font-mono font-semibold">{lastScore} pts</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 items-end">
            <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-yellow-500/90 border border-yellow-300 text-xs font-bold text-black shadow-lg hover:bg-yellow-400">
              <TicketPercent className="w-4 h-4" />
              Flash Offers • 1d 22h
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-700/90 border border-emerald-400/80 text-xs font-bold text-emerald-50 hover:bg-emerald-600">
              <Timer className="w-4 h-4 text-emerald-200" />
              Skill Trials • 1h 59m
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-pink-700/80 border border-pink-400/80 text-xs font-bold text-pink-50 hover:bg-pink-600">
              <Sparkles className="w-4 h-4 text-amber-200" />
              Lucky Spin Portal
            </button>
          </div>
        </div>

          <div className="flex flex-col items-center gap-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-3xl">
              <button
                type="button"
                onClick={() => setSelectedMode('infinity')}
                className={[
                  'relative px-4 py-3 rounded-2xl border text-left flex items-center gap-3 transition-all',
                  'bg-slate-900/60 hover:bg-slate-800/80',
                  selectedMode === 'infinity'
                    ? 'border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.55)]'
                    : 'border-slate-600/70',
                ].join(' ')}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center text-black font-black text-lg shadow-md">
                  INF
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Infinity Run</span>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-300">
                      Endless
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-sky-100/80">
                    Survive as long as you can. No time cap, pure mastery.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode('time')}
                className={[
                  'relative px-4 py-3 rounded-2xl border text-left flex items-center gap-3 transition-all',
                  'bg-slate-900/60 hover:bg-slate-800/80',
                  selectedMode === 'time'
                    ? 'border-violet-400 shadow-[0_0_25px_rgba(139,92,246,0.55)]'
                    : 'border-slate-600/70',
                ].join(' ')}
              >
                <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-black font-black text-lg shadow-md">
                  T
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Time Assault</span>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-violet-200">
                      5:00
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-sky-100/80">
                    Five minutes on the clock. Chain huge multipliers before it fades.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode('treasure')}
                className={[
                  'relative px-4 py-3 rounded-2xl border text-left flex items-center gap-3 transition-all',
                  'bg-slate-900/60 hover:bg-slate-800/80',
                  selectedMode === 'treasure'
                    ? 'border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.55)]'
                    : 'border-slate-600/70',
                ].join(' ')}
              >
                <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-black font-black text-lg shadow-md">
                  💰
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Treasure Hunt</span>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-amber-200">
                      3:00
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-sky-100/80">
                    Short, dense runs. Chase rare food bursts and risky clusters.
                  </p>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={handleStartGame}
              className="w-full sm:w-auto px-16 py-4 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 text-black text-2xl sm:text-3xl font-black shadow-[0_14px_0_0_rgba(6,95,70,1),0_0_40px_rgba(34,197,94,0.7)] hover:translate-y-[2px] hover:shadow-[0_10px_0_0_rgba(6,95,70,1),0_0_30px_rgba(34,197,94,0.7)] transition-all flex items-center justify-center gap-3"
            >
              <span>
                Launch {selectedMode === 'infinity' ? 'Infinity' : selectedMode === 'time' ? 'Time' : 'Treasure'} Run
              </span>
              <Gamepad2 className="w-7 h-7" />
            </button>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-sky-100/80">
            <button
              type="button"
              onClick={() => router.push('/profile')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-900/80 border border-sky-500/60 text-sky-100 hover:bg-sky-800"
            >
              <Wallet className="w-4 h-4 text-emerald-300" />
              Worm Wardrobe
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-slate-500/60 text-slate-100 hover:bg-black/60"
            >
              <Settings className="w-4 h-4" />
              Arena Settings
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-slate-500/60 text-slate-100 hover:bg-black/60"
            >
              <Share2 className="w-4 h-4 text-sky-300" />
              Invite Squad
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-slate-500/60 text-slate-100 hover:bg-black/60"
            >
              <Mail className="w-4 h-4 text-amber-300" />
              Inbox
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WormsPage() {
  return (
    <WalletProvider>
      <main className="min-h-screen bg-black text-white pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 space-y-4">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-green-500/10 border border-green-500/20">
              <Gamepad2 className="w-6 h-6 text-green-400 mr-2" />
              <span className="text-sm font-mono text-green-200">BETA ACCESS</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-400 via-emerald-300 to-blue-500 bg-clip-text text-transparent">
              Neo Worms
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] md:text-xs text-sky-100/80">
              <a href="#info" className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/70 hover:border-sky-500/60">
                Info
              </a>
              <a href="#customize" className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/70 hover:border-emerald-400/60">
                Customize Worm
              </a>
              <a href="#powerups" className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/70 hover:border-indigo-400/60">
                Power-Ups
              </a>
              <a href="#rankings" className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/70 hover:border-amber-400/60">
                Rankings
              </a>
            </div>
            <div className="mx-auto max-w-3xl">
              <GoogleAdBanner slot="0000000001" layout="horizontal" />
            </div>
          </div>

          <GameLobby />

          <div className="mt-8 mx-auto max-w-4xl">
            <GoogleAdBanner slot="0000000002" layout="rectangle" />
          </div>

          <WormsInfoSections />
        </div>
      </main>
    </WalletProvider>
  );
}
