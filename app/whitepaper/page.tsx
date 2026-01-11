import type { Metadata } from 'next';
import { FileText, ShieldCheck, Zap, TrendingUp, Users, Target, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Whitepaper - Block21',
  description: 'The official technical and philosophical whitepaper for Block21 (B21).',
};

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen bg-black text-gray-200 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-6 border-b border-white/10 pb-12">
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-red-900/20 text-red-500 mb-4">
            <FileText size={40} />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white font-heading tracking-tight">
            Block21 Whitepaper
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A Fixed-Supply Utility Token for the Digital Age.
          </p>
          <div className="text-sm text-gray-500 font-mono">
            Version 1.0 • January 2026
          </div>
        </div>

        {/* 1. Abstract */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-red-500">01.</span> Abstract
          </h2>
          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed text-lg">
            <p>
              In an era of infinite monetary expansion, true scarcity is the ultimate asset. Block21 (B21) is a decentralized digital asset built on the Polygon network with a strictly fixed supply of 2,100,000 tokens—exactly 1/10th of Bitcoin's supply.
            </p>
            <p>
              Unlike traditional cryptocurrencies that rely on inflation or complex minting mechanisms, B21 is pre-mined, immutable, and designed for immediate utility in a skill-based gaming and educational ecosystem. This paper outlines the technical architecture, economic model, and strategic vision for Block21.
            </p>
          </div>
        </section>

        {/* 2. The Problem */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-red-500">02.</span> The Problem: Inflation & Centralization
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="p-2 bg-red-900/20 rounded-lg text-red-500"><TrendingUp size={20} /></div>
                Fiat Debasement
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Central banks continuously print money, eroding purchasing power. "Stable" currencies lose value every year. Savings held in fiat are guaranteed to lose value over time.
              </p>
            </div>
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="p-2 bg-red-900/20 rounded-lg text-red-500"><Users size={20} /></div>
                VC Domination
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Most modern crypto projects allocate vast supplies to insiders and VCs at fractions of a penny, dumping on retail users later. The "community" is often the exit liquidity.
              </p>
            </div>
          </div>
        </section>

        {/* 3. The Solution */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-red-500">03.</span> The Solution: Absolute Scarcity
          </h2>
          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
            <p>
              Block21 enforces scarcity through code. The smart contract has no minting function, meaning the supply can never increase.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                 <div className="text-3xl font-bold text-white mb-1">2.1M</div>
                 <div className="text-xs text-gray-500 uppercase tracking-widest">Fixed Supply</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                 <div className="text-3xl font-bold text-white mb-1">0%</div>
                 <div className="text-xs text-gray-500 uppercase tracking-widest">Inflation</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                 <div className="text-3xl font-bold text-white mb-1">Fair</div>
                 <div className="text-xs text-gray-500 uppercase tracking-widest">Launch</div>
              </div>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-gray-300 mt-6">
              <li><strong>Fixed Supply:</strong> 2,100,000 B21 (Hard Cap).</li>
              <li><strong>No Inflation:</strong> No staking rewards printed from thin air. Rewards come from ecosystem fees.</li>
              <li><strong>Fair Launch:</strong> No ICO, no pre-sale, no private rounds. Everyone buys from the market.</li>
            </ul>
          </div>
        </section>

        {/* 4. Tokenomics */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-red-500">04.</span> Tokenomics
          </h2>
          <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
             <div className="grid md:grid-cols-2 gap-12">
                <div>
                   <h3 className="text-xl font-bold text-white mb-6">Distribution</h3>
                   <ul className="space-y-4 text-sm">
                      <li className="flex justify-between border-b border-white/5 pb-2 items-center">
                        <span className="text-gray-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Treasury (Ecosystem)</span>
                        <span className="font-mono text-white font-bold">40%</span>
                      </li>
                      <li className="flex justify-between border-b border-white/5 pb-2 items-center">
                        <span className="text-gray-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> Liquidity Pool</span>
                        <span className="font-mono text-white font-bold">20%</span>
                      </li>
                      <li className="flex justify-between border-b border-white/5 pb-2 items-center">
                        <span className="text-gray-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Public Allocation</span>
                        <span className="font-mono text-white font-bold">10%</span>
                      </li>
                      <li className="flex justify-between border-b border-white/5 pb-2 items-center">
                        <span className="text-gray-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Founders (Locked)</span>
                        <span className="font-mono text-white font-bold">10%</span>
                      </li>
                      <li className="flex justify-between border-b border-white/5 pb-2 items-center">
                        <span className="text-gray-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Rewards</span>
                        <span className="font-mono text-white font-bold">10%</span>
                      </li>
                      <li className="flex justify-between border-b border-white/5 pb-2 items-center">
                        <span className="text-gray-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-500"></div> Team & Dev</span>
                        <span className="font-mono text-white font-bold">5%</span>
                      </li>
                      <li className="flex justify-between border-b border-white/5 pb-2 items-center">
                        <span className="text-gray-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Reserve</span>
                        <span className="font-mono text-white font-bold">5%</span>
                      </li>
                   </ul>
                </div>
                <div>
                   <h3 className="text-xl font-bold text-white mb-6">Technical Specs</h3>
                   <ul className="space-y-4 text-sm">
                      <li className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-400">Network</span>
                        <span className="text-white font-mono">Polygon (POS)</span>
                      </li>
                      <li className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-400">Standard</span>
                        <span className="text-white font-mono">ERC-20</span>
                      </li>
                      <li className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-400">Contract</span>
                        <Link href="/transparency" className="text-red-400 hover:text-red-300 font-mono underline decoration-dotted truncate max-w-[150px]">
                           View Contract
                        </Link>
                      </li>
                      <li className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-400">Mintable</span>
                        <span className="text-red-500 font-bold font-mono">NO</span>
                      </li>
                      <li className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-400">Burnable</span>
                        <span className="text-green-500 font-bold font-mono">YES</span>
                      </li>
                   </ul>
                </div>
             </div>
          </div>
        </section>

        {/* 5. Utility & Roadmap */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-red-500">05.</span> Utility & Roadmap
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
             <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-red-500/30 transition-colors">
                <Zap className="text-yellow-400 mb-4" size={32} />
                <h3 className="font-bold text-white mb-2 text-lg">Phase 1: Foundation</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Launch, Liquidity, and Community building. Establishing the "Sovereign" brand and trust layer.</p>
             </div>
             <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-red-500/30 transition-colors">
                <Target className="text-blue-400 mb-4" size={32} />
                <h3 className="font-bold text-white mb-2 text-lg">Phase 2: Gaming</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Integration with skill-based games (Ludo, Chess) where B21 is the currency of entry and reward.</p>
             </div>
             <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-red-500/30 transition-colors">
                <ShieldCheck className="text-green-400 mb-4" size={32} />
                <h3 className="font-bold text-white mb-2 text-lg">Phase 3: Governance</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Transition to a DAO structure where token holders vote on ecosystem grants and direction.</p>
             </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="border-t border-white/10 pt-12 mt-12">
          <h3 className="font-bold text-gray-400 mb-4 uppercase tracking-wider text-xs">Legal Disclaimer</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            This whitepaper is for informational purposes only and does not constitute financial advice, an offer to sell, or a solicitation of an offer to buy any securities. 
            Block21 (B21) is a utility token designed for use within the Block21 ecosystem. It is not a security, stock, or investment contract. 
            Cryptocurrency markets are highly volatile. You should only participate if you are willing to lose the entire amount of your participation.
            The team makes no guarantees regarding the value, stability, or future performance of B21.
          </p>
        </section>

      </div>
    </div>
  );
}
