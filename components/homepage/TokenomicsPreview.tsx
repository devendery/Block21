"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Lock } from "lucide-react";

export default function TokenomicsPreview() {
  const distribution = [
    { label: "Public Allocation", value: 40, amount: "840,000 B21", desc: "Reserved for public market liquidity", color: "bg-primary" },
    { label: "Liquidity Pool", value: 25, amount: "525,000 B21", desc: "DEX liquidity provision", color: "bg-blue-500" },
    { label: "Development", value: 15, amount: "315,000 B21", desc: "Platform development fund", color: "bg-green-500" },
    { label: "Marketing", value: 10, amount: "210,000 B21", desc: "Community growth initiatives", color: "bg-yellow-500" },
  ];

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Text Content */}
        <div>
           <div className="inline-flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-full px-3 py-1 mb-6">
                <Lock className="w-3 h-3 text-green-500" />
                <span className="text-xs font-bold text-gray-300">Tokenomics</span>
           </div>
           
           <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
             Fixed Supply. <br />
             <span className="text-green-500">Zero Inflation.</span>
           </h2>
           
           <p className="text-lg text-gray-400 mb-8 leading-relaxed">
             2.1 million tokens. Forever. Just like Bitcoin, but scarcer. Every allocation is transparent, every wallet is public, and every transaction is verifiable on-chain.
           </p>

           <div className="space-y-4 mb-10">
              {[
                  { title: "No Hidden Team Wallets", desc: "Development funds are vested and public." },
                  { title: "Locked Liquidity", desc: "LP tokens locked for 2 years with public proof" },
                  { title: "Transparent Vesting", desc: "All vesting schedules public and on-chain verifiable" }
              ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                      <div className="mt-1">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                          <h4 className="font-bold text-white">{item.title}</h4>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                  </div>
              ))}
           </div>

          <Link 
            href="/transparency"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl transition-all"
          >
            View Full Transparency <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats Card */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-8 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-8 pb-8 border-b border-gray-800">
                <h3 className="text-xl font-bold text-white">Token Distribution</h3>
                <span className="text-sm text-gray-500">2.1M Total</span>
            </div>

            <div className="space-y-8">
                {distribution.map((item, i) => (
                    <div key={i}>
                        <div className="flex justify-between items-end mb-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                                <span className="font-bold text-white">{item.label}</span>
                            </div>
                            <div className="text-right">
                                <span className="block font-bold text-white">{item.value}%</span>
                                <span className="text-xs text-gray-500">{item.amount}</span>
                            </div>
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                            <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                        </div>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-800">
                <div className="bg-black/40 rounded-xl p-4 border border-gray-800 flex gap-4 items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-green-500 text-sm mb-1">Verified On-Chain</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            All allocations are locked in smart contracts and publicly verifiable on Polygonscan
                        </p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </section>
  );
}
