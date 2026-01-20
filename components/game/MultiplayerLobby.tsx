"use client";

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { formatNameWithWalletSuffix } from '@/lib/nameFormat';
import { 
  Users, 
  Copy, 
  Check, 
  Play, 
  Settings, 
  Trophy, 
  Gamepad2,
  Share2,
  X,
  Crown,
  UserPlus,
  Clock
} from 'lucide-react';
import type { GameRoom, Player } from '@/lib/multiplayer';

type MultiplayerLobbyProps = {
  room: GameRoom;
  onStart: () => void;
  onLeave: () => void;
  onUpdate: (updates: Partial<GameRoom>) => void;
};

export default function MultiplayerLobby({ room, onStart, onLeave, onUpdate }: MultiplayerLobbyProps) {
  const { address } = useWallet();
  const [copied, setCopied] = useState(false);
  const [username, setUsername] = useState('');
  const [selectedSkin, setSelectedSkin] = useState('classic');
  const [isReady, setIsReady] = useState(false);

  const isHost = room.host === address;
  const currentPlayer = room.players.find(p => p.address === address);
  const allReady = room.players.length > 1 && room.players.every(p => p.ready || p.address === address);

  useEffect(() => {
    if (currentPlayer) {
      setUsername(currentPlayer.username);
      setSelectedSkin(currentPlayer.skin);
      setIsReady(currentPlayer.ready);
    }
  }, [currentPlayer]);

  const copyInviteLink = () => {
    const link = `${window.location.origin}/worms?room=${room.id}&code=${room.inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(room.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleReady = async () => {
    if (!address || !currentPlayer) return;
    
    const updatedPlayers = room.players.map(p => 
      p.address === address ? { ...p, ready: !p.ready } : p
    );
    
    onUpdate({ players: updatedPlayers });
    setIsReady(!isReady);
  };

  const updatePlayer = async (updates: Partial<Player>) => {
    if (!address || !currentPlayer) return;
    
    const updatedPlayers = room.players.map(p => 
      p.address === address ? { ...p, ...updates } : p
    );
    
    onUpdate({ players: updatedPlayers });
  };

  const canStart = isHost && allReady && room.players.length >= 2;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white mb-1">{room.name}</h2>
            <div className="flex items-center gap-4 text-sm text-white/90">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {room.players.length}/{room.maxPlayers} Players
              </span>
              <span className="flex items-center gap-1">
                <Gamepad2 className="w-4 h-4" />
                {room.mode === 'tournament' ? 'Tournament' : 'Multiplayer Lobby'}
              </span>
            </div>
          </div>
          <button
            onClick={onLeave}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* Left: Players List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Players
            </h3>
            
            <div className="space-y-2">
              {room.players.map((player, index) => {
                const isCurrentPlayer = player.address === address;
                const isPlayerHost = player.address === room.host;
                
                return (
                  <div
                    key={player.address}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isCurrentPlayer
                        ? 'bg-emerald-500/20 border-emerald-500'
                        : 'bg-slate-800/50 border-slate-700'
                    } ${player.ready ? 'ring-2 ring-green-500/50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isPlayerHost && (
                          <Crown className="w-5 h-5 text-yellow-400" />
                        )}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-white font-bold">
                          {player.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white">
                            {formatNameWithWalletSuffix(player.username, player.address)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {player.ready ? (
                          <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Ready
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-slate-700 text-slate-400 text-xs font-bold">
                            Waiting
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Invite Section */}
            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Invite Friends
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={room.inviteCode}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white font-mono text-sm"
                  />
                  <button
                    onClick={copyInviteCode}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <button
                  onClick={copyInviteLink}
                  className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Copy Invite Link
                </button>
              </div>
            </div>
          </div>

          {/* Right: Settings & Controls */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              Game Settings
            </h3>

            {/* Player Settings */}
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    updatePlayer({ username: e.target.value });
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Skin
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['classic', 'neon', 'shadow', 'gold', 'cyber', 'toxin', 'crimson', 'void'].map((skin) => (
                    <button
                      key={skin}
                      onClick={() => {
                        setSelectedSkin(skin);
                        updatePlayer({ skin });
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedSkin === skin
                          ? 'border-cyan-400 bg-cyan-500/20'
                          : 'border-slate-600 bg-slate-900 hover:border-slate-500'
                      }`}
                    >
                      <div className={`w-full h-8 rounded bg-gradient-to-r ${
                        skin === 'classic' ? 'from-green-400 to-emerald-500' :
                        skin === 'neon' ? 'from-cyan-400 to-blue-500' :
                        skin === 'shadow' ? 'from-purple-400 to-indigo-500' :
                        skin === 'gold' ? 'from-yellow-400 to-amber-500' :
                        skin === 'cyber' ? 'from-pink-400 to-rose-500' :
                        skin === 'toxin' ? 'from-lime-400 to-green-500' :
                        skin === 'crimson' ? 'from-red-400 to-rose-500' :
                        'from-slate-600 to-slate-800'
                      }`} />
                      <div className="text-xs text-slate-400 mt-1 capitalize">{skin}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Game Mode Info */}
            {room.mode === 'tournament' && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-amber-300">Tournament Mode</span>
                </div>
                <p className="text-sm text-amber-200/80">
                  Entry Fee: {room.settings.entryFee || 0} B21
                  {room.settings.prizePool && ` • Prize Pool: ${room.settings.prizePool} B21`}
                </p>
              </div>
            )}

            {/* Ready Button */}
            <button
              onClick={toggleReady}
              disabled={!username}
              className={`w-full py-4 rounded-xl font-black text-lg transition-all ${
                isReady
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {isReady ? (
                <>
                  <X className="w-5 h-5" />
                  Not Ready
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Ready Up
                </>
              )}
            </button>

            {/* Start Game Button (Host Only) */}
            {isHost && (
              <button
                onClick={onStart}
                disabled={!canStart}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white rounded-xl font-black text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Start Game
              </button>
            )}

            {isHost && !canStart && (
              <p className="text-xs text-slate-400 text-center">
                {room.players.length < 2
                  ? 'Need at least 2 players'
                  : !allReady
                  ? 'All players must be ready'
                  : 'Waiting for players...'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
