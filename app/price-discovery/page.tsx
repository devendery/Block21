import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  TrendingUp, 
  History, 
  Scale, 
  Coins, 
  ArrowRight, 
  Info, 
  AlertTriangle,
  CheckCircle2,
  IndianRupee,
  X,
  Eye
} from 'lucide-react';
import LivePriceDisplay from './LivePriceDisplay';

export const metadata: Metadata = {
  title: 'Price Discovery - Block21',
  description: 'Understanding the economic logic behind Block21 (B21) starting price based on Bitcoin historical data and inflation adjustment.',
};

export default function PriceDiscoveryPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-bold uppercase tracking-wider mb-4">
            <Scale className="w-4 h-4" />
            <span>Economic Reference</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-black mb-6 tracking-tight leading-tight text-white">
            How Price Discovery <span className="text-red-500">Really Works</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Reference Asset: <span className="text-orange-500 font-bold">Bitcoin</span>
          </p>
        </div>

        {/* Bitcoin Today Context */}
        <LivePriceDisplay />

        {/* 1. At Launch (2009): Bitcoin Had No Price */}
        <div className="glass-panel p-4 md:p-10 border-red-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <History size={180} />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-orange-500/20 text-orange-500 text-base md:text-lg font-black shrink-0">1</span>
                At Launch (2009): Bitcoin Had No Price
            </h2>
            
            <div className="space-y-6">
                <p className="text-gray-300 text-lg">
                    When Bitcoin launched in 2009, it had no market price.
                </p>
                
                <div className="grid md:grid-cols-2 gap-8 mb-6">
                    <div>
                        <ul className="space-y-3">
                            {[
                                "No exchanges existed",
                                "No trading markets existed",
                                "No fiat value was assigned",
                                "Coins were mined freely as a technical experiment"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="text-gray-400 mt-4 text-sm italic border-l-2 border-orange-500 pl-4 py-2 bg-orange-500/5">
                            Early participants were testing software, not investing money. <br/>
                            <span className="text-white font-bold">Bitcoin began with no price, not a low price.</span>
                        </p>
                    </div>
                    
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <h3 className="font-heading font-bold text-orange-400 mb-4 flex items-center gap-2">
                            <History className="w-5 h-5" />
                            First Assignable Price (Oct 5, 2009)
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">
                            The first recorded exchange rate came from an experimental calculation:
                        </p>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                                <span className="text-gray-400">Rate</span>
                                <span className="text-white font-bold">1 USD ≈ 1,309 BTC</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg border border-orange-500/20">
                                <span className="text-gray-400">Implied Value</span>
                                <span className="text-orange-500 font-bold">~$0.00076 per BTC</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3 italic">
                            This was not a mature market price — it was a reference calculation, created before liquidity or demand.
                        </p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="font-heading font-bold text-white mb-4 flex items-center gap-2">
                        <Coins className="w-5 h-5 text-red-500" />
                        First Real-World Transaction (Pizza Day — May 22, 2010)
                    </h3>
                    <p className="text-gray-400 mb-4 text-sm">Bitcoin’s first real economic valuation occurred when it was used to buy goods:</p>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-black/20 p-4 rounded-lg">
                            <div className="text-gray-400 text-xs uppercase mb-1">BTC Spent</div>
                            <div className="text-xl font-bold text-white">10,000 BTC</div>
                        </div>
                        <div className="bg-black/20 p-4 rounded-lg">
                            <div className="text-gray-400 text-xs uppercase mb-1">Purchase</div>
                            <div className="text-xl font-bold text-white">2 Pizzas</div>
                        </div>
                        <div className="bg-black/20 p-4 rounded-lg border border-red-500/20">
                            <div className="text-gray-400 text-xs uppercase mb-1">Implied Value</div>
                            <div className="text-xl font-bold text-red-500">~$0.0041 per BTC</div>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-300 bg-white/5 p-3 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span>This marked Bitcoin’s transition from: <span className="text-white font-bold">theoretical reference → utility-based value</span></span>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="font-heading font-bold text-white mb-4">Summary: Bitcoin’s Earliest Price Range</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap md:whitespace-normal">
                            <thead className="text-gray-500 border-b border-white/10">
                                <tr>
                                    <th className="pb-3 font-medium px-4">Period</th>
                                    <th className="pb-3 font-medium px-4">BTC Price (USD)</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-300">
                                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-4 font-medium text-white">Late 2009</td>
                                    <td className="py-4 px-4">~$0.00076</td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-4 font-medium text-white">Early–Mid 2010</td>
                                    <td className="py-4 px-4">~$0.001 – $0.004</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-center text-gray-400 mt-4 italic font-medium">
                        Bitcoin’s earliest value was fractions of a cent, discovered gradually, not declared.
                    </p>
                </div>
            </div>
        </div>

        {/* 2. Why Direct Comparisons Require Context */}
        <div className="glass-panel p-4 md:p-10 border-red-500/20">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-500/20 text-red-500 text-base md:text-lg font-black shrink-0">2</span>
                Why Direct Comparisons Require Context
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                    <p className="text-gray-300 text-lg">
                        Bitcoin’s early prices existed in a <span className="text-white font-bold">zero-infrastructure environment</span>:
                    </p>
                    <ul className="space-y-3">
                        {["No exchanges", "No user-friendly wallets", "No regulation", "No liquidity", "Pure experimentation"].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-gray-400">
                                <X className="w-4 h-4 text-red-500" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="text-gray-400 italic mt-2">
                        Those prices reflected testing, not adoption or demand.
                    </p>
                </div>

                <div className="bg-red-500/10 p-6 rounded-xl border border-red-500/20">
                    <h3 className="font-heading font-bold text-red-300 mb-4 flex items-center gap-2">
                        <Scale className="w-5 h-5" />
                        Inflation-Adjusted Context (Not a Prediction)
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                        When adjusted for USD inflation, currency devaluation, and growth of the digital economy:
                    </p>
                    <div className="text-center py-4 bg-black/20 rounded-lg border border-red-500/30 mb-4">
                        <div className="text-gray-400 text-sm mb-1">Bitcoin’s earliest experimental value roughly maps to:</div>
                        <div className="text-2xl md:text-3xl font-heading font-black text-white">~$0.005 – $0.008</div>
                        <div className="text-xs text-gray-500 mt-1">in today’s terms</div>
                    </div>
                    <p className="text-xs text-gray-400 text-center italic">
                        This range is contextual, not a price target.
                    </p>
                </div>
            </div>
        </div>

        {/* 3. How This Relates to Block21 (B21) */}
        <div className="glass-panel p-6 md:p-10 border-red-500/20 bg-gradient-to-b from-black/40 to-red-500/5">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-8 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/20 text-red-500 text-lg font-black shrink-0">3</span>
                How This Relates to Block21 (B21)
            </h2>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-10">
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="p-3 text-gray-400 font-medium">Factor</th>
                                    <th className="p-3 text-gray-400 font-medium">Bitcoin (2009-10)</th>
                                    <th className="p-3 text-red-500 font-bold">Block21 (Today)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <tr>
                                    <td className="p-3 text-gray-400">Market stage</td>
                                    <td className="p-3 text-white">Experimental</td>
                                    <td className="p-3 text-white">Established</td>
                                </tr>
                                <tr>
                                    <td className="p-3 text-gray-400">Exchanges</td>
                                    <td className="p-3 text-white">None</td>
                                    <td className="p-3 text-white">Multiple</td>
                                </tr>
                                <tr>
                                    <td className="p-3 text-gray-400">Liquidity</td>
                                    <td className="p-3 text-white">None</td>
                                    <td className="p-3 text-white">Limited but real</td>
                                </tr>
                                <tr>
                                    <td className="p-3 text-gray-400">Price discovery</td>
                                    <td className="p-3 text-white">Pure experiment</td>
                                    <td className="p-3 text-white">Transparent reference</td>
                                </tr>
                                <tr>
                                    <td className="p-3 text-gray-400">Supply clarity</td>
                                    <td className="p-3 text-white">Gradual</td>
                                    <td className="p-3 text-white">Fixed from day one</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full opacity-20 animate-pulse" />
                    <div className="relative glass-card p-8 border-red-500/30 text-center space-y-4">
                        <div className="text-gray-400 uppercase tracking-widest text-sm font-bold">Starting Reference Price</div>
                        <div className="text-5xl md:text-6xl font-heading font-black text-red-500">
                            $0.006
                        </div>
                        <div className="text-sm text-gray-500">per B21</div>
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-gray-300 font-medium mt-4 text-left space-y-2">
                            <p className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                <span>Placed within Bitcoin’s inflation-adjusted early value range</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                <span>Chosen for clarity and transparency, not prediction</span>
                            </p>
                        </div>
                        <p className="text-xs text-gray-500 italic">This is a starting reference, not a promise.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* 4. Supply Comparison */}
        <div className="glass-panel p-6 md:p-10 border-white/10">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white text-lg font-black shrink-0">4</span>
                Supply Comparison (Key Structural Difference)
            </h2>

            <div className="overflow-x-auto mb-6">
                <table className="w-full text-left border-separate border-spacing-0 rounded-xl overflow-hidden">
                    <thead>
                        <tr className="bg-white/5">
                            <th className="p-4 text-gray-400 font-medium border-b border-white/10">Asset</th>
                            <th className="p-4 text-gray-400 font-medium border-b border-white/10">Total Supply</th>
                        </tr>
                    </thead>
                    <tbody className="text-lg">
                        <tr className="bg-white/5">
                            <td className="p-4 border-b border-white/5 font-bold text-orange-400">Bitcoin</td>
                            <td className="p-4 border-b border-white/5 text-white">21,000,000 BTC</td>
                        </tr>
                        <tr className="bg-red-500/10">
                            <td className="p-4 font-bold text-red-500">Block21 (B21)</td>
                            <td className="p-4 font-bold text-white">2,100,000 B21</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="space-y-3">
                <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                    <p className="text-gray-300">Block21 has <span className="text-white font-bold">10× lower total supply</span> than Bitcoin</p>
                </div>
                <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                    <p className="text-gray-300">Scarcity is structural, but <span className="text-white font-bold">value must still be earned by the market</span></p>
                </div>
            </div>
        </div>

        {/* 5. Final Alignment Summary */}
        <div className="glass-panel p-4 md:p-10 border-white/10">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white text-lg font-black shrink-0">5</span>
                Final Alignment Summary
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="p-4 text-gray-400 font-medium">Metric</th>
                            <th className="p-4 text-gray-400 font-medium">Bitcoin (Early Era)</th>
                            <th className="p-4 text-red-500 font-bold">Block21 (Launch)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        <tr>
                            <td className="p-4 text-gray-400">Value Origin</td>
                            <td className="p-4 text-white">Zero (then accidental)</td>
                            <td className="p-4 text-white">Calculated Reference</td>
                        </tr>
                        <tr>
                            <td className="p-4 text-gray-400">Starting Price</td>
                            <td className="p-4 text-white">None (then &lt; $0.01)</td>
                            <td className="p-4 text-white">$0.006 (Fixed)</td>
                        </tr>
                        <tr>
                            <td className="p-4 text-gray-400">Goal</td>
                            <td className="p-4 text-white">Tech Experiment</td>
                            <td className="p-4 text-white">Value Preservation</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-8 text-center">
                 <div className="inline-flex items-center gap-2 text-red-200 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-red-500" />
                    <span>Price Discovery is not magic — it is the market finding truth.</span>
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
}
