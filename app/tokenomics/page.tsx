import type { Metadata } from 'next';
import Link from 'next/link';
import { PieChart, CircleDollarSign, ArrowLeftRight, Ban } from 'lucide-react';
import TokenomicsInteractive from './components/TokenomicsInteractive';

export const metadata: Metadata = {
  title: 'Tokenomics - Block21',
  description: 'Block21 (B21) Tokenomics. 2.1M Fixed Supply. No Inflation. 2% Sell Fee.',
};

export default function TokenomicsPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass-panel px-4 py-1 mb-6">
            <PieChart className="w-4 h-4 text-gold-500" />
            <span className="text-sm text-gray-300 font-medium">Economic Model</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary animate-gradient-x">
              Tokenomics Structure
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Designed for scarcity and sustainability. No minting function. No burn mechanism. Just a pure, fixed supply of 2,100,000 tokens.
          </p>
        </div>

        {/* Core Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card p-8 text-center hover:border-gold-500/30 transition-colors relative overflow-hidden group">
                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity flex items-center justify-center pointer-events-none">
                     <div className="relative w-40 h-40 preserve-3d animate-float-slow">
                         <div className="absolute inset-0 rounded-full bg-gold-500/20 blur-xl"></div>
                         <div className="absolute inset-0 m-auto w-28 h-28 rounded-full bg-gradient-to-br from-gold-500/50 via-yellow-600/50 to-yellow-900/50 border border-gold-500/30 flex items-center justify-center">
                            <span className="text-2xl font-black text-white/50">2.1M</span>
                         </div>
                         <div className="absolute inset-[-10px] rounded-full border border-gold-500/20 animate-spin-slow border-dashed"></div>
                     </div>
                </div>
                <div className="relative z-10">
                    <div className="text-xs text-gray-500 font-bold tracking-wide mb-2">Total supply</div>
                    <div className="text-4xl font-heading font-black text-white mb-1">2,100,000</div>
                    <div className="text-gold-500 font-medium">B21</div>
                </div>
            </div>
            <div className="glass-card p-8 text-center hover:border-purple-500/30 transition-colors group">
                <div className="text-xs text-gray-500 font-bold tracking-wide mb-2 group-hover:text-purple-400 transition-colors">Network</div>
                <div className="text-4xl font-heading font-black text-white mb-1">Polygon</div>
                <div className="text-purple-400 font-medium">POS Chain</div>
            </div>
            <div className="glass-card p-8 text-center hover:border-blue-500/30 transition-colors group">
                <div className="text-xs text-gray-500 font-bold tracking-wide mb-2 group-hover:text-blue-400 transition-colors">Decimals</div>
                <div className="text-4xl font-heading font-black text-white mb-1">8</div>
                <div className="text-gray-400 font-medium group-hover:text-blue-300">Standard</div>
            </div>
        </div>

        {/* Deep Dive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <Link href="/price-discovery" className="block group h-full">
                <div className="glass-panel p-6 flex flex-col justify-between gap-6 hover:bg-white/5 transition-all border-gold-500/20 hover:border-gold-500/40 relative overflow-hidden h-full">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl -z-10 group-hover:bg-gold-500/10 transition-colors" />
                    
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-500 group-hover:scale-110 transition-transform shrink-0">
                            <CircleDollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-heading font-bold text-white mb-2 group-hover:text-gold-500 transition-colors">
                                Why $0.006 Starting Price?
                            </h3>
                            <p className="text-gray-400 text-sm">
                                Discover the economic logic derived from Bitcoin's history and inflation adjustments.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gold-500 font-bold text-sm bg-gold-500/10 px-4 py-2 rounded-full border border-gold-500/20 group-hover:bg-gold-500/20 transition-colors w-fit">
                        <span>Read Price Logic</span>
                        <ArrowLeftRight className="w-4 h-4" />
                    </div>
                </div>
            </Link>

            <Link href="/release-policy" className="block group h-full">
                <div className="glass-panel p-6 flex flex-col justify-between gap-6 hover:bg-white/5 transition-all border-blue-500/20 hover:border-blue-500/40 relative overflow-hidden h-full">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/10 transition-colors" />
                    
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shrink-0">
                            <PieChart className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-heading font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                Token Release Policy
                            </h3>
                            <p className="text-gray-400 text-sm">
                                Detailed breakdown of the 4-year release schedule, hard caps, and supply philosophy.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-sm bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors w-fit">
                        <span>View Release Policy</span>
                        <ArrowLeftRight className="w-4 h-4" />
                    </div>
                </div>
            </Link>
        </div>

        {/* Tax Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
                <h2 className="text-3xl font-heading font-bold text-white mb-6">Dynamic fee structure</h2>
                <div className="space-y-4">
                    <div className="glass-panel p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ArrowLeftRight className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <div className="font-heading font-bold text-white">Buy & transfer</div>
                                <div className="text-sm text-gray-400">No friction on entry or movement</div>
                            </div>
                        </div>
                        <div className="text-2xl font-heading font-black text-green-500">0%</div>
                    </div>

                    <div className="glass-panel p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <CircleDollarSign className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <div className="font-heading font-bold text-white">Sell tax (dynamic)</div>
                                <div className="text-sm text-gray-400">Decreases over time via contract</div>
                            </div>
                        </div>
                        <div className="text-2xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
                             0.17% - 2%
                        </div>
                    </div>
                </div>

                <div className="mt-8 p-6 glass-panel border-gold-500/20 bg-gold-500/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl -z-10" />
                    <h3 className="font-heading font-bold text-gold-500 mb-2">Halving-style fee reduction</h3>
                    <p className="text-sm text-gray-400 mb-4">
                       Fees are programmed to reduce gradually, similar to Bitcoin halving events, incentivizing long-term holding.
                    </p>
                    <ul className="space-y-3 text-gray-300 text-sm">
                        <li className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span>Year 1 reduction</span>
                            <span className="font-bold text-white">50% Decrease</span>
                        </li>
                        <li className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span>Year 2 reduction</span>
                            <span className="font-bold text-white">Additional 50%</span>
                        </li>
                         <li className="flex items-center justify-between pt-1">
                            <span>Long term trend</span>
                            <span className="font-bold text-white">Gradual decline to 0.17%</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="space-y-6">
                <div className="relative flex justify-center">
                    {/* Scarcity Model Visual */}
                    <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full" />
                        <div className="relative w-[280px] h-[280px] md:w-[400px] md:h-[400px] animate-float-slow flex items-center justify-center preserve-3d">
                             {/* 3D Sphere Construction */}
                             <div className="absolute inset-0 rounded-full bg-gold-500/10 blur-3xl"></div>
                             <div className="absolute inset-0 m-auto w-[80%] h-[80%] rounded-full bg-gradient-to-br from-gold-500 via-yellow-600 to-yellow-900 shadow-[0_0_80px_rgba(212,175,55,0.3)] flex items-center justify-center border border-gold-500/40 overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.9),transparent_60%)]"></div>
                                <div className="flex flex-col items-center justify-center z-10 transform translate-z-10">
                                     <span className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gold-500 drop-shadow-sm tracking-tighter">2.1M</span>
                                     <span className="text-sm md:text-base font-bold text-yellow-900 tracking-[0.2em] mt-2 border-t border-yellow-900/50 pt-2">Fixed Supply</span>
                                </div>
                             </div>
                             <div className="absolute inset-[-20px] rounded-full border border-gold-500/20 animate-spin-slow-reverse border-dashed"></div>
                             <div className="absolute inset-[-40px] rounded-full border border-gold-500/10 animate-spin-slow border-dotted"></div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-8">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <Ban className="w-6 h-6 text-red-500" />
                        Strict Limitations
                    </h2>
                    <p className="text-gray-400 mb-6">
                       The contract is immutable regarding supply. No one can ever mint more B21.
                    </p>
                </div>

                {/* V2 / Roadmap Preview */}
                 <div className="glass-card p-8 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10" />
                    
                    <h2 className="text-2xl font-heading font-bold text-white mb-4">Future Roadmap (V2)</h2>
                    <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                        The B21 ecosystem is evolving. Future versions will introduce advanced DeFi capabilities using the B21 coin as the core utility asset.
                    </p>
                    <div className="flex items-center gap-2 text-blue-400 text-sm font-bold">
                        <span>Coming Soon:</span>
                        <span className="bg-blue-500/10 px-2 py-1 rounded text-xs border border-blue-500/20">DeFi Integration</span>
                        <span className="bg-blue-500/10 px-2 py-1 rounded text-xs border border-blue-500/20">Staking</span>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
