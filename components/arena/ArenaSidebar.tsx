import React from 'react';
import { Trophy, Gift, Zap, Percent, Search, Disc } from 'lucide-react';

export default function ArenaSidebar() {
  return (
    <>
      {/* Left Sidebar */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
        
        {/* Ads Bonus */}
        <div className="group cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 border-4 border-white flex flex-col items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                <span className="text-white font-black text-sm leading-none">ADS</span>
                <span className="text-white font-bold text-[10px] bg-red-600 px-1.5 rounded-full mt-0.5">Bonus</span>
            </div>
        </div>

        {/* Leaderboard Timer */}
        <div className="group cursor-pointer flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white/50 flex items-center justify-center shadow-lg mb-1">
                <Trophy className="w-7 h-7 text-white" />
            </div>
            <div className="bg-[#0f172a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                2d 10h
            </div>
        </div>

        {/* Daily Gift */}
        <div className="group cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white/50 flex items-center justify-center shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform">
                <Gift className="w-7 h-7 text-white" />
            </div>
        </div>

      </div>

      {/* Right Sidebar */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20 items-end">
        
        {/* Discount Offer */}
        <div className="group cursor-pointer flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 border-4 border-white flex items-center justify-center shadow-lg relative mb-1">
                <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full border border-white">
                    %
                </div>
                <Zap className="w-8 h-8 text-white" />
            </div>
            <div className="bg-[#0f172a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                1d 22h
            </div>
        </div>

        {/* Magnifier */}
        <div className="group cursor-pointer">
             <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-white/50 flex items-center justify-center shadow-lg">
                <Search className="w-7 h-7 text-white" />
            </div>
        </div>

        {/* Lucky Wheel */}
        <div className="group cursor-pointer flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500 border-2 border-white/50 flex items-center justify-center shadow-lg animate-[spin_10s_linear_infinite] mb-1">
                <div className="w-4 h-4 bg-white rounded-full" />
            </div>
            <div className="bg-[#0f172a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                1h 59m
            </div>
        </div>

      </div>
    </>
  );
}
