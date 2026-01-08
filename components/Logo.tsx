import React from "react";

export default function Logo({ className = "", showText = true }: { className?: string, showText?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className} group`}>
      {/* Custom B21 Logo - B mixed with Dollar (BTC Style) + 21 */}
      <div className="relative w-16 h-16 flex items-center justify-center rounded-full shadow-[0_0_24px_rgba(212,175,55,0.7)] border border-white/20 overflow-hidden transition-transform group-hover:scale-105 duration-300"
           style={{ background: 'linear-gradient(135deg, #FFD700 0%, #E63946 25%, #FDB931 50%, #E5E4E2 75%, #C21807 100%)' }}>
        
        {/* Shine effect */}
        <div className="absolute top-0 -left-full w-full h-full bg-white/30 skew-x-12 group-hover:left-full transition-all duration-1000 ease-in-out" />
        
        {/* Content Container */}
        <div className="relative z-10 flex items-center justify-center gap-[1px] pl-[2px]">
            {/* The B with Lines */}
            <div className="relative flex items-center justify-center">
                {/* Vertical Lines (Dollar/BTC Style) - Closer gap */}
                <div className="absolute h-[120%] w-full flex justify-center gap-[1px] -top-[10%] opacity-90">
                    <div className="w-[2px] h-full bg-white/90 rounded-full shadow-sm" />
                    <div className="w-[2px] h-full bg-white/90 rounded-full shadow-sm" />
                </div>
                {/* B */}
                <span className="relative z-10 font-heading font-black text-white text-3xl leading-none tracking-tight" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.4)" }}>
                B
                </span>
            </div>
            
            {/* The 21 */}
            <span className="font-heading font-bold text-white/95 text-[12px] leading-none tracking-tighter self-end mb-[4px] -ml-[1px]" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>
                21
            </span>
        </div>
      </div>
      
      {showText && (
        <span className="font-heading font-bold text-xl md:text-2xl tracking-tight text-white group-hover:text-gold-500 transition-colors duration-300">
          Block<span className="text-gold-500">21</span>
        </span>
      )}
    </div>
  );
}
