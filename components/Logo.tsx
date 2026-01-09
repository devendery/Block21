import React from "react";
import InstitutionalB21Logo from "./ui/InstitutionalB21Logo";

export default function Logo({ className = "", showText = true }: { className?: string, showText?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-3 ${className} group`}>
      {/* Sovereign V1 Logo - Obsidian Theme (Legacy Standard) */}
      <InstitutionalB21Logo 
        size={72} 
        variant="v1" 
        theme="obsidian" 
        className="transition-transform group-hover:scale-105 duration-300"
      />
      
      {showText && (
        <div className="flex flex-col items-start justify-center -space-y-1">
            <span className="font-heading font-bold text-xl md:text-2xl tracking-tight text-[#525252] group-hover:text-white transition-colors duration-300">
              Block
              <span className="text-[#FF0033] font-sans font-extrabold tabular-nums tracking-normal">21</span>
            </span>
            <span className="text-[10px] font-mono text-[#525252] font-bold tracking-widest uppercase pl-0.5 group-hover:text-white/50 transition-colors duration-300">
                Official Standard
            </span>
        </div>
      )}
    </div>
  );
}
