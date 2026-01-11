"use client";

import { useEffect, useState } from 'react';
import { ArrowUpRight, TrendingUp, TrendingDown, Activity, DollarSign, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { B21_CONTRACT_ADDRESS } from '@/lib/utils';
import Link from 'next/link';

// Types for API responses
interface CoinData {
  bitcoin: { usd: number; usd_24h_change: number };
  ethereum: { usd: number; usd_24h_change: number };
}

export default function MarketPage() {
  const [prices, setPrices] = useState<CoinData | null>(null);
  const [b21Price, setB21Price] = useState<{ priceUsd: string; priceChange: { h24: number } } | null>(null);
  const [activeChart, setActiveChart] = useState<'BTC' | 'ETH' | 'B21'>('BTC');
  const [pairAddress, setPairAddress] = useState<string | null>(null);

  useEffect(() => {
    // Fetch BTC & ETH prices
    const fetchMajorCoins = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true');
        const data = await res.json();
        setPrices(data);
      } catch (error) {
        console.error("Failed to fetch CoinGecko data", error);
      }
    };

    // Fetch B21 DexScreener
    const fetchB21 = async () => {
        try {
            const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${B21_CONTRACT_ADDRESS}`);
            const data = await res.json();
            
            if (data.pairs && data.pairs.length > 0) {
                const pair = data.pairs[0];
                setB21Price({
                    priceUsd: pair.priceUsd,
                    priceChange: { h24: pair.priceChange?.h24 || 0 }
                });
                setPairAddress(pair.pairAddress);
            } else {
                 // Fallback if no pool found yet
                setB21Price({
                    priceUsd: "0.006", // Fallback/Initial price
                    priceChange: { h24: 0 }
                });
            }
        } catch (error) {
            console.error("Failed to fetch B21 data", error);
             // Fallback on error
             setB21Price({
                priceUsd: "0.006",
                priceChange: { h24: 0 }
            });
        }
    };

    fetchMajorCoins();
    fetchB21();
    
    const interval = setInterval(() => {
        fetchMajorCoins();
        fetchB21();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-foreground pt-24 pb-16 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-20 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-panel px-4 py-1.5 mb-8 hover:bg-white/10 transition-colors cursor-default shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold tracking-wide text-gray-200">Live Market Data</span>
          </div>

          {/* Heading */}
          <div role="heading" aria-level={1} className="text-4xl lg:text-6xl font-black tracking-tight text-white mb-8 leading-tight font-heading">
            <span className="block text-gray-400 text-2xl lg:text-3xl mb-3 font-bold tracking-normal">Real-Time Analytics</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-white to-red-500 drop-shadow-[0_2px_10px_rgba(239,68,68,0.3)]">
              Price Discovery in Progress
            </span>
          </div>

          {/* Subtext */}
          <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            We are actively <span className="text-white font-bold">discovering the price</span> of Block21. Volatility is expected as the market finds equilibrium.
          </p>
        </div>

        {/* Bitcoin Volatility Context */}
        <div className="glass-card rounded-2xl p-8 mb-16 border border-red-500/20 bg-red-900/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="p-4 rounded-full bg-red-500/10 border border-red-500/30">
                    <Activity className="w-8 h-8 text-red-500" />
                </div>
                <div>
                    <h3 className="text-2xl font-heading font-bold text-white mb-2">Historical Context: Bitcoin's Volatility</h3>
                    <p className="text-gray-300 leading-relaxed max-w-4xl">
                        High volatility is a natural part of true price discovery. In 2011, Bitcoin surged from <span className="text-white font-bold">$0.30 to nearly $30.00</span> (a 10,000% increase) before correcting sharply. 
                        Such fluctuations were essential for the market to determine its true value. Block21 is currently in this early discovery phase.
                    </p>
                </div>
            </div>
        </div>

        {/* Price Tickers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* BTC */}
            <div className="glass-card p-6 rounded-xl flex items-center justify-between group hover:bg-white/5 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -z-10 transition-opacity group-hover:opacity-100 opacity-50" />
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <img src="https://assets.coingecko.com/coins/images/1/small/bitcoin.png" alt="BTC" className="w-8 h-8 drop-shadow-md" />
                        <div>
                            <span className="font-heading font-bold text-white block leading-none">Bitcoin</span>
                            <span className="text-xs text-gray-500 font-mono">BTC</span>
                        </div>
                    </div>
                    <div className="text-3xl font-mono text-white font-bold tracking-tight">
                        ${prices?.bitcoin.usd.toLocaleString() ?? "..."}
                    </div>
                </div>
                <div className={`flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-full ${prices && prices.bitcoin.usd_24h_change >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {prices && prices.bitcoin.usd_24h_change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {prices?.bitcoin.usd_24h_change.toFixed(2)}%
                </div>
            </div>

            {/* ETH */}
            <div className="glass-card p-6 rounded-xl flex items-center justify-between group hover:bg-white/5 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10 transition-opacity group-hover:opacity-100 opacity-50" />
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <img src="https://assets.coingecko.com/coins/images/279/small/ethereum.png" alt="ETH" className="w-8 h-8 drop-shadow-md" />
                        <div>
                            <span className="font-heading font-bold text-white block leading-none">Ethereum</span>
                            <span className="text-xs text-gray-500 font-mono">ETH</span>
                        </div>
                    </div>
                    <div className="text-3xl font-mono text-white font-bold tracking-tight">
                        ${prices?.ethereum.usd.toLocaleString('en-US') ?? "..."}
                    </div>
                </div>
                <div className={`flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-full ${prices && prices.ethereum.usd_24h_change >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {prices && prices.ethereum.usd_24h_change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {prices?.ethereum.usd_24h_change.toFixed(2)}%
                </div>
            </div>

            {/* B21 */}
            <div className="glass-card border-red-500/30 p-6 rounded-xl flex items-center justify-between relative overflow-hidden group hover:border-red-500/50 transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.05)]">
                <div className="absolute inset-0 bg-red-500/5 z-0 group-hover:bg-red-500/10 transition-colors duration-500" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/20 rounded-full blur-[50px] animate-pulse" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-sm font-black text-red-500 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]">B</div>
                        <div>
                            <span className="font-bold text-white block leading-none">Block21</span>
                            <span className="text-xs text-red-500 font-mono">B21</span>
                        </div>
                    </div>
                    <div className="text-3xl font-mono text-white font-bold tracking-tight text-gradient-red">
                        ${b21Price?.priceUsd ?? "..."}
                    </div>
                </div>
                <div className="relative z-10 flex flex-col items-end gap-1">
                   {b21Price && (
                     <div className={`flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-full ${b21Price.priceChange.h24 >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                         {b21Price.priceChange.h24 >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                         {b21Price.priceChange.h24.toFixed(2)}%
                     </div>
                   )}
                   <div className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20">
                       <Activity className="w-3 h-3" />
                       Price Discovery
                   </div>
                </div>
            </div>
        </div>

        {/* Chart Section */}
        <div className="mb-12">
            {/* Chart Tabs */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                <button 
                    onClick={() => setActiveChart('BTC')}
                    className={`px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap border ${activeChart === 'BTC' ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'}`}
                >
                    Bitcoin (BTC)
                </button>
                <button 
                    onClick={() => setActiveChart('ETH')}
                    className={`px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap border ${activeChart === 'ETH' ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'}`}
                >
                    Ethereum (ETH)
                </button>
                <button 
                    onClick={() => setActiveChart('B21')}
                    className={`px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap border ${activeChart === 'B21' ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'}`}
                >
                    Block21 (B21)
                </button>
            </div>

            {/* Chart Container */}
            <div className="glass-card rounded-2xl p-1 h-[350px] md:h-[600px] relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 z-0 bg-black/40 backdrop-blur-sm">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                            <Activity className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="font-mono text-sm uppercase tracking-widest">Loading Chart...</p>
                    </div>
                </div>
                
                {/* Active Chart */}
                {activeChart === 'BTC' && (
                    <iframe 
                        src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_btc&symbol=BITSTAMP%3ABTCUSD&interval=D&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=1&toolbarbg=F1F3F6&studies=[]&hideideas=1&theme=Dark&style=1&timezone=Etc%2FUTC&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=BITSTAMP%3ABTCUSD" 
                        className="w-full h-full relative z-10 rounded-xl"
                        frameBorder="0"
                        title="Bitcoin Chart"
                    />
                )}

                {activeChart === 'ETH' && (
                    <iframe 
                        src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_eth&symbol=BITSTAMP%3AETHUSD&interval=D&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=1&toolbarbg=F1F3F6&studies=[]&hideideas=1&theme=Dark&style=1&timezone=Etc%2FUTC&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=BITSTAMP%3AETHUSD" 
                        className="w-full h-full relative z-10 rounded-xl"
                        frameBorder="0"
                        title="Ethereum Chart"
                    />
                )}

                {activeChart === 'B21' && (
                     pairAddress ? (
                        <iframe 
                            src={`https://dexscreener.com/polygon/${pairAddress}?embed=1&theme=dark`}
                            className="w-full h-full relative z-10 rounded-xl"
                            frameBorder="0"
                            title="Block21 Chart"
                        />
                     ) : (
                         <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80 backdrop-blur-md">
                             <div className="text-center p-8 max-w-md">
                                 <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                                     <Activity className="w-10 h-10 text-red-500" />
                                 </div>
                                 <h3 className="text-xl font-bold text-white mb-2">Chart Unavailable</h3>
                                 <p className="text-gray-400 mb-6">
                                     Trading pair not found or liquidity is currently being established.
                                 </p>
                                 <a 
                                     href={`https://polygonscan.com/token/${B21_CONTRACT_ADDRESS}`}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                                 >
                                     View Contract <ArrowUpRight className="w-4 h-4" />
                                 </a>
                             </div>
                         </div>
                     )
                )}
            </div>
        </div>

        <div id="how-to-get-b21" className="glass-card rounded-2xl p-8 mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">How to Get B21</h2>
          <div className="space-y-3 text-gray-300">
            <p>Block21 does not conduct private or preferential sales.</p>
            <p>B21 is available through public decentralized exchanges once liquidity is added.</p>
            <p>All participants access the same market price under the same conditions.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-heading font-bold text-white mb-2">Liquidity Disclosure</h3>
            <p className="text-gray-300 text-sm">
              Initial liquidity is intentionally limited to support fair and organic price discovery. Liquidity will be expanded gradually as adoption and ecosystem usage grow.
            </p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-heading font-bold text-white mb-2">No Guarantees / No Control</h3>
            <p className="text-gray-300 text-sm">
              Block21 does not guarantee price performance or returns. The team does not control market price, trading behavior, or user decisions.
            </p>
          </div>
          <div className="glass-card rounded-2xl p-6 md:col-span-2">
            <h3 className="text-xl font-heading font-bold text-white mb-2">Why This Approach</h3>
            <p className="text-gray-300 text-sm">
              Inspired by Bitcoin’s early philosophy, Block21 prioritizes open access, transparent rules, and market-driven price discovery over private deals or artificial stability.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}