"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import WormsGame from '@/components/game/WormsGame';
import MultiplayerLobby from '@/components/game/MultiplayerLobby';
import AnimatedSnake from '@/components/showcase/AnimatedSnake';
import WardrobeModal from '@/components/game/ui/WardrobeModal';
import GameOverModal from '@/components/game/ui/GameOverModal';
import { joinTournament } from '@/lib/tournamentContract';
import {
  Gamepad2,
  Trophy,
  Zap,
  Coins,
  Smile,
  Settings,
  Copy,
  Check,
  Crown,
  Wallet,
  Users,
} from 'lucide-react';
import type { GameRoom } from '@/lib/multiplayer';
import { UserProfile, WormsMode, GameStats } from '@/types/game';
import AdContainer from '@/components/ads/AdContainer';

// Configuration for Tournament
const TOURNAMENT_CONFIG = {
  contractAddress: process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
  tiers: {
    bronze: { name: 'Bronze', fee: '50', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
    gold: { name: 'Gold/Pro', fee: '500', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  }
};

type TournamentTier = 'bronze' | 'gold';
type GameView = 'menu' | 'lobby' | 'playing' | 'tournament';

function GamePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { address, isConnected, connectWallet } = useWallet();
  const [view, setView] = useState<GameView>('menu');
  const [gameMode, setGameMode] = useState<'single' | 'multiplayer' | 'tournament'>('single');
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedMode, setSelectedMode] = useState<WormsMode>('infinity');
  const [copied, setCopied] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [lastStats, setLastStats] = useState<GameStats | null>(null);
  const [showWardrobe, setShowWardrobe] = useState(false);
  const [wardrobeTab, setWardrobeTab] = useState<'skins' | 'colors' | 'faces'>('skins');
  const [activeSkin, setActiveSkin] = useState<string>('classic');
  const [selectedFace, setSelectedFace] = useState<string>('classic-eyes');
  const [selectedTier, setSelectedTier] = useState<TournamentTier>('bronze');
  const [savingSkin, setSavingSkin] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Check for invite link
  useEffect(() => {
    const roomId = searchParams.get('room');
    const inviteCode = searchParams.get('code');
    
    if (roomId || inviteCode) {
      joinRoomByCode(roomId || undefined, inviteCode || undefined);
    }
  }, [searchParams]);

  // Fetch profile
  useEffect(() => {
    if (address) {
      fetch(`/api/user/profile?address=${address}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setProfile(data);
            if (data.activeSkin) setActiveSkin(data.activeSkin);
          }
        })
        .catch(console.error);
    }
  }, [address]);

  const handleTournamentEntry = async (tournamentId: number, fee: string) => {
    if (!address) return false;
    setIsProcessingPayment(true);
    try {
      // Check if we have a valid contract address
      if (TOURNAMENT_CONFIG.contractAddress === "0x0000000000000000000000000000000000000000") {
          console.warn("Tournament contract address not configured. Skipping blockchain transaction for demo.");
          // For demo purposes, we simulate success if no contract is configured
          await new Promise(resolve => setTimeout(resolve, 1000));
          return true;
      }

      const result = await joinTournament(
        tournamentId,
        fee,
        TOURNAMENT_CONFIG.contractAddress
      );

      if (!result.success) {
        alert(`Failed to join tournament: ${result.error}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
      return false;
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const createRoom = async (mode: 'lobby' | 'tournament') => {
    if (!address) return;

    if (mode === 'tournament') {
        const fee = TOURNAMENT_CONFIG.tiers[selectedTier].fee;
        const success = await handleTournamentEntry(1, fee); // ID 1 for "Generic Tournament"
        if (!success) return;
    }

    try {
      const username = profile?.username || `Player${address.slice(0, 6)}`;
      const response = await fetch('/api/game/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          mode,
          player: {
            address,
            username,
            skin: profile?.activeSkin || 'classic',
            ready: false,
            connected: true,
          },
          settings: mode === 'tournament' ? {
            entryFee: parseInt(TOURNAMENT_CONFIG.tiers[selectedTier].fee),
            tier: selectedTier,
            prizePool: 0,
          } : {},
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRoom(data.room);
        setView('lobby');
        setGameMode(mode === 'tournament' ? 'tournament' : 'multiplayer');
      }
    } catch (error) {
      console.error('Failed to create room:', error);
      alert('Failed to create room. Please try again.');
    }
  };

  const joinRoomByCode = async (roomId?: string, code?: string) => {
    if (!address) return;

    try {
      let response;
      if (roomId) {
        response = await fetch(`/api/game/room?id=${roomId}`);
      } else if (code) {
        response = await fetch(`/api/game/room?code=${code}`);
      } else {
        return;
      }

      const data = await response.json();
      if (data.success && data.room) {
        // Check if tournament
        if (data.room.mode === 'tournament') {
            const fee = data.room.settings?.entryFee?.toString() || TOURNAMENT_CONFIG.tiers.bronze.fee;
            const success = await handleTournamentEntry(1, fee);
            if (!success) return;
        }

        // Join the room
        const username = profile?.username || `Player${address.slice(0, 6)}`;
        const joinResponse = await fetch('/api/game/room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'join',
            roomId: data.room.id,
            player: {
              address,
              username,
              skin: profile?.activeSkin || 'classic',
              ready: false,
              connected: true,
            },
          }),
        });

        const joinData = await joinResponse.json();
        if (joinData.success) {
          setRoom(joinData.room);
          setView('lobby');
          setGameMode(data.room.mode === 'tournament' ? 'tournament' : 'multiplayer');
        }
      }
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  const handleRoomUpdate = async (updates: Partial<GameRoom>) => {
    if (!room) return;

    try {
      const response = await fetch('/api/game/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          roomId: room.id,
          updates,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRoom(data.room);
      }
    } catch (error) {
      console.error('Failed to update room:', error);
    }
  };

  const handleStartGame = () => {
    if (!room) return;
    handleRoomUpdate({ status: 'playing' });
    setView('playing');
  };

  const handleLeaveRoom = async () => {
    if (!room || !address) return;

    try {
      await fetch('/api/game/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'leave',
          roomId: room.id,
          player: { address },
        }),
      });
    } catch (error) {
      console.error('Failed to leave room:', error);
    }

    setRoom(null);
    setView('menu');
  };

  const copyInviteLink = () => {
    if (!room) return;
    const link = `${window.location.origin}/game?room=${room.id}&code=${room.inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Require MetaMask connection
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 rounded-3xl border border-slate-700 p-8 text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
          <h1 className="text-3xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Connect MetaMask
          </h1>
          <p className="text-slate-400 mb-6">
            You need to connect your MetaMask wallet to play Block21 Worms.
            This ensures secure gameplay and enables crypto payments.
          </p>
          <button
            onClick={connectWallet}
            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white rounded-xl font-black text-lg transition-all flex items-center justify-center gap-2"
          >
            <Wallet className="w-5 h-5" />
            Connect MetaMask
          </button>
        </div>
      </div>
    );
  }

  if (view === 'lobby' && room) {
    return (
      <MultiplayerLobby
        room={room}
        onStart={handleStartGame}
        onLeave={handleLeaveRoom}
        onUpdate={handleRoomUpdate}
      />
    );
  }

  if (view === 'playing') {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        {showGameOver && lastStats !== null ? (
          <GameOverModal
            stats={lastStats}
            profile={profile}
            address={address}
            onRestart={() => {
              setShowGameOver(false);
              setLastStats(null);
            }}
            onClose={() => {
              setShowGameOver(false);
              setLastStats(null);
              if (room) {
                setView('lobby');
              } else {
                setView('menu');
              }
            }}
          />
        ) : (
          <WormsGame
            onGameOver={(stats) => {
              if (typeof stats === 'number') {
                setLastStats({
                  score: stats,
                  collected: Math.floor(stats / 10),
                  defeated: 0,
                  experience: Math.floor(stats / 5),
                  lifetime: 0
                });
              } else {
                setLastStats(stats);
              }
              setShowGameOver(true);
              if (room) {
                handleRoomUpdate({ status: 'finished' });
              }
            }}
            playerName={profile?.username || `Player${address?.slice(0, 6)}`}
            skinId={(profile?.activeSkin as any) || activeSkin || 'classic'}
            mode={selectedMode}
            multiplayer={gameMode !== 'single'}
            roomId={room?.id}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1830] text-white pt-20 relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1e3f] via-transparent to-[#051024]" />
      </div>

      {isProcessingPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="text-center">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-emerald-400">Processing Payment...</h2>
                  <p className="text-slate-400">Please confirm the transaction in MetaMask</p>
              </div>
          </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-4 pb-12">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-black font-bold">
              {profile?.username?.[0] || address?.[0]?.toUpperCase() || 'P'}
            </div>
            <div>
              <div className="text-lg font-black">
                {profile?.username || `Player${address?.slice(0, 6) || ''}`}
              </div>
              <div className="flex items-center gap-2 text-xs text-sky-200/80 font-mono">
                <span>Lvl {profile?.level ?? 1}</span>
                <span>•</span>
                <span>{profile?.highScore ?? 0} best</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-sky-900/70 border border-sky-500/60">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="font-mono">10 / 20</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-amber-900/70 border border-amber-400/60">
              <Coins className="w-4 h-4 text-amber-300" />
              <span className="font-mono">{profile?.totalB21Earned ?? 0} B21</span>
            </div>
          </div>
        </header>

        <div className="flex gap-6">
          <div className="hidden lg:flex flex-col gap-3 w-24">
            <button className="h-16 rounded-2xl bg-sky-900/70 border border-sky-500/60 flex items-center justify-center shadow-lg">
              <Gamepad2 className="w-7 h-7 text-sky-300" />
            </button>
            <button className="h-16 rounded-2xl bg-emerald-900/70 border border-emerald-500/60 flex items-center justify-center shadow-lg">
              <Trophy className="w-7 h-7 text-amber-300" />
            </button>
            <button className="h-16 rounded-2xl bg-rose-900/70 border border-rose-500/60 flex items-center justify-center shadow-lg">
              <Zap className="w-7 h-7 text-rose-300" />
            </button>
            <button
              onClick={() => setShowWardrobe(true)}
              className="mt-auto h-16 rounded-2xl bg-cyan-900/70 border border-cyan-400/70 flex items-center justify-center shadow-[0_0_24px_rgba(34,211,238,0.7)]"
            >
              <Smile className="w-7 h-7 text-cyan-200" />
            </button>
          </div>

          <main className="flex-1 flex flex-col lg:flex-row gap-6 items-stretch">
            <div className="flex-1 rounded-3xl bg-sky-950/80 border border-sky-700/70 shadow-[0_0_40px_rgba(56,189,248,0.5)] p-6 flex flex-col items-center justify-between">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-sky-900/70 border border-sky-500/60 text-xs font-mono tracking-[0.25em] uppercase text-sky-200 mb-3">
                  Block21
                </div>
                <h1 className="text-5xl md:text-6xl font-black mb-1 text-yellow-300 drop-shadow-[0_4px_0_rgba(0,0,0,0.6)]">
                  Worms Arena
                </h1>
                <p className="text-sm md:text-base text-sky-100/80">
                  Eat, grow and outmaneuver others in a skill-based B21 arena.
                </p>
              </div>

              <div className="relative w-full max-w-md aspect-[4/3] rounded-3xl bg-gradient-to-br from-sky-900 via-indigo-900 to-slate-900 border border-sky-600/60 overflow-hidden flex items-center justify-center mb-4">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.6),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(251,191,36,0.6),transparent_55%)]" />
                <AnimatedSnake skin={activeSkin} length={26} interactive animated size={48} />
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2 rounded-full bg-slate-900/80 border border-slate-600/60 px-2 py-1">
                    <button
                      onClick={() => setGameMode('single')}
                      className={[
                        'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                        gameMode === 'single'
                          ? 'bg-emerald-400 text-black'
                          : 'text-slate-200 hover:bg-slate-800',
                      ].join(' ')}
                    >
                      Solo
                    </button>
                    <button
                      onClick={() => setGameMode('multiplayer')}
                      className={[
                        'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                        gameMode === 'multiplayer'
                          ? 'bg-sky-400 text-black'
                          : 'text-slate-200 hover:bg-slate-800',
                      ].join(' ')}
                    >
                      Lobby
                    </button>
                    <button
                      onClick={() => setGameMode('tournament')}
                      className={[
                        'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                        gameMode === 'tournament'
                          ? 'bg-amber-400 text-black'
                          : 'text-slate-200 hover:bg-slate-800',
                      ].join(' ')}
                    >
                      Tournament
                    </button>
                  </div>

                  {gameMode === 'tournament' && (
                    <div className="flex gap-2 rounded-full bg-slate-900/80 border border-slate-600/60 px-2 py-1">
                      {(Object.keys(TOURNAMENT_CONFIG.tiers) as TournamentTier[]).map((tier) => (
                        <button
                          key={tier}
                          onClick={() => setSelectedTier(tier)}
                          className={[
                            'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all',
                            selectedTier === tier
                              ? 'bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.3)]'
                              : 'text-slate-400 hover:text-slate-200',
                          ].join(' ')}
                        >
                          {TOURNAMENT_CONFIG.tiers[tier].name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (gameMode === 'single') {
                      setView('playing');
                    } else if (gameMode === 'multiplayer') {
                      if (room) {
                        setView('lobby');
                      } else {
                        createRoom('lobby');
                      }
                    } else {
                      if (room) {
                        setView('lobby');
                      } else {
                        createRoom('tournament');
                      }
                    }
                  }}
                  className="w-full md:w-auto px-16 py-4 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 text-black text-2xl font-black shadow-[0_14px_0_0_rgba(6,95,70,1),0_0_40px_rgba(34,197,94,0.8)] hover:translate-y-[2px] hover:shadow-[0_10px_0_0_rgba(6,95,70,1),0_0_30px_rgba(34,197,94,0.8)] transition-all flex items-center justify-center gap-3"
                >
                  <span>To battle!</span>
                  <Gamepad2 className="w-7 h-7" />
                </button>
              </div>
            </div>

            <aside className="w-full lg:w-80 rounded-3xl bg-slate-950/80 border border-slate-700/70 p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-300" />
                  <span className="font-semibold text-sm">Lobby & invites</span>
                </div>
                {copied && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-300">
                    <Check className="w-3 h-3" />
                    Copied
                  </span>
                )}
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <button
                  onClick={() => createRoom('lobby')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-600/70 hover:border-sky-500/70 hover:bg-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-300" />
                    <span>Create lobby</span>
                  </div>
                  <Crown className="w-4 h-4 text-amber-300" />
                </button>

                <button
                  onClick={() => createRoom('tournament')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-600/70 hover:border-amber-400/80 hover:bg-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-300" />
                    <span>Host {TOURNAMENT_CONFIG.tiers[selectedTier].name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                     <span className="text-amber-300 font-bold">{TOURNAMENT_CONFIG.tiers[selectedTier].fee}</span>
                     <Coins className="w-4 h-4 text-amber-300" />
                  </div>
                </button>

                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Copy className="w-4 h-4 text-cyan-300" />
                    <span className="text-xs font-semibold text-slate-200">Join by invite code</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="6-digit code"
                      maxLength={6}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const code = (e.target as HTMLInputElement).value;
                          if (code.length === 6) {
                            joinRoomByCode(undefined, code);
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector(
                          'input[placeholder="6-digit code"]'
                        ) as HTMLInputElement | null;
                        if (input?.value.length === 6) {
                          joinRoomByCode(undefined, input.value);
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-xs font-bold"
                    >
                      Join
                    </button>
                  </div>
                </div>

                {room && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      <span>Active room</span>
                      <span className="text-emerald-300">{room.mode}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-200">{room.inviteCode}</span>
                      <button
                        onClick={copyInviteLink}
                        className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-[10px]"
                      >
                        <Copy className="w-3 h-3" />
                        Copy link
                      </button>
                    </div>
                    <button
                      onClick={handleLeaveRoom}
                      className="mt-2 w-full text-[11px] text-rose-300 underline underline-offset-2"
                    >
                      Leave room
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <AdContainer 
                  slot="SIDEBAR_AD_SLOT" 
                  format="rectangle"
                  className="w-full"
                  label="Sponsored"
                />
              </div>

              {address && (
                <div className="mt-auto pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-100">
                      {profile?.username || `Player${address.slice(0, 6)}`}
                    </div>
                    <div className="font-mono text-slate-500">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowWardrobe(true)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-sky-900/80 border border-sky-500/70 text-[11px] font-semibold hover:bg-sky-800"
                  >
                    <Settings className="w-4 h-4 text-sky-300" />
                    Worm wardrobe
                  </button>
                </div>
              )}
            </aside>
          </main>
        </div>
      </div>

      {showWardrobe && (
        <WardrobeModal
          profile={profile}
          activeSkin={activeSkin}
          selectedFace={selectedFace}
          wardrobeTab={wardrobeTab}
          setActiveSkin={setActiveSkin}
          setSelectedFace={setSelectedFace}
          setWardrobeTab={setWardrobeTab}
          onClose={() => setShowWardrobe(false)}
        />
      )}

      {view === 'menu' && (
        <div className="max-w-4xl mx-auto mt-8 mb-8 px-4">
           <AdContainer 
             slot="BOTTOM_BANNER_AD_SLOT" 
             format="horizontal"
             label="Advertisement"
           />
        </div>
      )}
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b1830] text-white flex items-center justify-center">Loading...</div>}>
      <GamePageContent />
    </Suspense>
  );
}