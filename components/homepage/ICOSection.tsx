"use client";

import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { useState, useEffect } from "react";

export default function ICOSection() {
  const [timeLeft, setTimeLeft] = useState({ days: 15, hours: 8, minutes: 42, seconds: 18 });

  // Simple countdown simulation
  useEffect(() => {
    const timer = setInterval(() => {
        setTimeLeft(prev => {
            if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
            if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
            if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
            if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
            return prev;
        });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative z-10 py-24 bg-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1 mb-6">
                <Flame className="w-3 h-3 text-orange-500" />
                <span className="text-xs font-bold text-orange-500">ICO Live Now</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                ICO Participation
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
                Optional. Transparent. No pressure. Participate only if you understand the risks and believe in the vision.
            </p>
        </div>

        {/* Timer Box */}
        <div className="max-w-3xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-16 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Round 1 Ends In</h3>
            <p className="text-gray-500 text-sm mb-8">Limited time opportunity at early-bird pricing</p>
            
            <div className="grid grid-cols-4 gap-4 md:gap-8">
                {[
                    { val: timeLeft.days, label: "DAYS" },
                    { val: timeLeft.hours, label: "HOURS" },
                    { val: timeLeft.minutes, label: "MINUTES" },
                    { val: timeLeft.seconds, label: "SECONDS" }
                ].map((item, i) => (
                    <div key={i} className="bg-black rounded-xl py-4 border border-gray-800">
                        <div className="text-3xl md:text-4xl font-black text-green-500 mb-1">
                            {String(item.val).padStart(2, '0')}
                        </div>
                        <div className="text-[10px] font-bold text-gray-500 tracking-widest">{item.label}</div>
                    </div>
                ))}
            </div>
        </div>

        {/* Rounds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            
            {/* Round 1 (Active) */}
            <div className="relative bg-gray-900 border border-green-500 rounded-2xl p-6 md:p-8">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Active Now
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-6">Round 1 (Seed)</h3>
                
                <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Price:</span>
                        <span className="font-bold text-green-400">$0.006</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Allocation:</span>
                        <span className="font-bold text-white">210,000 B21</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Remaining:</span>
                        <span className="font-bold text-white">0 B21</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2">
                        <div className="h-full bg-green-500 rounded-full w-[100%]" />
                    </div>
                </div>
            </div>

            {/* Round 2 */}
            <div className="relative bg-gray-900/50 border border-gray-800 rounded-2xl p-6 md:p-8 opacity-75">
                <h3 className="text-2xl font-bold text-white text-center mb-6">Round 2 (Private)</h3>
                <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Price:</span>
                        <span className="font-bold text-green-400">$0.08</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Allocation:</span>
                        <span className="font-bold text-white">252,000 B21</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Remaining:</span>
                        <span className="font-bold text-white">252,000 B21</span>
                    </div>
                </div>
                <div className="text-center text-xs font-bold text-gray-600 uppercase tracking-widest mt-8">Coming Soon</div>
            </div>

            {/* Round 3 */}
            <div className="relative bg-gray-900/50 border border-gray-800 rounded-2xl p-6 md:p-8 opacity-75">
                <h3 className="text-2xl font-bold text-white text-center mb-6">Round 3 (Public)</h3>
                <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Price:</span>
                        <span className="font-bold text-green-400">$0.012</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Allocation:</span>
                        <span className="font-bold text-white">420,000 B21</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Remaining:</span>
                        <span className="font-bold text-white">420,000 B21</span>
                    </div>
                </div>
                <div className="text-center text-xs font-bold text-gray-600 uppercase tracking-widest mt-8">Coming Soon</div>
            </div>

        </div>

        {/* CTA - High level, without linking to dashboard directly */}
        <div className="text-center">
            <p className="text-xs text-gray-500">
                Participation details and on-chain records remain available for community review, even after the sale.
            </p>
        </div>

      </div>
    </section>
  );
}
