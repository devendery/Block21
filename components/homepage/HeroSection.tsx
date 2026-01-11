"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, BarChart3, Lock, ShieldCheck, Info, TrendingUp, FileText } from "lucide-react";
import InstitutionalB21Logo from "@/components/ui/InstitutionalB21Logo";
import { useEffect, useState } from "react";
import { getMarketData } from "@/lib/api";

export default function HeroSection() {
  const [btcUsd, setBtcUsd] = useState<number | null>(null);
  const [b21Usd, setB21Usd] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const fetchPrice = async () => {
    try {
      const data = await getMarketData();
      if (typeof data.btc === "number" && data.btc > 0) setBtcUsd(data.btc);
      if (typeof data.b21 === "number" && data.b21 > 0) setB21Usd(data.b21);
    } catch {}
  };

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(() => {
      fetchPrice();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden bg-transparent"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePos({ x, y });
      }}
      onMouseLeave={() => setMousePos(null)}
    >
      {/* Hero Background Image + subtle grid overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div
          className="absolute inset-0 transition-opacity duration-200"
          style={{
            opacity: mousePos ? 0.6 : 0,
            background: `radial-gradient(circle at ${mousePos?.x ?? 50}% ${mousePos?.y ?? 50}%, rgba(255,0,51,0.15), rgba(255,0,51,0) 40%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-30 will-change-transform"
          style={{
            transform: mousePos
              ? `translate3d(${((mousePos.x - 50) / 50) * 8}px, ${((mousePos.y - 50) / 50) * 8}px, 0)`
              : "translate3d(0,0,0)",
            backgroundImage:
              "linear-gradient(to right, rgba(255,0,51,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,0,51,0.15) 1px, transparent 1px)",
            backgroundSize: "4rem 4rem",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 py-12 lg:py-20">
      
      {/* Text Content */}
      <div className="flex-1 text-center lg:text-left pt-10 lg:pt-0">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass-panel px-4 py-1.5 mb-8 hover:bg-white/5 transition-colors cursor-default shadow-none border-red-500/20">
            <div className="w-5 h-5 rounded-sm bg-red-900/20 flex items-center justify-center border border-red-500/50">
                <span className="text-red-500 text-[10px] font-bold">✕</span>
            </div>
            <span className="text-sm font-semibold tracking-wide text-gray-300 font-sans">No ICO. No pre-sale. Pure scarcity.</span>
        </div>

        <div role="heading" aria-level={1} className="mb-6">
          <span className="block text-4xl lg:text-6xl font-bold tracking-tight text-white mb-3 font-heading">
            Money Prints Infinite.
          </span>
          <span className="block text-4xl lg:text-6xl font-light text-red-600 tracking-wide font-heading">
            Absolute Scarcity.
          </span>
        </div>

        <div className="flex flex-col items-center justify-center lg:items-start lg:justify-start gap-2 mb-8">
            <div className="text-xs sm:text-sm font-semibold tracking-widest text-gray-300 uppercase font-heading">
              Play. Time. Value.
            </div>
        </div>

        <div className="text-base lg:text-lg text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light tracking-wide bg-[#0A0A0A] border border-white/5 rounded-sm px-4 py-3 relative overflow-hidden group hover:border-red-500/20 transition-colors">
          <div className="flex flex-col gap-3">
            <div className="font-sans">
              Bitcoin has 21 Million coins.{" "}
              <span className="font-bold text-white">Block21(B21)</span> has only{" "}
              <span className="font-mono text-red-500 font-bold">2.1 Million</span>.
              <span className="block">100X scarcer &amp; 100% Transparent.</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 pt-2 border-t border-white/5">
               <div className="flex items-center gap-2">
                 <span className="font-bold text-white text-sm uppercase tracking-wide font-heading">BTC now:</span>
                 <span className="font-mono text-white font-medium">{btcUsd ? `$${btcUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "fetching…"}</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="font-bold text-white text-sm uppercase tracking-wide font-heading">B21 now:</span>
                 <span className="font-mono text-white font-medium">{b21Usd ? `$${b21Usd.toFixed(6)}` : "fetching…"}</span>
               </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-10 max-w-lg mx-auto lg:mx-0">
            <Link href="/tokenomics" className="glass-card p-5 text-center lg:text-left group cursor-pointer border-l-2 border-l-transparent hover:border-l-red-500">
                <div className="flex items-center justify-center lg:justify-start gap-2 text-[10px] font-bold tracking-wider text-gray-500 mb-2 uppercase">
                    Total supply <Lock className="w-3 h-3" />
                </div>
                <div className="text-3xl font-bold text-white font-heading">2,100,000</div>
                <div className="text-[10px] font-bold text-red-500 mt-1 tracking-widest uppercase">Fixed forever</div>
            </Link>
            <Link href="/disclaimer#fair-launch" className="glass-card p-5 text-center lg:text-left group cursor-pointer border-l-2 border-l-transparent hover:border-l-red-500">
                <div className="flex items-center justify-center lg:justify-start gap-2 text-[10px] font-bold tracking-wider text-gray-500 mb-2 uppercase">
                    Launch type <ShieldCheck className="w-3 h-3" />
                </div>
                <div className="text-3xl font-bold text-white font-heading">Fair launch</div>
                <div className="text-[10px] font-bold text-gray-400 mt-1 tracking-widest group-hover:text-white">100% Transparent</div>
            </Link>
        </div>

        {/* Secondary CTAs (Pitch & Release) */}
        <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start relative z-20 mb-5">
            <Link href="/whitepaper" className="px-5 py-2 glass-panel hover:bg-white/5 text-gray-300 font-medium tracking-wide text-xs rounded-sm transition-all flex items-center justify-center gap-2 hover:border-white/20 font-sans uppercase">
               <FileText className="w-4 h-4" /> Whitepaper
            </Link>
            <Link href="/pitch" className="px-5 py-2 glass-panel hover:bg-white/5 text-gray-300 font-medium tracking-wide text-xs rounded-sm transition-all flex items-center justify-center gap-2 hover:border-white/20 font-sans uppercase">
               <BarChart3 className="w-4 h-4" /> Pitch Deck
            </Link>
            <Link href="/release-policy" className="px-5 py-2 glass-panel hover:bg-white/5 text-gray-300 font-medium tracking-wide text-xs rounded-sm transition-all flex items-center justify-center gap-2 hover:border-white/20 font-sans uppercase">
               <Info className="w-4 h-4" /> Release Policy
            </Link>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start relative z-20">
            <Link href="/market" className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold tracking-wide text-base rounded-sm transition-all shadow-none flex items-center justify-center gap-2 font-heading">
                <TrendingUp className="w-5 h-5" />
                Explore B21
            </Link>
            <Link href="/market#how-to-get-b21" className="w-full sm:w-auto px-8 py-4 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500/50 hover:text-green-300 font-medium tracking-wider text-sm rounded-sm transition-all flex items-center justify-center gap-2 font-sans backdrop-blur-sm">
                <ArrowRight className="w-5 h-5" />
                How to get B21
            </Link>
            <Link href="/price-discovery" className="w-full sm:w-auto px-8 py-4 bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/50 hover:text-orange-300 font-medium tracking-wider text-sm rounded-sm transition-all flex items-center justify-center gap-2 font-sans backdrop-blur-sm">
                <BarChart3 className="w-5 h-5" />
                Read price logic
            </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-bold text-gray-500 uppercase tracking-wider font-heading">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-none bg-red-500" /> Verified Contract
            </div>
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-none bg-gray-500" /> Polygon Network
            </div>
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-none bg-white" /> No Admin Keys
            </div>
        </div>

      </div>

      {/* Image / Visual - Sovereign V1 Logo (Obsidian) */}
      <div className="flex-1 relative w-full max-w-lg lg:max-w-none hidden lg:block">
         <div className="absolute inset-0 bg-red-500/5 blur-[100px] rounded-full -z-10" />
         <div className="relative aspect-square flex items-center justify-center animate-float-slow">
             <InstitutionalB21Logo size={400} variant="v1" theme="obsidian" className="drop-shadow-2xl" />
         </div>
      </div>

      </div>
    </section>
  );
}
