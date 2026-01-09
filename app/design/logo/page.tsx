"use client";

import React from 'react';
import InstitutionalB21Logo from '@/components/ui/InstitutionalB21Logo';
import Logo from '@/components/Logo';

function SovereignPromptMarkA({ size = 180 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="a_core" x1="256" y1="120" x2="256" y2="440" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#121316" />
          <stop offset="0.45" stopColor="#2A2D33" />
          <stop offset="1" stopColor="#0A0B0D" />
        </linearGradient>
        <linearGradient id="a_face" x1="160" y1="180" x2="352" y2="360" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#07080A" />
          <stop offset="0.55" stopColor="#3A3E46" />
          <stop offset="1" stopColor="#0B0C0E" />
        </linearGradient>
      </defs>

      <polygon points="256,92 286,152 256,178 226,152" fill="#0D0E11" stroke="rgba(255,255,255,0.14)" strokeWidth="2" />
      <polygon points="176,144 212,184 188,206 150,178" fill="#0A0B0D" stroke="rgba(255,255,255,0.10)" strokeWidth="2" />
      <polygon points="336,144 362,178 324,206 300,184" fill="#0A0B0D" stroke="rgba(255,255,255,0.10)" strokeWidth="2" />

      <polygon points="256,170 346,220 316,374 256,436 196,374 166,220" fill="url(#a_core)" stroke="rgba(255,255,255,0.16)" strokeWidth="2" />
      <polygon points="256,206 304,232 286,330 256,356 226,330 208,232" fill="url(#a_face)" stroke="rgba(255,255,255,0.10)" strokeWidth="2" />
      <polygon points="256,206 304,232 294,270 256,254 218,270 208,232" fill="#111318" opacity="0.85" />

      <polygon points="166,220 208,232 196,374 146,332" fill="#07080A" opacity="0.92" />
      <polygon points="346,220 366,332 316,374 304,232" fill="#07080A" opacity="0.92" />

      <polyline points="256,170 346,220 316,374 256,436 196,374 166,220 256,170" stroke="rgba(255,255,255,0.10)" strokeWidth="2" fill="none" />
      <polyline points="256,206 304,232 286,330 256,356 226,330 208,232 256,206" stroke="rgba(255,255,255,0.10)" strokeWidth="2" fill="none" />
    </svg>
  );
}

function SovereignPromptMarkB({ size = 180 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="b_shell" x1="256" y1="108" x2="256" y2="444" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0B0C0E" />
          <stop offset="0.5" stopColor="#3A3E46" />
          <stop offset="1" stopColor="#090A0C" />
        </linearGradient>
        <linearGradient id="b_inner" x1="200" y1="220" x2="312" y2="360" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#07080A" />
          <stop offset="0.6" stopColor="#252830" />
          <stop offset="1" stopColor="#0A0B0D" />
        </linearGradient>
      </defs>

      <polygon points="256,84 298,164 256,206 214,164" fill="#0A0B0D" stroke="rgba(255,255,255,0.14)" strokeWidth="2" />
      <polygon points="154,154 214,206 176,244 112,206" fill="#0A0B0D" stroke="rgba(255,255,255,0.10)" strokeWidth="2" />
      <polygon points="358,154 400,206 336,244 298,206" fill="#0A0B0D" stroke="rgba(255,255,255,0.10)" strokeWidth="2" />

      <polygon points="256,188 372,260 324,388 256,452 188,388 140,260" fill="url(#b_shell)" stroke="rgba(255,255,255,0.16)" strokeWidth="2" />
      <polygon points="256,226 318,266 296,350 256,380 216,350 194,266" fill="url(#b_inner)" stroke="rgba(255,255,255,0.10)" strokeWidth="2" />

      <polygon points="140,260 194,266 188,388 128,330" fill="#07080A" opacity="0.92" />
      <polygon points="372,260 384,330 324,388 318,266" fill="#07080A" opacity="0.92" />

      <polyline points="256,188 372,260 324,388 256,452 188,388 140,260 256,188" stroke="rgba(255,255,255,0.10)" strokeWidth="2" fill="none" />
      <polyline points="256,226 318,266 296,350 256,380 216,350 194,266 256,226" stroke="rgba(255,255,255,0.10)" strokeWidth="2" fill="none" />
    </svg>
  );
}

function SovereignPromptMarkC({ size = 180 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="c_metal" x1="168" y1="168" x2="344" y2="400" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#07080A" />
          <stop offset="0.5" stopColor="#3C4049" />
          <stop offset="1" stopColor="#0A0B0D" />
        </linearGradient>
        <linearGradient id="c_glass" x1="256" y1="168" x2="256" y2="420" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#13151A" />
          <stop offset="0.55" stopColor="#1F232B" />
          <stop offset="1" stopColor="#07080A" />
        </linearGradient>
      </defs>

      <polygon points="256,86 274,146 256,166 238,146" fill="#0B0C0E" stroke="rgba(255,255,255,0.14)" strokeWidth="2" />
      <polygon points="200,130 224,172 202,190 176,160" fill="#0A0B0D" stroke="rgba(255,255,255,0.10)" strokeWidth="2" />
      <polygon points="312,130 336,160 310,190 288,172" fill="#0A0B0D" stroke="rgba(255,255,255,0.10)" strokeWidth="2" />
      <polygon points="146,190 176,206 158,252 126,234" fill="#0A0B0D" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
      <polygon points="366,190 386,234 354,252 336,206" fill="#0A0B0D" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />

      <polygon points="256,164 352,224 320,376 256,438 192,376 160,224" fill="url(#c_metal)" stroke="rgba(255,255,255,0.16)" strokeWidth="2" />
      <polygon points="256,196 304,230 286,332 256,356 226,332 208,230" fill="url(#c_glass)" stroke="rgba(255,255,255,0.10)" strokeWidth="2" />
      <polygon points="256,196 304,230 294,270 256,252 218,270 208,230" fill="#0B0C0E" opacity="0.80" />

      <polyline points="256,164 352,224 320,376 256,438 192,376 160,224 256,164" stroke="rgba(255,255,255,0.10)" strokeWidth="2" fill="none" />
      <polyline points="256,196 304,230 286,332 256,356 226,332 208,230 256,196" stroke="rgba(255,255,255,0.10)" strokeWidth="2" fill="none" />
    </svg>
  );
}

function SovereignPromptMarkD({ size = 180 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="d_outer" x1="256" y1="140" x2="256" y2="452" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0A0B0D" />
          <stop offset="0.45" stopColor="#31343C" />
          <stop offset="1" stopColor="#07080A" />
        </linearGradient>
        <linearGradient id="d_core" x1="220" y1="220" x2="292" y2="360" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#07080A" />
          <stop offset="0.55" stopColor="#23262E" />
          <stop offset="1" stopColor="#0A0B0D" />
        </linearGradient>
      </defs>

      <polygon points="256,92 286,146 256,178 226,146" fill="#0B0C0E" stroke="rgba(255,255,255,0.14)" strokeWidth="2" />
      <polygon points="168,148 212,188 188,218 140,184" fill="#0A0B0D" stroke="rgba(255,255,255,0.10)" strokeWidth="2" />
      <polygon points="344,148 372,184 324,218 300,188" fill="#0A0B0D" stroke="rgba(255,255,255,0.10)" strokeWidth="2" />

      <polygon points="256,174 364,234 332,378 256,452 180,378 148,234" fill="url(#d_outer)" stroke="rgba(255,255,255,0.16)" strokeWidth="2" />
      <polygon points="256,216 310,246 292,344 256,370 220,344 202,246" fill="url(#d_core)" stroke="rgba(255,255,255,0.10)" strokeWidth="2" />

      <polygon points="148,234 202,246 180,378 124,324" fill="#07080A" opacity="0.92" />
      <polygon points="364,234 388,324 332,378 310,246" fill="#07080A" opacity="0.92" />

      <polyline points="256,174 364,234 332,378 256,452 180,378 148,234 256,174" stroke="rgba(255,255,255,0.10)" strokeWidth="2" fill="none" />
      <polyline points="256,216 310,246 292,344 256,370 220,344 202,246 256,216" stroke="rgba(255,255,255,0.10)" strokeWidth="2" fill="none" />
    </svg>
  );
}

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

          <div className="pt-10 border-t border-white/5 space-y-4">
            <h3 className="text-slate-300 font-bold uppercase tracking-widest text-sm">Prompt Variants (Image-Only)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-black border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-6 hover:border-white/20 transition-colors">
                <SovereignPromptMarkA />
                <div className="text-center">
                  <h4 className="text-slate-200 font-bold mb-1">Variant A</h4>
                  <p className="text-xs text-slate-500 font-mono">Obsidian / Graphite</p>
                </div>
              </div>
              <div className="bg-black border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-6 hover:border-white/20 transition-colors">
                <SovereignPromptMarkB />
                <div className="text-center">
                  <h4 className="text-slate-200 font-bold mb-1">Variant B</h4>
                  <p className="text-xs text-slate-500 font-mono">Crown Emphasis</p>
                </div>
              </div>
              <div className="bg-black border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-6 hover:border-white/20 transition-colors">
                <SovereignPromptMarkC />
                <div className="text-center">
                  <h4 className="text-slate-200 font-bold mb-1">Variant C</h4>
                  <p className="text-xs text-slate-500 font-mono">Facet Dense</p>
                </div>
              </div>
              <div className="bg-black border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-6 hover:border-white/20 transition-colors">
                <SovereignPromptMarkD />
                <div className="text-center">
                  <h4 className="text-slate-200 font-bold mb-1">Variant D</h4>
                  <p className="text-xs text-slate-500 font-mono">Wide Shield</p>
                </div>
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
