import type { Metadata } from 'next';
import { 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  XCircle, 
  CheckCircle2, 
  Landmark, 
  Scale,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'USD Value Over Time — A Reality Check',
  description: 'Understanding how inflation erodes purchasing power and why B21 is designed to preserve value over time.',
};

export default function UsdValueCheckPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-bold uppercase tracking-wider mb-4">
            <AlertTriangle className="w-4 h-4" />
            <span>Economic Reality</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-black mb-6 tracking-tight leading-tight text-white">
            USD Value Over Time — <span className="text-red-500">A Reality Check</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            <span className="text-white font-bold">$1 Is Not Always the Same $1</span>. Although the numerical value of USD remains $1, its real purchasing power declines over time due to inflation.
          </p>
        </div>

        {/* 1. USD: 2009 vs Today (2025) */}
        <div className="glass-panel p-4 md:p-10 border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <DollarSign size={180} />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-8 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500/20 text-blue-500 text-base md:text-lg font-black shrink-0">1</span>
            USD: 2009 vs Today (2025)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap md:whitespace-normal">
              <thead className="text-gray-500 border-b border-white/10 bg-white/5">
                <tr>
                  <th className="p-4 font-medium">Metric</th>
                  <th className="p-4 font-medium">2009 USD</th>
                  <th className="p-4 font-medium">2025 USD (Now)</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-white">Face Value</td>
                  <td className="p-4">$1.00</td>
                  <td className="p-4">$1.00</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-white">Purchasing Power</td>
                  <td className="p-4 text-green-400">High</td>
                  <td className="p-4 text-red-400">Significantly Lower</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-white">Inflation Effect</td>
                  <td className="p-4 text-green-400">Minimal</td>
                  <td className="p-4 text-red-400">Severe (15+ years)</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-white">Real Value (2009 terms)</td>
                  <td className="p-4 text-green-400">$1.00</td>
                  <td className="p-4 text-red-400 font-bold">~$0.55–$0.65</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-white">Money Supply</td>
                  <td className="p-4">Limited growth</td>
                  <td className="p-4 text-red-400">Massive expansion</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-white">Scarcity</td>
                  <td className="p-4 text-green-400">Relatively higher</td>
                  <td className="p-4 text-red-400">Much lower</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-white">Long-term holding result</td>
                  <td className="p-4 text-green-400">Preserved value</td>
                  <td className="p-4 text-red-400">Value erosion</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 bg-red-500/10 border border-red-500/20 p-6 rounded-xl text-center">
            <h3 className="text-red-400 font-bold text-lg mb-2">Conclusion</h3>
            <p className="text-2xl md:text-3xl font-heading font-black text-white">
              $1 today buys <span className="text-red-500">35–45% less</span> than it did in 2009.
            </p>
          </div>
        </div>

        {/* 2. Inflation Explained */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass-panel p-6 md:p-8 border-white/10">
            <h2 className="text-xl md:text-2xl font-heading font-bold text-white mb-6 flex items-center gap-2">
              <TrendingDown className="text-red-500" />
              Inflation Explained (Simple)
            </h2>
            <div className="space-y-6 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-white/10">
              {[
                { title: "Governments can print more USD", desc: "Central banks increase money supply" },
                { title: "Printing increases supply", desc: "More dollars chasing same goods" },
                { title: "Increased supply reduces purchasing power", desc: "Each dollar buys less" },
                { title: "This creates silent dilution of savings", desc: "Your stored work loses value" }
              ].map((step, i) => (
                <div key={i} className="relative flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 z-10 text-white font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{step.title}</h4>
                    <p className="text-gray-400 text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-white/5 p-4 rounded-lg border border-white/10">
              <p className="text-gray-300 italic text-center">
                "Inflation is not visible daily — but devastating over decades."
              </p>
            </div>
          </div>

          <div className="glass-panel p-6 md:p-8 border-gold-500/20">
            <h2 className="text-xl md:text-2xl font-heading font-bold text-white mb-6 flex items-center gap-2">
              <Scale className="text-gold-500" />
              USD vs Bitcoin (Why History Matters)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-gray-500 border-b border-white/10">
                  <tr>
                    <th className="pb-3 font-medium">Feature</th>
                    <th className="pb-3 font-medium">USD</th>
                    <th className="pb-3 font-medium text-gold-500">Bitcoin</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-white/5">
                    <td className="py-3 font-medium text-white">Launch</td>
                    <td className="py-3">Old system</td>
                    <td className="py-3 text-gold-500">2009</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 font-medium text-white">Supply</td>
                    <td className="py-3 text-red-400">Unlimited</td>
                    <td className="py-3 text-green-400">Fixed (21M)</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 font-medium text-white">Inflation</td>
                    <td className="py-3 text-red-400">Guaranteed</td>
                    <td className="py-3 text-green-400">Reduced over time</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 font-medium text-white">Long-term value</td>
                    <td className="py-3 text-red-400">Declining</td>
                    <td className="py-3 text-green-400">Increasing</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-white">Control</td>
                    <td className="py-3">Central banks</td>
                    <td className="py-3 text-gold-500">Decentralized</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 p-4 bg-gold-500/10 border border-gold-500/20 rounded-lg">
              <h4 className="text-gold-500 font-bold mb-2 text-sm uppercase">Key Insight</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-gray-300">USD is stable in number, <span className="text-red-400">unstable in value</span>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-gray-300">Bitcoin is volatile in number, <span className="text-green-400">stable in scarcity</span>.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3. Why Stablecoins Don't Solve This */}
        <div className="glass-panel p-4 md:p-10 border-white/10">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-8 flex items-center gap-3">
            <XCircle className="text-red-500 w-8 h-8" />
            Why Stablecoins Don't Solve This
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
            <div className="space-y-4">
              <p className="text-gray-300 text-lg">
                Stablecoins like USDT are useful for trading, but they are <span className="text-white font-bold">pegged to USD</span>. This means they inherit USD's inflation problem.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>Are pegged to USD 1:1</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>Inherit USD inflation completely</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>Preserve price ($1), not value (purchasing power)</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
              <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-gray-400">
                  <tr>
                    <th className="p-4">Asset</th>
                    <th className="p-4">Price Stability</th>
                    <th className="p-4">Value Preservation</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300 divide-y divide-white/5">
                  <tr>
                    <td className="p-4 font-bold text-white">USD</td>
                    <td className="p-4"><CheckCircle2 className="w-5 h-5 text-green-500" /></td>
                    <td className="p-4"><XCircle className="w-5 h-5 text-red-500" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white">USDT</td>
                    <td className="p-4"><CheckCircle2 className="w-5 h-5 text-green-500" /></td>
                    <td className="p-4"><XCircle className="w-5 h-5 text-red-500" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-gold-500">Bitcoin</td>
                    <td className="p-4"><XCircle className="w-5 h-5 text-red-500" /><span className="text-xs text-gray-500 ml-1">(short-term)</span></td>
                    <td className="p-4"><CheckCircle2 className="w-5 h-5 text-green-500" /><span className="text-xs text-gray-500 ml-1">(long-term)</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-xl">
            <h3 className="font-heading font-bold text-red-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              The Core Problem
            </h3>
            <p className="text-gray-300 mb-4">Holding USD or Stablecoins long-term means:</p>
            <div className="grid md:grid-cols-3 gap-4">
              {["Guaranteed loss of purchasing power", "No protection against monetary expansion", "No scarcity mechanism"].map((item, i) => (
                <div key={i} className="bg-black/20 p-4 rounded-lg flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <span className="text-gray-200 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Why B21 Exists */}
        <div className="glass-panel p-4 md:p-10 border-gold-500/30 bg-gradient-to-br from-black/60 to-gold-900/10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-500 text-sm font-bold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-4 h-4" />
              <span>The Solution</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-white mb-4">
              Why B21 Exists
            </h2>
            <p className="text-xl text-gray-400">
              B21 is designed to address time-based value loss.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">B21 Principles</h3>
              {[
                "No fiat peg (Not tied to decaying USD)",
                "No uncontrolled inflation (Fixed supply)",
                "Market-discovered value",
                "Long-term holding incentive"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-gold-500/20 text-gold-500 flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <span className="text-gray-200 font-medium">{item}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col justify-center items-center text-center p-8 bg-gold-500/5 rounded-2xl border border-gold-500/20">
              <div className="mb-6">
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Design Philosophy</p>
                <p className="text-2xl font-bold text-white mb-4">
                  B21 is not designed to <span className="text-red-500 line-through decoration-red-500/50">"stay at $1"</span>
                </p>
                <p className="text-2xl font-bold text-gold-400">
                  B21 is designed to retain and grow value over time
                </p>
              </div>
              <Link href="/ico" className="px-8 py-3 bg-gold-500 hover:bg-gold-600 text-black font-bold rounded-lg transition-colors flex items-center gap-2">
                Join the Movement <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* 5. One-Line Statements */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { text: "$1 in 2009 is not $1 today.", icon: Clock },
            { text: "Price stability is not value stability.", icon: Scale },
            { text: "Inflation is a hidden tax on time.", icon: TrendingDown },
            { text: "Scarcity preserves value. Printing destroys it.", icon: ShieldCheck }
          ].map((item, i) => (
            <div key={i} className="glass-panel p-6 border-white/10 flex flex-col items-center text-center hover:bg-white/5 transition-colors">
              <item.icon className="w-8 h-8 text-gold-500 mb-4" />
              <p className="text-white font-medium font-heading leading-tight">"{item.text}"</p>
            </div>
          ))}
        </div>

        {/* Final Takeaway */}
        <div className="glass-panel p-8 border-white/10 text-center">
          <h2 className="text-2xl font-heading font-bold text-white mb-8">Final Takeaway</h2>
          <div className="grid md:grid-cols-4 gap-6 text-sm">
            <div className="space-y-2">
              <div className="font-bold text-white text-lg">USD</div>
              <ArrowRight className="w-5 h-5 text-gray-500 mx-auto rotate-90 md:rotate-0" />
              <div className="text-gray-400">Stable price, <span className="text-red-400">declining value</span></div>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-white text-lg">Stablecoins</div>
              <ArrowRight className="w-5 h-5 text-gray-500 mx-auto rotate-90 md:rotate-0" />
              <div className="text-gray-400">Digital USD, <span className="text-red-400">same decay</span></div>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-white text-lg">Bitcoin-like</div>
              <ArrowRight className="w-5 h-5 text-gray-500 mx-auto rotate-90 md:rotate-0" />
              <div className="text-gray-400">Volatility short-term, <span className="text-green-400">preservation long-term</span></div>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-gold-500 text-lg">B21</div>
              <ArrowRight className="w-5 h-5 text-gold-500 mx-auto rotate-90 md:rotate-0" />
              <div className="text-gold-200">Built for time, scarcity, and sustainability</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
