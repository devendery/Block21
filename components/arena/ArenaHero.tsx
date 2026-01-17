import React from 'react';
import Link from 'next/link';
import { Play, Shirt, Video, Gift, Box } from 'lucide-react';

export default function ArenaHero() {
  return (
    <div className="flex flex-col items-center justify-center pt-32 pb-12 relative z-10">
      
      {/* Main Title */}
      <div className="text-center mb-8 relative">
        <h1 className="text-6xl md:text-8xl font-black text-[#ffaa00] drop-shadow-[0_5px_0_#cc8800] tracking-tight transform -rotate-2 relative z-10">
          BLOCK21
        </h1>
        <h2 className="text-5xl md:text-7xl font-black text-[#38bdf8] drop-shadow-[0_5px_0_#0284c7] -mt-4 transform rotate-1 relative z-0">
          SNAKE ARENA
        </h2>
        
        {/* Worm Character Decoration (CSS only for now) */}
        <div className="absolute -top-12 -right-8 w-24 h-24 bg-green-500 rounded-full border-4 border-white hidden md:block animate-bounce">
            {/* Placeholder for worm graphic */}
            <div className="w-full h-full flex items-center justify-center text-3xl">🐍</div>
        </div>
      </div>

      {/* Feature Cards Row */}
      <div className="flex items-end justify-center gap-4 mb-8">
        
        {/* Left Card: Gift */}
        <div className="group relative">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-b from-red-500 to-red-700 rounded-2xl border-4 border-white/20 shadow-xl flex items-center justify-center transform transition-transform group-hover:-translate-y-2">
                <Gift className="w-12 h-12 text-yellow-300 drop-shadow-md" />
            </div>
            <button className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#0f172a] hover:bg-[#1e293b] text-white px-6 py-1 rounded-full text-sm font-bold border border-white/20 whitespace-nowrap shadow-lg">
                Open
            </button>
        </div>

        {/* Middle Card: Chest */}
        <div className="group relative -mt-8">
            <div className="w-28 h-28 md:w-40 md:h-40 bg-gradient-to-b from-amber-600 to-amber-800 rounded-2xl border-4 border-white/20 shadow-2xl flex items-center justify-center transform transition-transform group-hover:-translate-y-2">
                <Box className="w-16 h-16 text-white/90 drop-shadow-md" />
            </div>
            <button className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#0f172a] hover:bg-[#1e293b] text-white px-8 py-1.5 rounded-full text-base font-bold border border-white/20 whitespace-nowrap shadow-lg">
                Ready
            </button>
        </div>

        {/* Right Card: Video */}
        <div className="group relative">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-2xl border-4 border-white/20 shadow-xl flex items-center justify-center transform transition-transform group-hover:-translate-y-2">
                <div className="text-center">
                    <div className="text-2xl font-black text-white drop-shadow-md">10K</div>
                    <div className="text-xs font-bold text-white/80">Weight</div>
                </div>
            </div>
            <button className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#0f172a] hover:bg-[#1e293b] text-white px-4 py-1 rounded-full text-sm font-bold border border-white/20 whitespace-nowrap flex items-center gap-1 shadow-lg">
                <Video className="w-3 h-3" /> Video
            </button>
        </div>

      </div>

      <div className="flex flex-col items-center gap-4 mt-8">
        <Link
          href="/worms"
          className="group relative px-16 py-6 bg-gradient-to-b from-[#4ade80] to-[#16a34a] rounded-[2rem] border-b-8 border-[#15803d] active:border-b-0 active:translate-y-2 transition-all shadow-[0_0_40px_rgba(74,222,128,0.4)] inline-block"
        >
          <span className="text-4xl font-black text-white drop-shadow-md tracking-wider group-hover:scale-105 inline-block transition-transform">
            TO BATTLE!
          </span>
          <div className="absolute inset-0 rounded-[2rem] bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        <button className="flex items-center gap-2 px-8 py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold rounded-full border-b-4 border-[#1d4ed8] active:border-b-0 active:translate-y-1 transition-all shadow-lg">
            <Shirt className="w-5 h-5" />
            Worm Wardrobe
        </button>
      </div>

    </div>
  );
}
