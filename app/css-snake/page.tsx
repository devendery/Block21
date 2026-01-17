"use client";

import React, { useState, useEffect } from "react";
import AnimatedSnake from "@/components/showcase/AnimatedSnake";
import { UserProfile } from "@/types/game";
import { useWallet } from "@/hooks/useWallet";
import { Settings, User, Sparkles, Code, Layers } from "lucide-react";
import Link from "next/link";

export default function SnakeShowcasePage() {
  const { address } = useWallet();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeSkin, setActiveSkin] = useState("classic");
  const [mode, setMode] = useState<"interactive" | "css">("interactive");
  const [debug, setDebug] = useState(false);

  // Fetch profile to sync skin
  useEffect(() => {
    if (address) {
      fetch(`/api/user/profile?address=${address}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setProfile(data);
            if (data.activeSkin) setActiveSkin(data.activeSkin);
          }
        });
    }
  }, [address]);

  const skins = ["classic", "neon", "magma", "toxic", "void"];

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2">
              CSS Snake Engine
            </h1>
            <p className="text-slate-400 max-w-xl">
              A dual-implementation showcase: Interactive JavaScript physics vs Pure CSS keyframe animations.
              Featuring procedural skins and fluid articulation.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <Link href="/profile" className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-green-500 text-sm font-bold flex items-center gap-2 transition-colors">
                <User className="w-4 h-4" />
                {profile ? profile.username : "Guest Profile"}
             </Link>
          </div>
        </div>

        {/* Main Showcase Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Control Panel */}
            <div className="space-y-6">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-blue-400" />
                        Render Mode
                    </h2>
                    <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setMode("interactive")}
                          className={`px-4 py-3 rounded-xl text-left border transition-all ${
                              mode === "interactive" 
                              ? "bg-blue-500/10 border-blue-500 text-blue-400" 
                              : "bg-black/20 border-slate-700 text-slate-400 hover:bg-slate-800"
                          }`}
                        >
                            <div className="font-bold">Interactive Physics</div>
                            <div className="text-xs opacity-70 mt-1">
                                JavaScript-driven Inverse Kinematics. Follows mouse cursor with fluid delay.
                            </div>
                        </button>
                        <button
                          onClick={() => setMode("css")}
                          className={`px-4 py-3 rounded-xl text-left border transition-all ${
                              mode === "css" 
                              ? "bg-green-500/10 border-green-500 text-green-400" 
                              : "bg-black/20 border-slate-700 text-slate-400 hover:bg-slate-800"
                          }`}
                        >
                            <div className="font-bold">Pure CSS Animation</div>
                            <div className="text-xs opacity-70 mt-1">
                                Keyframe-based slithering loop. No JS used for movement logic.
                            </div>
                        </button>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        Skin Selector
                    </h2>
                    <div className="grid grid-cols-3 gap-2">
                        {skins.map(skin => (
                            <button
                                key={skin}
                                onClick={() => setActiveSkin(skin)}
                                className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                                    activeSkin === skin 
                                    ? "border-purple-500 bg-purple-500/10" 
                                    : "border-slate-700 bg-black/40 hover:border-slate-500"
                                }`}
                            >
                                <div className={`w-6 h-6 rounded-full shadow-lg skin-preview-${skin}`} 
                                     style={{ background: getSkinColor(skin) }} 
                                />
                                <span className="text-[10px] uppercase font-bold text-slate-400">{skin}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Code className="w-5 h-5 text-orange-400" />
                        Tech Specs
                    </h2>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            CSS Custom Properties (Variables)
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            BEM Naming Convention
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            GPU Accelerated Transforms
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Responsive Viewport Units
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right Display Area */}
            <div className="lg:col-span-2 min-h-[500px] flex flex-col">
                <div className="flex-1 bg-grid-pattern rounded-2xl border border-slate-800 relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-black/80 pointer-events-none" />
                    
                    {/* The Snake Component */}
                    <div className="absolute inset-0 z-10">
                        <AnimatedSnake 
                            skin={activeSkin} 
                            interactive={mode === "interactive"}
                            animated={mode === "css"}
                            length={24}
                            size={48}
                        />
                    </div>

                    {/* Overlay Info */}
                    <div className="absolute bottom-6 right-6 z-20 text-right pointer-events-none">
                        <div className="text-xs font-mono text-slate-500 mb-1">CURRENT SKIN</div>
                        <div className="text-2xl font-black text-white uppercase tracking-wider">{activeSkin}</div>
                    </div>
                </div>
                
                {/* Source Code Preview (Fake) */}
                <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-400 overflow-x-auto">
                    <div className="text-green-400 mb-2">// CSS Module Example for {activeSkin}</div>
                    <pre>{`.snake--skin-${activeSkin} {
  --snake-color-primary: ${getSkinColor(activeSkin)};
  --snake-color-secondary: ${adjustColor(getSkinColor(activeSkin), -20)};
  filter: drop-shadow(0 0 15px ${getSkinColor(activeSkin)}80);
}`}</pre>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

// Helper to match the one in AnimatedSnake (duplicated for demo logic)
function getSkinColor(id: string) {
    const map: Record<string, string> = {
        classic: '#22c55e',
        neon: '#06b6d4',
        magma: '#f59e0b',
        toxic: '#84cc16',
        void: '#1e293b',
    };
    return map[id] || '#22c55e';
}

function adjustColor(hex: string, amount: number) {
    // Mock adjustment for display
    return hex; 
}
