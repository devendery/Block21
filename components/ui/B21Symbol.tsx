"use client";

import { useState } from "react";

type Size = "sm" | "md" | "lg";

export default function B21Symbol({ size = "md", className = "" }: { size?: Size; className?: string }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dims =
    size === "sm" ? "w-16 h-16" : size === "lg" ? "w-40 h-40" : "w-28 h-28";
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    setPos({ x, y });
  };
  const handleLeave = () => setPos({ x: 0, y: 0 });
  const rotateX = -pos.y * 6;
  const rotateY = pos.x * 6;
  const translate = `translate3d(${pos.x * 6}px, ${pos.y * 6}px, 0)`;
  const tilt = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  return (
    <div
      role="img"
      aria-label="Block21 symbol"
      className={`relative ${dims} ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-700 via-gold-500 to-red-900 blur-xl opacity-25" />
      <div
        className="absolute inset-0 rounded-2xl border border-gold-500/40 backdrop-blur-sm"
        style={{ transform: tilt }}
      />
      <div
        className="absolute inset-[-6%] rounded-full border border-red-600/30"
        style={{ transform: tilt }}
      />
      <div
        className="absolute inset-0 flex items-center justify-center perspective-1000"
        style={{ transform: tilt }}
      >
        <div
          className="relative rounded-full bg-gradient-to-b from-white/20 via-gold-500/30 to-transparent shadow-[0_0_30px_rgba(212,175,55,0.25)] flex items-center justify-center overflow-hidden"
          style={{ transform: translate }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.7),transparent_50%)]" />
          <div className="relative flex items-baseline gap-1 px-4">
            <span className="text-transparent bg-clip-text bg-metallic-gold font-black tracking-tight text-4xl">B</span>
            <span className="text-transparent bg-clip-text bg-metallic-gold font-black tracking-tight text-3xl">21</span>
          </div>
        </div>
      </div>
      <div
        className="absolute inset-[-8%] rounded-full border border-gold-500/20 animate-spin-slow"
        style={{ transform: tilt }}
      />
      <div
        className="absolute inset-[-16%] rounded-full border border-gold-500/10 animate-spin-slow-reverse"
        style={{ transform: tilt }}
      />
    </div>
  );
}
