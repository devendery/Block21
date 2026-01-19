import React from 'react';
import { Trophy, Coins, Share2, Play, X } from 'lucide-react';
import { UserProfile, GameStats } from '@/types/game';
import AdContainer from '@/components/ads/AdContainer';

type GameOverModalProps = {
  stats: GameStats;
  profile: UserProfile | null;
  address: string | null;
  onRestart: () => void;
  onClose: () => void;
};

export default function GameOverModal({
  stats,
  profile,
  address,
  onRestart,
  onClose,
}: GameOverModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="flex items-center justify-center w-full h-full px-4">
        <div className="w-full max-w-xl rounded-[32px] bg-slate-950/95 border border-sky-600/70 px-8 py-6 shadow-[0_0_60px_rgba(56,189,248,0.8)]">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold tracking-[0.3em] uppercase text-sky-300">
              Result
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-900/80 border border-slate-600 flex items-center justify-center text-slate-300 hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Trophy + score */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 shadow-[0_0_40px_rgba(250,204,21,0.75)] flex items-center justify-center">
              <Trophy className="w-14 h-14 text-amber-950 drop-shadow-[0_4px_0_rgba(0,0,0,0.4)]" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/90 border border-amber-300 text-xs font-black text-amber-100 font-mono">
                {stats.score}
              </div>
            </div>
            <div className="mt-4 text-[13px] text-sky-100/80">
              Great run,{' '}
              <span className="font-semibold">
                {profile?.username || `Player${address?.slice(0, 6) || ''}`}
              </span>
              .
            </div>
          </div>

          {/* Stats row (4 cards) */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-sky-100">
            <div className="rounded-2xl bg-slate-900/80 border border-slate-700 px-4 py-3">
              <div className="text-[11px] text-sky-400 uppercase tracking-[0.2em]">
                Collected
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <Coins className="w-4 h-4 text-amber-300" />
                <span className="font-mono text-lg">
                  {stats.collected}
                </span>
                <span className="text-[11px] text-slate-400">items</span>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/80 border border-slate-700 px-4 py-3">
              <div className="text-[11px] text-sky-400 uppercase tracking-[0.2em]">
                Lifetime
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-mono text-lg">
                  {stats.lifetime}s
                </span>
                <span className="text-[11px] text-slate-400">in arena</span>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/80 border border-slate-700 px-4 py-3">
              <div className="text-[11px] text-sky-400 uppercase tracking-[0.2em]">
                Defeated
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-mono text-lg">
                  {stats.defeated}
                </span>
                <span className="text-[11px] text-slate-400">worms</span>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/80 border border-slate-700 px-4 py-3">
              <div className="text-[11px] text-sky-400 uppercase tracking-[0.2em]">
                Experience
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-mono text-lg">
                  {stats.experience}
                </span>
                <span className="text-[11px] text-slate-400">xp</span>
              </div>
            </div>
          </div>

          {/* Ad Placement */}
          <div className="mt-4 flex justify-center w-full">
            <AdContainer 
              slot="GAMEOVER_SQUARE_AD" 
              format="rectangle" 
              style={{ width: '300px', height: '250px' }}
              label="Sponsored"
            />
          </div>

          {/* Buttons: share + restart */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900/90 border border-slate-600 text-[13px] font-semibold text-sky-100 hover:bg-slate-800"
            >
              <Share2 className="w-4 h-4 text-sky-300" />
              Share run
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-emerald-400 text-black text-sm font-black shadow-[0_10px_0_rgba(6,95,70,1)] hover:translate-y-[2px] hover:shadow-[0_6px_0_rgba(6,95,70,1)] transition-all"
            >
              <Play className="w-5 h-5" />
              Restart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
