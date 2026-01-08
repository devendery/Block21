"use client";

import React from 'react';
import InstitutionalB21Logo from '@/components/ui/InstitutionalB21Logo';
import Logo from '@/components/Logo';

export default function LogoShowcasePage() {
  return (
    <div className="min-h-screen bg-black text-white p-24">
      <h1 className="text-4xl font-bold mb-12 border-b border-white/10 pb-4">Brand Assets & Logo Design</h1>

      <div className="grid grid-cols-1 gap-12">

        {/* Section: The Sovereign (V1) - OFFICIAL STANDARD */}
        <section className="col-span-full space-y-8">
          <h2 className="text-2xl font-bold text-red-500 border-l-4 border-red-500 pl-4">
             THE SOVEREIGN STANDARD (V1)
          </h2>
          <p className="text-slate-400">
             The official "Absolute Scarcity" design. The original sovereign mark.
          </p>

          {/* Full Wordmark Usage */}
          <div className="p-12 bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col items-center gap-8 mb-8">
            <h3 className="text-slate-500 font-bold uppercase tracking-widest text-sm">Official Wordmark Usage</h3>
            <Logo />
            <div className="flex gap-4 text-xs text-slate-500 font-mono flex-wrap justify-center">
                <span>Font: Heading (Bold)</span>
                <span>•</span>
                <span>Block: #525252 (Grey)</span>
                <span>•</span>
                <span>21: #FF0033 (Red)</span>
                <span>•</span>
                <span>Tagline: #525252 (Grey)</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Obsidian (Primary) */}
            <div className="bg-[#050505] border border-red-900/30 rounded-2xl p-8 flex flex-col items-center gap-6 hover:border-red-800 transition-colors shadow-2xl shadow-red-900/20">
               <InstitutionalB21Logo size={180} variant="v1" theme="obsidian" />
               <div className="text-center">
                 <h3 className="text-red-500 font-bold mb-1">Obsidian Sovereign</h3>
                 <p className="text-xs text-red-900 font-mono">Official Standard</p>
               </div>
            </div>

             {/* Platinum */}
             <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-6 hover:border-slate-500 transition-colors opacity-60 hover:opacity-100">
               <InstitutionalB21Logo size={180} variant="v1" theme="platinum" />
               <div className="text-center">
                 <h3 className="text-white font-bold mb-1">Platinum Sovereign</h3>
                 <p className="text-xs text-slate-500 font-mono">Clean & Sharp</p>
               </div>
            </div>

            {/* Gold */}
            <div className="bg-[#1a1000] border border-yellow-900/30 rounded-2xl p-8 flex flex-col items-center gap-6 hover:border-yellow-600 transition-colors opacity-60 hover:opacity-100">
               <InstitutionalB21Logo size={180} variant="v1" theme="gold" />
               <div className="text-center">
                 <h3 className="text-yellow-400 font-bold mb-1">Gold Sovereign</h3>
                 <p className="text-xs text-yellow-700 font-mono">Ultimate Value</p>
               </div>
            </div>

            {/* Neon */}
            <div className="bg-[#051010] border border-green-900/30 rounded-2xl p-8 flex flex-col items-center gap-6 hover:border-green-500 transition-colors opacity-60 hover:opacity-100">
               <InstitutionalB21Logo size={180} variant="v1" theme="neon" />
               <div className="text-center">
                 <h3 className="text-green-400 font-bold mb-1">Neon Sovereign</h3>
                 <p className="text-xs text-green-700 font-mono">Future Tech</p>
               </div>
            </div>

          </div>
        </section>

        {/* Section: The NEW V5 Crystal Monolith (Maximum Clarity) - ALTERNATIVE */}
        <section className="col-span-full space-y-8 pt-12 border-t border-white/5">
          <h2 className="text-2xl font-bold text-slate-500 border-l-4 border-slate-500 pl-4">
             THE CRYSTAL MONOLITH (V5) - CONCEPT
          </h2>
          <p className="text-slate-500">
             High-clarity alternative design.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 grayscale hover:grayscale-0 transition-all duration-500">
            
            {/* Obsidian */}
            <div className="bg-black border border-white/5 rounded-2xl p-8 flex flex-col items-center gap-6">
               <InstitutionalB21Logo size={180} variant="v5" theme="obsidian" />
               <div className="text-center">
                 <h3 className="text-slate-500 font-bold mb-1">Obsidian V5</h3>
               </div>
            </div>

          </div>
        </section>
        
        {/* Section: Color Palette */}
        <section className="col-span-full space-y-8">
            <h2 className="text-2xl font-bold text-red-500">Brand Colors</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="h-24 rounded-xl bg-red-600 flex items-end p-4 font-mono">#DC2626</div>
                <div className="h-24 rounded-xl bg-red-500 flex items-end p-4 font-mono">#EF4444</div>
                <div className="h-24 rounded-xl bg-black flex items-end p-4 font-mono border border-slate-700">#000000</div>
                <div className="h-24 rounded-xl bg-slate-900 flex items-end p-4 font-mono">#0f172a</div>
            </div>
        </section>

      </div>
    </div>
  );
}
