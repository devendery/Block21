import React from 'react';
import GameArena from '@/components/game/GameArena';
import { Gamepad2 } from 'lucide-react';

export const metadata = {
  title: 'Block21 Arena - Multiplayer',
  description: 'Battle for the blocks in this local multiplayer arena.',
};

export default function GamePage() {
  return (
    <main className="min-h-screen bg-black text-white pt-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-white/5 mb-4 border border-white/10">
            <Gamepad2 className="w-6 h-6 text-purple-400 mr-2" />
            <span className="text-sm font-mono text-purple-200">MULTIPLAYER BETA</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
            Block21 Arena
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Challenge a friend in local multiplayer mode. Collect the gold blocks to score points. 
            Avoid walls, yourself, and your opponent.
          </p>
        </div>

        <GameArena />
      </div>
    </main>
  );
}
