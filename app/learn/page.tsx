import type { Metadata } from 'next';
import { Check, X, Scale, Lock, Zap, Brain, TrendingDown } from 'lucide-react';
import InstitutionalB21Logo from "@/components/ui/InstitutionalB21Logo";

export const metadata: Metadata = {
  title: 'Learn - Block21',
  description: 'Understand the difference between Bitcoin and Block21. Fixed supply, transparent rules, and Polygon efficiency.',
};

export default function LearnPage() {
  const comparisonData = [
    { category: "Launch Year", btc: "2009", b21: "2025" },
    { category: "Creator", btc: "Satoshi Nakamoto (anonymous)", b21: "Public & transparent" },
    { category: "Network", btc: "Bitcoin Mainnet", b21: "Polygon (EVM compatible)" },
    { category: "Total Supply", btc: "21,000,000 BTC", b21: "2,100,000 B21" },
    { category: "Supply Nature", btc: "Fixed forever", b21: "Fixed forever" },
    { category: "Decimals", btc: "8", b21: "8" },
    { category: "ICO / Presale", btc: "❌ None", b21: "❌ None" },
    { category: "Initial Price", btc: "$0", b21: "$0" },
    { category: "Early Liquidity", btc: "Extremely low", b21: "Intentionally low" },
    { category: "Price Discovery", btc: "Market-driven", b21: "Market-driven" },
    { category: "Minting Model", btc: "Mining (PoW)", b21: "One-time mint" },
    { category: "Inflation", btc: "Yes (decreasing)", b21: "❌ None" },
    { category: "Halving / Reduction Logic", btc: "Block reward halves every ~4 years", b21: "Protocol fee halves on a time schedule" },
    { category: "Halving Details", btc: "50 → 25 → 12.5 BTC per block", b21: "2% → 1% → 0.5% → 0.25% → 0.17% (minimum)" },
    { category: "Fee / Reward Trigger", btc: "New blocks", b21: "DEX sells only" },
    { category: "Buy Fee", btc: "❌ None", b21: "❌ None" },
    { category: "Wallet → Wallet Fee", btc: "❌ None", b21: "❌ None" },
    { category: "Sell Fee", btc: "❌ None", b21: "2% (initial)" },
    { category: "Fee Distribution", btc: "N/A", b21: "1% Treasury, 1% Rewards" },
    { category: "Fee Reduction Timeline", btc: "Every ~4 years", b21: "Year 1 → 50%, then every 2 yrs → gradual, every 4 yrs → 50%" },
    { category: "Minimum Fee", btc: "N/A", b21: "0.17% fixed forever" },
    { category: "Admin Control", btc: "❌ None", b21: "❌ None (after renounce)" },
    { category: "Governance", btc: "Social consensus", b21: "V2 DAO (future)" },
    { category: "Transparency", btc: "Open-source", b21: "Open-source" },
    { category: "Upgrade Path", btc: "Hard forks", b21: "Separate V2 contracts" },
    { category: "Guarantees", btc: "❌ None", b21: "❌ None" },
  ];

  return (
    <div className="min-h-screen bg-transparent text-foreground pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-black mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary animate-gradient-x">
              Bitcoin (BTC) vs Block21 (B21)
            </span>
          </h1>
        </div>

        {/* Comparison Table */}
        <div className="glass-card rounded-2xl overflow-hidden mb-20 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="grid grid-cols-12 glass-panel border-b border-white/10 p-4 sticky top-0 backdrop-blur-md z-10">
                <div className="col-span-4 md:col-span-3 font-bold text-gray-400 text-xs tracking-wider flex items-center">Category</div>
                <div className="col-span-4 md:col-span-4 font-bold text-orange-500 text-center text-xs tracking-wider flex items-center justify-center gap-2">
                    <img src="https://assets.coingecko.com/coins/images/1/small/bitcoin.png" className="w-4 h-4" alt="BTC" /> 
                    <span className="hidden md:inline-flex items-center gap-1 font-heading">Bitcoin (BTC)</span>
                    <span className="md:hidden inline-flex items-center font-heading">BTC</span>
                </div>
                <div className="col-span-4 md:col-span-5 font-bold text-red-500 text-center text-xs tracking-wider flex items-center justify-center gap-2">
                    <InstitutionalB21Logo size={24} variant="v1" theme="obsidian" />
                    <span className="hidden md:inline-flex items-center gap-1 font-heading">Block 21 (B21)</span>
                    <span className="md:hidden inline-flex items-center font-heading">B21</span>
                </div>
            </div>

            <div className="divide-y divide-white/5 relative z-0">
                {comparisonData.map((row, index) => (
                    <div key={index} className="grid grid-cols-12 p-4 hover:bg-white/5 transition-colors items-center group">
                        <div className="col-span-4 md:col-span-3 font-medium text-white/80 group-hover:text-white transition-colors text-xs md:text-sm pr-2">{row.category}</div>
                        <div className="col-span-4 md:col-span-4 text-center text-gray-500 group-hover:text-gray-400 transition-colors text-xs md:text-sm px-1 border-l border-white/5">{row.btc}</div>
                        <div className="col-span-4 md:col-span-5 text-center text-white font-bold text-xs md:text-sm px-1 border-l border-white/5 group-hover:text-red-500 transition-colors">{row.b21}</div>
                    </div>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* HALVING LOGIC */}
            <div className="glass-card rounded-2xl p-8 relative overflow-hidden group hover:border-red-500/30 transition-all duration-500">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <Brain className="w-32 h-32 text-red-500 rotate-12 transform group-hover:scale-110 transition-transform duration-500" />
                </div>
                
                <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3 relative z-10">
                    <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                        <Brain className="w-6 h-6" />
                    </div>
                    Halving Logic
                </h3>
                
                <div className="space-y-8 relative z-10">
                    <div className="glass-panel rounded-xl p-5 border border-white/5 hover:border-orange-500/30 transition-colors">
                        <h4 className="text-orange-500 font-bold mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-500" /> Bitcoin
                        </h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="text-orange-500/50">•</span> Bitcoin reduces new supply issuance
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-orange-500/50">•</span> Every ~4 years: Block reward halves
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-orange-500/50">•</span> Supply inflation decreases
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-orange-500/50">•</span> <span className="text-white font-medium">Purpose:</span> enforce long-term scarcity
                            </li>
                        </ul>
                    </div>

                    <div className="glass-panel rounded-xl p-5 border border-gold-500/20 hover:border-gold-500/50 transition-colors shadow-[0_0_20px_rgba(255,215,0,0.05)]">
                        <h4 className="text-gold-500 font-bold mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gold-500 shadow-[0_0_10px_rgba(255,215,0,0.5)]" /> Block21
                        </h4>
                        <ul className="space-y-2 text-gray-300 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="text-gold-500/50">•</span> Block21 has <span className="text-white font-bold">no inflation</span> to reduce
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-gold-500/50">•</span> Instead, it reduces <span className="text-white font-bold">sell-side friction</span>
                            </li>
                            <li className="pt-2 pb-1 font-bold text-white text-xs uppercase tracking-widest opacity-80">Fee reduction schedule:</li>
                            <li className="flex items-start gap-2 pl-2 border-l-2 border-gold-500/30">
                                <div>
                                    <span className="block text-white font-bold">Year 1: 2.00% → 1.00% (50%)</span>
                                    <span className="block text-xs text-gray-500 mt-1">Next phases: Reduced further every ~2 years</span>
                                    <span className="block text-xs text-gray-500">Long-term: Every ~4 years, ~50% reduction</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-2 pt-1">
                                <span className="text-gold-500/50">•</span> <span className="text-white font-medium">Final state:</span> 0.17% minimum fee, fixed forever
                            </li>
                        </ul>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-r from-black/40 via-gold-500/5 to-black/40 rounded-xl border border-white/5 backdrop-blur-sm">
                        <p className="text-lg font-bold text-white">
                            <span className="text-orange-500">Bitcoin</span> halves issuance. <br />
                            <span className="text-gradient-gold">Block21</span> halves friction.
                        </p>
                    </div>
                </div>
            </div>

            {/* LAUNCH PRICE */}
            <div className="glass-card rounded-2xl p-8 relative overflow-hidden group hover:border-gold-500/30 transition-all duration-500">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <TrendingDown className="w-32 h-32 text-green-500 rotate-12 transform group-hover:scale-110 transition-transform duration-500" />
                </div>

                <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3 relative z-10">
                    <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                        <TrendingDown className="w-6 h-6" />
                    </div>
                    Launch Price
                </h3>
                
                <div className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between p-5 glass-panel rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                        <span className="text-gray-400 font-medium">Bitcoin launched at</span>
                        <span className="text-2xl font-black text-white">$0</span>
                    </div>

                    <div className="flex items-center justify-between p-5 glass-panel rounded-xl border border-red-500/20 hover:border-red-500/40 transition-colors shadow-[0_0_15px_rgba(255,0,51,0.05)]">
                        <span className="text-gray-300 font-medium">Block21 launched at</span>
                        <span className="text-2xl font-black text-red-500">$0</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {['No official price', 'No valuation', 'No sale price', 'Very low initial liquidity (dev)', 'No guarantee of price'].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-200/80 hover:bg-red-500/10 transition-colors">
                                <X className="w-4 h-4 text-red-500" />
                                {item}
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-gradient-to-br from-red-500/10 to-transparent rounded-xl border border-red-500/10 backdrop-blur-sm">
                        <p className="text-gray-300 leading-relaxed italic text-center font-medium">
                            "Initial liquidity was intentionally small, allowing organic market discovery instead of artificial pricing."
                        </p>
                    </div>
                </div>
            </div>



        </div>

      </div>
    </div>
  );
}
