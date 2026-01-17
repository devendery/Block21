import React from 'react';
import { User, Coins, Heart, Plus, Settings, Menu, X, Trophy, ShoppingBag, Gamepad2 } from 'lucide-react';
import Link from 'next/link';

interface ArenaHeaderProps {
  username?: string;
  level?: number;
  coins?: number;
  hearts?: number;
  maxHearts?: number;
}

export default function ArenaHeader({
  username = "Guest Player",
  level = 1,
  coins = 0,
  hearts = 5,
  maxHearts = 20
}: ArenaHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-gradient-to-b from-[#0a1e3f] to-transparent pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-start justify-between pointer-events-auto">
        
        {/* Left: Profile Block */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <div className="w-16 h-16 bg-[#ffaa00] rounded-xl border-4 border-[#cc8800] overflow-hidden shadow-lg transform transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-pink-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xs">{level}</span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="w-32 h-4 bg-black/50 rounded-full border border-black/30 relative overflow-hidden mb-1">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-300 w-2/3" />
            </div>
            <span className="text-white font-bold text-shadow-sm text-lg tracking-wide">{username}</span>
          </div>
        </div>

        {/* Center: App Store Badges (Hidden on mobile, visible on desktop) */}
        <div className="hidden md:flex gap-4 pt-2">
          <button className="bg-black/80 hover:bg-black text-white px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10 transition-colors">
            <span className="text-xs font-bold">Get it on Google Play</span>
          </button>
          <button className="bg-black/80 hover:bg-black text-white px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10 transition-colors">
            <span className="text-xs font-bold">Download on App Store</span>
          </button>
        </div>

        {/* Right: Resources */}
        <div className="flex flex-col items-end gap-2">
          {/* Hearts */}
          <div className="flex items-center gap-2">
            <div className="bg-[#d92828] h-10 px-4 rounded-full border-2 border-[#a31616] flex items-center gap-2 shadow-lg min-w-[120px] justify-between relative">
              <Heart className="w-6 h-6 text-white fill-white" />
              <span className="text-white font-black text-lg">{hearts}/{maxHearts}</span>
              <button className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center hover:bg-blue-400 transition-colors shadow-md">
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-2 mt-1">
            <div className="bg-[#8b5cf6] h-10 px-4 rounded-full border-2 border-[#7c3aed] flex items-center gap-2 shadow-lg min-w-[120px] justify-between relative">
              <div className="w-6 h-6 rounded-full bg-yellow-400 border border-yellow-600 flex items-center justify-center">
                <span className="text-yellow-800 font-bold text-xs">$</span>
              </div>
              <span className="text-white font-black text-lg">{coins.toLocaleString()}</span>
              <button className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center hover:bg-blue-400 transition-colors shadow-md">
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

      </div>
      
      {/* Navigation Bar (Desktop) */}
      <nav className="hidden md:flex justify-center mt-4 pointer-events-auto">
        <div className="bg-black/40 backdrop-blur-md rounded-full px-6 py-2 border border-white/10 flex items-center gap-8">
            <Link href="/arena" className="text-yellow-400 font-bold hover:text-yellow-300 transition-colors flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" /> Home
            </Link>
            <Link href="#" className="text-white/80 font-bold hover:text-white transition-colors flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Leaderboards
            </Link>
            <Link href="#" className="text-white/80 font-bold hover:text-white transition-colors flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Store
            </Link>
            <Link href="#" className="text-white/80 font-bold hover:text-white transition-colors flex items-center gap-2">
                <Settings className="w-4 h-4" /> Settings
            </Link>
        </div>
      </nav>
    </header>
  );
}
