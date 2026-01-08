"use client";

import Link from "next/link";
import { ShieldCheck, Lock, FileText, BarChart2, ArrowRight, Info, Eye, BookOpen, BarChart3, TrendingDown, CheckCircle } from "lucide-react";

export default function UnifiedTrustSection() {
  const bitcoinFeatures = [
    {
      icon: Eye,
      title: "Complete Transparency",
      description: "Every wallet address, every allocation, every transaction is public and verifiable on-chain. No hidden reserves, no team dumps.",
      link: "/verify",
      linkText: "Verify Contract",
      color: "text-brand-gold"
    },
    {
      icon: BookOpen,
      title: "Educational Resources",
      description: "Learn blockchain fundamentals, understand tokenomics, and make informed decisions. Education over speculation.",
      link: "/learn",
      linkText: "Learn More",
      color: "text-brand-white"
    },
    {
      icon: BarChart3,
      title: "Real-Time Market Data",
      description: "Live pricing, trading volume, and market metrics integrated from CoinGecko and DexScreener. Always stay informed.",
      link: "/market",
      linkText: "View Markets",
      color: "text-brand-gray"
    }
  ];

  const trustItems = [
    {
      icon: ShieldCheck,
      title: "Verified Smart Contract",
      desc: "Contract source code publicly verified on Polygonscan with full audit trail",
      link: "/verify",
      linkText: "View Contract",
      color: "text-brand-gold"
    },
    {
      icon: Lock,
      title: "Locked Liquidity",
      desc: "LP tokens locked for 2 years with proof of lock transaction on-chain",
      link: "/verify",
      linkText: "Verify Lock",
      color: "text-brand-gold"
    },
    {
      icon: FileText,
      title: "Public Wallets",
      desc: "All project wallets publicly disclosed with real-time balance tracking",
      link: "/transparency",
      linkText: "Track Wallets",
      color: "text-brand-gold"
    },
    {
      icon: BarChart2,
      title: "Real-Time Data",
      desc: "Live market data from CoinGecko and DexScreener with no manipulation",
      link: "/market",
      linkText: "View Markets",
      color: "text-brand-gold"
    }
  ];

  return (
    <section className="relative z-10 py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Heading */}
        <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white tracking-wide">
                Start your journey <span className="text-brand-gold">with complete transparency</span>
            </h2>
        </div>

        {/* Block: Why This Matters & Value Education (Moved from ValueEducationSection) */}
        <div className="flex flex-col items-center gap-12 lg:gap-16 mb-32">
        
          {/* Why This Matters & USD vs Time Table */}
          <div className="grid lg:grid-cols-2 gap-8 w-full">
            {/* Why This Matters */}
            <div className="glass-card p-8 rounded-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingDown className="w-24 h-24 text-red-500" />
                </div>
                <h3 className="text-xl font-heading font-bold text-white mb-6 flex items-center gap-3">
                    <span className="text-brand-gold">🔹</span> WHY THIS MATTERS
                </h3>
                <div className="space-y-6">
                    <p className="text-brand-gray">Over time:</p>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3 text-brand-white">
                            <div className="w-1.5 h-1.5 rounded-sm bg-red-500" />
                            More money is created
                        </li>
                        <li className="flex items-center gap-3 text-brand-white">
                            <div className="w-1.5 h-1.5 rounded-sm bg-red-500" />
                            Prices rise
                        </li>
                        <li className="flex items-center gap-3 text-brand-white">
                            <div className="w-1.5 h-1.5 rounded-sm bg-red-500" />
                            Savings lose power
                        </li>
                    </ul>
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-sm mt-6">
                        <p className="text-red-400 font-bold mb-2">This is called inflation.</p>
                        <p className="text-sm text-brand-gray">You don’t notice it daily, but you pay for it forever.</p>
                    </div>
                </div>
            </div>

            {/* USD vs TIME Table */}
            <div className="glass-card p-8 rounded-sm">
                <h3 className="text-xl font-heading font-bold text-white mb-6 flex items-center gap-3">
                    <span className="text-brand-gold">🔹</span> USD vs TIME
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="py-3 text-brand-gray font-mono text-xs uppercase tracking-wider">Metric</th>
                                <th className="py-3 text-brand-gray font-mono text-xs uppercase tracking-wider">Then (2009)</th>
                                <th className="py-3 text-brand-gold font-mono text-xs uppercase tracking-wider">Now (2025)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <tr>
                                <td className="py-3 text-gray-300 font-medium">$1 face value</td>
                                <td className="py-3 text-brand-gray">$1</td>
                                <td className="py-3 text-white font-bold">$1</td>
                            </tr>
                            <tr>
                                <td className="py-3 text-gray-300 font-medium">Buying power</td>
                                <td className="py-3 text-green-400">High</td>
                                <td className="py-3 text-red-400">Lower</td>
                            </tr>
                            <tr>
                                <td className="py-3 text-gray-300 font-medium">Money supply</td>
                                <td className="py-3 text-green-400">Smaller</td>
                                <td className="py-3 text-red-400">Much larger</td>
                            </tr>
                            <tr>
                                <td className="py-3 text-gray-300 font-medium">Long-term result</td>
                                <td className="py-3 text-green-400">Value kept</td>
                                <td className="py-3 text-red-400">Value lost</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="mt-6 text-sm text-center text-brand-gray italic">
                    "$1 today buys much less than it did before."
                </p>
            </div>
          </div>

          {/* Stablecoins vs B21 */}
          <div className="grid lg:grid-cols-2 gap-8 w-full">
            {/* Why Stablecoins are not enough */}
            <div className="glass-card p-8 rounded-sm border-l-4 border-l-brand-gray">
                <h3 className="text-xl font-heading font-bold text-white mb-6 flex items-center gap-3">
                    <span className="text-brand-gold">🔹</span> WHY STABLECOINS ARE NOT ENOUGH
                </h3>
                <p className="text-brand-gray mb-4">Stablecoins:</p>
                <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-3 text-brand-gray">
                        <ArrowRight className="w-4 h-4 text-brand-gray" /> Stay near $1
                    </li>
                    <li className="flex items-center gap-3 text-brand-gray">
                        <ArrowRight className="w-4 h-4 text-brand-gray" /> Don't grow
                    </li>
                    <li className="flex items-center gap-3 text-brand-gray">
                        <ArrowRight className="w-4 h-4 text-brand-gray" /> Lose buying power
                    </li>
                </ul>
                <div className="border-t border-white/10 pt-4">
                    <p className="text-brand-gray text-sm italic">
                        "Safe from volatility, but guaranteed to lose value over time."
                    </p>
                </div>
            </div>

            {/* Why B21 Exists */}
            <div className="glass-card p-8 rounded-sm border-l-4 border-l-brand-gold bg-brand-gold/5">
                <h3 className="text-xl font-heading font-bold text-white mb-6 flex items-center gap-3">
                    <span className="text-brand-gold">🔹</span> WHY B21 EXISTS
                </h3>
                <p className="text-brand-gray mb-4">B21 is designed to:</p>
                <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-3 text-white">
                        <CheckCircle className="w-4 h-4 text-brand-gold" /> Avoid uncontrolled supply
                    </li>
                    <li className="flex items-center gap-3 text-white">
                        <CheckCircle className="w-4 h-4 text-brand-gold" /> Reward long-term holding
                    </li>
                    <li className="flex items-center gap-3 text-white">
                        <CheckCircle className="w-4 h-4 text-brand-gold" /> Let value grow naturally
                    </li>
                    <li className="flex items-center gap-3 text-white">
                        <CheckCircle className="w-4 h-4 text-brand-gold" /> Respect time and effort
                    </li>
                </ul>
                <div className="border-t border-white/10 pt-4 flex flex-col gap-1">
                    <p className="text-brand-gray">B21 is not pegged.</p>
                    <p className="text-brand-gold font-bold text-lg">B21 is discovered.</p>
                </div>
            </div>
          </div>

          {/* Bottom Statement & CTA */}
          <div className="text-center max-w-3xl mx-auto mt-8">
            <Link 
                href="/usd-value-check" 
                className="inline-flex items-center gap-3 px-8 py-4 bg-brand-navy border border-brand-gold/30 hover:bg-brand-gold/10 text-brand-gold font-bold text-lg rounded-sm transition-all shadow-none hover:shadow-lg font-heading"
            >
                <ArrowRight className="w-5 h-5" />
                Read: USD Value Over Time — A Reality Check
            </Link>
          </div>
        </div>

        {/* Block 1: Built on Bitcoin Principles */}
        <div className="mb-32">
            <div className="text-center mb-16">
                <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">
                  Built on <span className="text-white border-b-4 border-brand-gold">Bitcoin Principles</span>
                </h3>
                <p className="text-brand-gray max-w-2xl mx-auto font-sans">
                  Decentralization, transparency, and user empowerment in the modern Polygon ecosystem
                </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {bitcoinFeatures.map((feature, index) => (
                  <div 
                    key={index}
                    className="glass-card group p-8 rounded-sm hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:shadow-brand-gold/5"
                  >
                    <div className={`w-12 h-12 rounded-sm bg-brand-navy flex items-center justify-center mb-6 group-hover:bg-brand-navy/80 transition-colors border border-white/5`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    
                    <h3 className="text-xl font-heading font-bold text-white mb-3 group-hover:text-brand-gold transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-brand-gray text-sm leading-relaxed mb-6 min-h-[80px]">
                      {feature.description}
                    </p>

                    <Link 
                      href={feature.link}
                      className={`text-sm font-bold flex items-center gap-2 ${feature.color} opacity-80 group-hover:opacity-100 transition-opacity uppercase tracking-wider`}
                    >
                      {feature.linkText} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                ))}
            </div>
        </div>

        {/* Block 2: Verify Everything */}
        <div>
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-brand-navy/50 border border-brand-gold/20 rounded-sm px-3 py-1 mb-6 backdrop-blur-sm">
                    <ShieldCheck className="w-3 h-3 text-brand-gold" />
                    <span className="text-xs font-bold text-brand-gold uppercase tracking-wider">Trust Through Transparency</span>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-heading font-black text-white mb-4">
                    Verify Everything
                </h3>
                <p className="text-brand-gray max-w-2xl mx-auto">
                    Don't trust. Verify. Every claim we make is backed by on-chain proof and public documentation.
                </p>
            </div>

            {/* Trust Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {trustItems.map((item, i) => (
                    <div key={i} className="glass-card p-8 rounded-sm hover:border-brand-gold/30 transition-colors group">
                        <item.icon className={`w-8 h-8 ${item.color} mb-6`} />
                        <h3 className="text-xl font-heading font-bold text-white mb-3">{item.title}</h3>
                        <p className="text-brand-gray text-sm mb-6 leading-relaxed">{item.desc}</p>
                        <Link href={item.link} className={`flex items-center gap-2 text-sm font-bold ${item.color} group-hover:underline font-heading`}>
                            {item.linkText} <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ))}
            </div>

            {/* Bottom Banner */}
            <div className="glass-panel p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md rounded-sm">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-sm bg-brand-navy flex items-center justify-center flex-shrink-0 border border-white/5">
                        <Info className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                        <h4 className="font-heading font-bold text-white mb-1">No Hidden Surprises</h4>
                        <p className="text-sm text-brand-gray">Every wallet, every allocation, every transaction is public. We believe in radical transparency.</p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </section>
  );
}
