"use client";

import React from 'react';
import { Gamepad2, Hammer, Construction, Sparkles } from 'lucide-react';
import InstitutionalB21Logo from '@/components/ui/InstitutionalB21Logo';
import Link from 'next/link';

export default function GamePage() {
  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-12 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-green-900/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-green-900/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,20,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.8)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-green-500/10 mb-6 border border-green-500/20 animate-pulse">
            <Construction className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-sm font-mono text-green-200 uppercase tracking-widest">Under Development</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-300 to-green-500">
              Block 21
            </span>
            <span className="block text-2xl md:text-3xl text-gray-500 font-light mt-2 tracking-widest uppercase">
              Arena
            </span>
          </h1>
          
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The next generation of competitive block gaming is currently being forged in the code mines. 
            Prepare for a high-stakes arena where scarcity meets strategy.
          </p>
        </div>

        {/* Visual Placeholder Card */}
        <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video bg-black/40 border border-green-500/20 rounded-2xl overflow-hidden backdrop-blur-sm group">
                
                {/* Decorative Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.05)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
                
                {/* Center Logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500/20 blur-[60px] rounded-full animate-pulse" />
                        <InstitutionalB21Logo size={180} variant="v1" theme="neon" className="relative z-10 drop-shadow-[0_0_30px_rgba(34,197,94,0.5)]" />
                    </div>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-0 left-0 p-8">
                    <div className="flex items-center gap-2 text-green-500/60 font-mono text-xs uppercase tracking-widest">
                        <Gamepad2 className="w-4 h-4" />
                        <span>System: Online</span>
                    </div>
                </div>
                <div className="absolute bottom-0 right-0 p-8">
                    <div className="flex items-center gap-2 text-green-500/60 font-mono text-xs uppercase tracking-widest">
                        <Sparkles className="w-4 h-4" />
                        <span>v0.9.0 Alpha</span>
                    </div>
                </div>

                {/* Coming Soon Overlay */}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="bg-black/80 border border-green-500/30 px-8 py-4 rounded-full backdrop-blur-md transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <span className="text-2xl font-black text-green-400 tracking-widest uppercase">Coming Soon</span>
                    </div>
                </div>

            </div>
            
            <div className="mt-8 text-center">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-green-400 transition-colors font-mono text-sm uppercase tracking-wider">
                    <Hammer className="w-4 h-4" />
                    Return to Home Base
                </Link>
            </div>
        </div>

      </div>
    </main>
  );
}
