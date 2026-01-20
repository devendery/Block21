"use client";

import React from 'react';
import { Trophy, Crown, Medal, Award } from 'lucide-react';
import type { Player } from '@/lib/multiplayer';
import { formatNameWithWalletSuffix } from '@/lib/nameFormat';

type TournamentLeaderboardProps = {
  players: Player[];
  prizePool?: number;
};

export default function TournamentLeaderboard({ players, prizePool = 0 }: TournamentLeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const getPrize = (position: number) => {
    if (!prizePool) return 0;
    if (position === 0) return prizePool * 0.5; // 50% to winner
    if (position === 1) return prizePool * 0.3; // 30% to 2nd
    if (position === 2) return prizePool * 0.2; // 20% to 3rd
    return 0;
  };

  const getIcon = (position: number) => {
    if (position === 0) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (position === 1) return <Medal className="w-6 h-6 text-gray-300" />;
    if (position === 2) return <Award className="w-6 h-6 text-amber-600" />;
    return <Trophy className="w-5 h-5 text-slate-500" />;
  };

  const getPositionColor = (position: number) => {
    if (position === 0) return 'from-yellow-400 to-amber-500';
    if (position === 1) return 'from-gray-300 to-gray-400';
    if (position === 2) return 'from-amber-600 to-amber-700';
    return 'from-slate-600 to-slate-700';
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 rounded-2xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          Tournament Results
        </h3>
        {prizePool > 0 && (
          <div className="text-right">
            <div className="text-xs text-slate-400">Prize Pool</div>
            <div className="text-xl font-black text-amber-400">{prizePool} B21</div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {sortedPlayers.map((player, index) => {
          const prize = getPrize(index);
          const percentage = sortedPlayers.length > 0 
            ? (player.score / Math.max(...sortedPlayers.map(p => p.score), 1)) * 100 
            : 0;

          return (
            <div
              key={player.address}
              className={`p-4 rounded-xl border-2 ${
                index < 3
                  ? `bg-gradient-to-r ${getPositionColor(index)}/20 border-${getPositionColor(index).split('-')[1]}/50`
                  : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-12">
                    {getIcon(index)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">
                        {formatNameWithWalletSuffix(player.username, player.address)}
                      </span>
                      {index === 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400 text-xs font-bold">
                          WINNER
                        </span>
                      )}
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getPositionColor(index)} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-2xl font-black text-white">{player.score}</div>
                  {prize > 0 && (
                    <div className="text-sm font-bold text-amber-400">
                      +{prize.toFixed(2)} B21
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedPlayers.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          No players yet. Waiting for tournament to start...
        </div>
      )}
    </div>
  );
}
