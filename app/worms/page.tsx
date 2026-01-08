"use client";

import React, { useState } from 'react';
import WormsGame from '@/components/game/WormsGame';
import { Gamepad2, Coins, Trophy, Plus, Wallet } from 'lucide-react';
import { WalletProvider, useWallet } from '@/components/economy/WalletContext';
import PaymentModal from '@/components/economy/PaymentModal';

// Separate component to use the context
function GameLobby() {
  const { balanceB21, payEntryFee, addToHistory } = useWallet();
  const [hasPaid, setHasPaid] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);

  const ENTRY_FEE = 10;

  const handleStartGame = () => {
    if (payEntryFee(ENTRY_FEE)) {
      setHasPaid(true);
      setLastScore(null);
    } else {
      alert("Insufficient B21 Coins! Please swap USD for coins.");
      setShowPayment(true);
    }
  };

  const handleGameOver = (score: number) => {
    setLastScore(score);
    setHasPaid(false); // Reset for next game (Arcade style: pay per play)
    // Mock Reward: if score > 100, give some coins back
    if (score > 100) {
        const reward = Math.floor(score / 10);
        addToHistory('game_win', reward, `Won rewards for score ${score}`);
        // We can't directly add funds here easily without exposing setBalance, 
        // but addToHistory doesn't update balance in my simple context. 
        // For prototype, let's just alert. Real app would call backend.
        alert(`Good Game! You earned ${reward} B21 (Simulated)`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Wallet Bar */}
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setShowPayment(true)}
          className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full px-4 py-2 transition-all"
        >
          <div className="flex items-center gap-2">
             <Coins className="w-5 h-5 text-green-400" />
             <span className="font-mono font-bold text-green-400">{balanceB21.toLocaleString()} B21</span>
          </div>
          <div className="w-px h-4 bg-slate-600"></div>
          <Plus className="w-4 h-4 text-white" />
        </button>
      </div>

      <PaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} />

      {!hasPaid ? (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(74,222,128,0.1),transparent_50%)]"></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-slate-700 shadow-lg">
               <Trophy className="w-10 h-10 text-yellow-400" />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              TOURNAMENT MODE
            </h2>
            
            {lastScore !== null && (
               <div className="mb-6 inline-block px-6 py-2 bg-slate-800 rounded-lg border border-slate-600">
                  <p className="text-slate-400 text-sm uppercase font-bold">Last Run</p>
                  <p className="text-2xl text-white font-mono">{lastScore} Pts</p>
               </div>
            )}

            <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
              Enter the neon arena to compete for glory. 
              High scores earn B21 Token rewards.
            </p>

            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-4 text-2xl font-bold text-white mb-2">
                <span>Entry Fee:</span>
                <span className="flex items-center text-green-400">
                  <Coins className="w-6 h-6 mr-2" /> {ENTRY_FEE} B21
                </span>
              </div>

              <button
                onClick={handleStartGame}
                className="group relative px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-black text-xl rounded-full transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(74,222,128,0.4)]"
              >
                <span className="flex items-center gap-2">
                  PAY & PLAY <Gamepad2 className="w-6 h-6" />
                </span>
              </button>
              
              <p className="text-slate-500 text-sm">
                Current Balance: {balanceB21.toLocaleString()} B21
              </p>
            </div>
          </div>
        </div>
      ) : (
        <WormsGame onGameOver={handleGameOver} />
      )}
    </div>
  );
}

export default function WormsPage() {
  return (
    <WalletProvider>
      <main className="min-h-screen bg-black text-white pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-green-500/10 mb-4 border border-green-500/20">
              <Gamepad2 className="w-6 h-6 text-green-400 mr-2" />
              <span className="text-sm font-mono text-green-200">BETA ACCESS</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-green-400 via-emerald-300 to-blue-500 bg-clip-text text-transparent">
              Neo Worms
            </h1>
          </div>

          <GameLobby />
        </div>
      </main>
    </WalletProvider>
  );
}
