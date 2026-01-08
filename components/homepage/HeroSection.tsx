"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, BarChart3, Lock, ShieldCheck, Info, TrendingUp } from "lucide-react";
import B21Symbol from "@/components/ui/B21Symbol";
import { useEffect, useState } from "react";
import { getMarketData } from "@/lib/api";

export default function HeroSection() {
  const [btcUsd, setBtcUsd] = useState<number | null>(null);
  const [b21Usd, setB21Usd] = useState<number | null>(null);
  const [refreshCountdown, setRefreshCountdown] = useState(10);
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
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchPrice();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
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
        <Image src="/images/hero-gold.jpg" alt="" fill className="object-cover opacity-35" priority />
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#8A8F9812_1px,transparent_1px),linear-gradient(to_bottom,#8A8F9812_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div
          className="absolute inset-0 transition-opacity duration-200"
          style={{
            opacity: mousePos ? 0.6 : 0,
            background: `radial-gradient(circle at ${mousePos?.x ?? 50}% ${mousePos?.y ?? 50}%, rgba(99,179,237,0.25), rgba(99,179,237,0) 40%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-20 will-change-transform"
          style={{
            transform: mousePos
              ? `translate3d(${((mousePos.x - 50) / 50) * 8}px, ${((mousePos.y - 50) / 50) * 8}px, 0)`
              : "translate3d(0,0,0)",
            backgroundImage:
              "linear-gradient(to right, rgba(99,179,237,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,179,237,0.25) 1px, transparent 1px)",
            backgroundSize: "4rem 4rem",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 py-12 lg:py-20">
      
      {/* Text Content */}
      <div className="flex-1 text-center lg:text-left pt-10 lg:pt-0">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass-panel px-4 py-1.5 mb-8 hover:bg-white/5 transition-colors cursor-default shadow-none border-brand-gold/20">
            <div className="w-5 h-5 rounded-sm bg-brand-gold/20 flex items-center justify-center border border-brand-gold/50">
                <span className="text-brand-gold text-[10px] font-bold">✕</span>
            </div>
            <span className="text-sm font-semibold tracking-wide text-brand-white/80 font-sans">No ICO. No pre-sale. Pure market launch.</span>
        </div>

        <div role="heading" aria-level={1} className="mb-6">
          <span className="block text-4xl lg:text-6xl font-bold tracking-tight text-white mb-3 font-heading">
            Money Loses Value.
          </span>
          <span className="block text-4xl lg:text-6xl font-light text-brand-gold tracking-wide font-heading">
            Time Matters.
          </span>
        </div>

        <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
            <span className="h-px w-12 bg-brand-gold/50 hidden lg:block"></span>
            <span className="text-brand-gold font-medium tracking-widest text-sm uppercase font-heading">Value is discovered, not fixed.</span>
        </div>

        <div className="text-base lg:text-lg text-brand-gray mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light tracking-wide bg-brand-charcoal/50 border border-white/5 rounded-sm px-4 py-3 relative overflow-hidden group hover:border-brand-gold/20 transition-colors">
          <span className="absolute top-2 right-2 text-[10px] font-mono text-brand-gray bg-black/40 px-1.5 py-0.5 rounded-sm">
             {refreshCountdown}s
          </span>
          <div className="flex flex-col gap-3">
            <div className="font-sans">
              Bitcoin began with fractions of a cent and earned value over time.{" "}
              <span className="font-bold text-white">Block21(B21)</span> starts at{" "}
              <span className="font-mono text-brand-gray">$0.006</span>, aligned with history, scarcity, and transparency.
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
            <Link href="/tokenomics" className="glass-card p-5 text-center lg:text-left group cursor-pointer border-l-2 border-l-transparent hover:border-l-brand-gold">
                <div className="flex items-center justify-center lg:justify-start gap-2 text-[10px] font-bold tracking-wider text-brand-gray mb-2 uppercase">
                    Total supply <Lock className="w-3 h-3" />
                </div>
                <div className="text-3xl font-bold text-white font-heading">2,100,000</div>
                <div className="text-[10px] font-bold text-brand-gold mt-1 tracking-widest uppercase">Fixed forever</div>
            </Link>
            <Link href="/disclaimer#fair-launch" className="glass-card p-5 text-center lg:text-left group cursor-pointer border-l-2 border-l-transparent hover:border-l-brand-gold">
                <div className="flex items-center justify-center lg:justify-start gap-2 text-[10px] font-bold tracking-wider text-brand-gray mb-2 uppercase">
                    Launch type <ShieldCheck className="w-3 h-3" />
                </div>
                <div className="text-3xl font-bold text-white font-heading">Fair launch</div>
                <div className="text-[10px] font-bold text-brand-gray mt-1 tracking-widest group-hover:text-brand-white">100% Transparent</div>
            </Link>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start relative z-20">
            <Link href="/market" className="w-full sm:w-auto px-8 py-4 bg-brand-gold hover:bg-[#B89640] text-brand-charcoal font-bold tracking-wide text-base rounded-sm transition-all shadow-none flex items-center justify-center gap-2 font-heading">
                <TrendingUp className="w-5 h-5" />
                Explore B21
            </Link>
            <Link href="/market#how-to-get-b21" className="w-full sm:w-auto px-8 py-4 glass-panel hover:bg-white/5 text-brand-white font-medium tracking-wider text-sm rounded-sm transition-all flex items-center justify-center gap-2 hover:border-white/20 font-sans">
                <ArrowRight className="w-5 h-5" />
                How to get B21
            </Link>
            <Link href="/learn" className="w-full sm:w-auto px-8 py-4 glass-panel hover:bg-white/5 text-brand-white font-medium tracking-wider text-sm rounded-sm transition-all flex items-center justify-center gap-2 hover:border-white/20 transform hover:-translate-y-1 font-sans">
                <BookOpen className="w-5 h-5" />
                Learn more
            </Link>
            <Link href="/price-discovery" className="w-full sm:w-auto px-8 py-4 glass-panel hover:bg-white/5 text-brand-white font-medium tracking-wider text-sm rounded-sm transition-all flex items-center justify-center gap-2 hover:border-white/20 font-sans">
                <BarChart3 className="w-5 h-5" />
                Read price logic
            </Link>
            <Link href="/release-policy" className="w-full sm:w-auto px-8 py-4 glass-panel hover:bg-white/5 text-brand-white font-medium tracking-wider text-sm rounded-sm transition-all flex items-center justify-center gap-2 hover:border-white/20 font-sans">
                <Info className="w-5 h-5" />
                View release policy
            </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-bold text-brand-gray uppercase tracking-wider font-heading">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-none bg-brand-gold" /> Verified Contract
            </div>
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-none bg-brand-gray" /> Polygon Network
            </div>
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-none bg-brand-white" /> No Admin Keys
            </div>
        </div>

      </div>

      {/* Image / Visual - Abstract Geometric Node */}
      <div className="flex-1 relative w-full max-w-lg lg:max-w-none hidden lg:block">
         <div className="absolute inset-0 bg-brand-gold/5 blur-[100px] rounded-full -z-10" />
         <div className="relative aspect-square flex items-center justify-center">
             <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
                {/* 3D Cube/Sphere Representation of Scarcity - Minimal/Matte */}
                <div className="relative w-40 h-40 preserve-3d animate-float-slow">
                    {/* Glowing Core - Reduced */}
                    <div className="absolute inset-0 rounded-lg bg-brand-gold/10 blur-xl animate-pulse-slow"></div>
                    
                    {/* Central 3D Object - Matte Gold Block */}
                    <div className="absolute inset-0 m-auto w-32 h-32 rounded-lg bg-gradient-to-br from-brand-gold via-[#94762E] to-[#5E4B1D] shadow-lg flex items-center justify-center border border-brand-gold/30 overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-shine"></div>
                        <div className="flex flex-col items-center justify-center z-10">
                             <span className="text-xl font-black text-white drop-shadow-sm font-heading">2.1M</span>
                             <span className="text-[10px] font-bold text-brand-charcoal uppercase tracking-widest mt-0.5 font-sans">Fixed</span>
                        </div>
                    </div>
                    
                    {/* Orbiting Rings - Geometric Squares */}
                    <div className="absolute inset-[-15px] rounded-lg border border-brand-gold/20 animate-spin-slow border-dashed"></div>
                    <div className="absolute inset-[-30px] rounded-lg border border-brand-gold/10 animate-spin-slow-reverse border-dotted"></div>
                </div>
             </div>
         </div>
      </div>

      </div>
    </section>
  );
}
