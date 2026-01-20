import React from 'react';
import { Trophy, Coins, Share2, Play, X } from 'lucide-react';
import { UserProfile, GameStats } from '@/types/game';
import AdContainer from '@/components/ads/AdContainer';
import { formatNameWithWalletSuffix } from '@/lib/nameFormat';

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
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[32px] bg-slate-950 border border-sky-600/70 shadow-[0_0_60px_rgba(56,189,248,0.8)] flex flex-col">
        <div className="p-6">
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
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 shadow-[0_0_30px_rgba(250,204,21,0.6)] flex items-center justify-center">
              <Trophy className="w-10 h-10 text-amber-950 drop-shadow-[0_2px_0_rgba(0,0,0,0.4)]" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-950/90 border border-amber-300 text-[10px] font-black text-amber-100 font-mono">
                {stats.score}
              </div>
            </div>
            <div className="mt-2 text-[10px] text-sky-100/80">
              Great run,{" "}
              <span className="font-semibold">
                {profile?.username && address ? formatNameWithWalletSuffix(profile.username, address) : profile?.username || "Player"}
              </span>
            </div>
          </div>

          {/* Stats row (4 cards) - Horizontal Scroll on very small screens or 4 cols */}
          <div className="grid grid-cols-4 gap-2 text-sm text-sky-100 mb-4">
            <div className="col-span-2 sm:col-span-1 rounded-lg bg-slate-900/80 border border-slate-700 px-2 py-2 flex flex-col items-center text-center">
              <div className="text-[9px] text-sky-400 uppercase tracking-wider">Collected</div>
              <div className="mt-0.5 flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-300" />
                <span className="font-mono text-sm">{stats.collected}</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-lg bg-slate-900/80 border border-slate-700 px-2 py-2 flex flex-col items-center text-center">
              <div className="text-[9px] text-sky-400 uppercase tracking-wider">Time</div>
              <div className="mt-0.5 font-mono text-sm">{stats.lifetime}s</div>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-lg bg-slate-900/80 border border-slate-700 px-2 py-2 flex flex-col items-center text-center">
              <div className="text-[9px] text-sky-400 uppercase tracking-wider">Kills</div>
              <div className="mt-0.5 font-mono text-sm">{stats.defeated}</div>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-lg bg-slate-900/80 border border-slate-700 px-2 py-2 flex flex-col items-center text-center">
              <div className="text-[9px] text-sky-400 uppercase tracking-wider">XP</div>
              <div className="mt-0.5 font-mono text-sm">{stats.experience}</div>
            </div>
          </div>

          {/* Ad Placement - Compact */}
          <div className="mb-4 flex justify-center w-full bg-slate-900/30 rounded-lg overflow-hidden py-1">
            <div className="scale-90 origin-center">
              <AdContainer 
                slot="GAMEOVER_SQUARE_AD" 
                format="rectangle" 
                style={{ width: '300px', height: '250px' }}
                label="Sponsored"
              />
            </div>
          </div>

          {/* Buttons: share + restart */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-slate-900/90 border border-slate-600 text-xs font-semibold text-sky-100 hover:bg-slate-800"
            >
              <Share2 className="w-4 h-4 text-sky-300" />
              Share
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-full bg-emerald-400 text-black text-sm font-black shadow-[0_6px_0_rgba(6,95,70,1)] hover:translate-y-[2px] hover:shadow-[0_4px_0_rgba(6,95,70,1)] transition-all"
            >
              <Play className="w-4 h-4" />
              Restart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
