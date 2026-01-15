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
