"use client";

import { useEffect, useState } from 'react';

export default function Background3D() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none perspective-1000">
      {/* Deep Space Base Layer */}
      <div className="absolute inset-0 bg-[#050505] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2a2d4a] via-[#050505] to-[#000000]" />

      {/* Moving Grid Floor (3D Perspective) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-60 transform-gpu perspective-3d-grid">
         <div className="w-[200vw] h-[200vw] bg-[linear-gradient(rgba(99,179,237,0.22)_2px,transparent_2px),linear-gradient(90deg,rgba(99,179,237,0.22)_2px,transparent_2px)] bg-[size:4rem_4rem] [transform:rotateX(60deg)_translateY(-100px)_translateZ(-200px)] animate-grid-flow" />
      </div>

      {/* Floating Luxury Orbs (Coins/Nodes) */}
      <div className="absolute inset-0">
        {/* Crystal Blue Orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-gradient-to-br from-[#63B3ED]/40 to-[#1E3A8A]/20 blur-2xl animate-float-slow" />
        <div className="absolute top-3/4 right-1/4 w-48 h-48 rounded-full bg-gradient-to-br from-[#63B3ED]/30 to-[#1E3A8A]/10 blur-3xl animate-float-medium" />
        
        {/* Light Blue Orbs */}
        <div className="absolute top-1/3 right-1/3 w-24 h-24 rounded-full bg-gradient-to-br from-[#A5B4FC]/30 to-[#1D4ED8]/10 blur-xl animate-float-fast" />
        
        {/* Deep Blue Accents */}
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 rounded-full bg-gradient-to-br from-[#0EA5E9]/30 to-[#1E3A8A]/10 blur-2xl animate-pulse-slow" />
      </div>

      {/* Connected Network Lines (Wireframe Effect) */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <linearGradient id="blue-line" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#63B3ED" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
           <linearGradient id="light-blue-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#A5B4FC" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        
        {/* Animated Lines */}
        <line x1="0" y1="20%" x2="100%" y2="80%" stroke="url(#blue-line)" strokeWidth="1" className="animate-dash-slow" />
        <line x1="100%" y1="0" x2="0" y2="100%" stroke="url(#light-blue-line)" strokeWidth="1" className="animate-dash-medium" />
        <line x1="20%" y1="0" x2="80%" y2="100%" stroke="url(#blue-line)" strokeWidth="0.5" className="animate-dash-fast" />
        
        {/* Connection Nodes */}
        <circle cx="20%" cy="20%" r="2" fill="#63B3ED" className="animate-ping-slow" />
        <circle cx="80%" cy="80%" r="2" fill="#A5B4FC" className="animate-ping-medium" />
        <circle cx="50%" cy="50%" r="3" fill="#0EA5E9" className="animate-pulse" />
      </svg>
      
      {/* 3D Rotating Cube/Block (Symbolic Blockchain) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-10 pointer-events-none">
         <div className="w-full h-full border border-blue-500/20 rounded-full animate-spin-slow-reverse border-dashed" />
         <div className="absolute inset-4 border border-blue-300/20 rounded-full animate-spin-slow border-dotted" />
      </div>

    </div>
  );
}
