"use client";

import { useEffect, useState } from 'react';
import { ArrowUpRight, TrendingUp, TrendingDown, Activity, DollarSign, Check } from 'lucide-react';
import { B21_CONTRACT_ADDRESS } from '@/lib/utils';

// Types for API responses
interface CoinData {
  bitcoin: { usd: number; usd_24h_change: number };
  ethereum: { usd: number; usd_24h_change: number };
}

export default function MarketPage() {
  const [prices, setPrices] = useState<CoinData | null>(null);
  const [b21Price, setB21Price] = useState<{ priceUsd: string; priceChange: { h24: number } } | null>(null);

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
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-12">
            <h1 className="text-4xl font-heading font-black text-white mb-2">Market Data</h1>
            <p className="text-gray-400">Real-time price feeds and chart analysis.</p>
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
            <div className="glass-card border-gold-500/30 p-6 rounded-xl flex items-center justify-between relative overflow-hidden group hover:border-gold-500/50 transition-all duration-300 shadow-[0_0_20px_rgba(255,215,0,0.05)]">
                <div className="absolute inset-0 bg-gold-500/5 z-0 group-hover:bg-gold-500/10 transition-colors duration-500" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold-500/20 rounded-full blur-[50px] animate-pulse" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-sm font-black text-gold-500 border border-gold-500/30 shadow-[0_0_10px_rgba(255,215,0,0.2)]">B</div>
                        <div>
                            <span className="font-bold text-white block leading-none">Block21</span>
                            <span className="text-xs text-gold-500 font-mono">B21</span>
                        </div>
                    </div>
                    <div className="text-3xl font-mono text-white font-bold tracking-tight text-gradient-gold">
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
                   <div className="flex items-center gap-1 text-xs font-bold text-gold-500 bg-gold-500/10 px-2 py-1 rounded-lg border border-gold-500/20">
                       <Activity className="w-3 h-3" />
                       Market Launch
                   </div>
                </div>
            </div>
        </div>

        {/* Chart Section */}
        <div className="glass-card rounded-2xl p-1 h-[350px] md:h-[600px] mb-12 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 z-0 bg-black/40 backdrop-blur-sm">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                        <Activity className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="font-mono text-sm uppercase tracking-widest">TradingView Chart Loading...</p>
                </div>
            </div>
            {/* TradingView Widget Embed */}
            <iframe 
                src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_76d87&symbol=BITSTAMP%3ABTCUSD&interval=D&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=1&toolbarbg=F1F3F6&studies=[]&hideideas=1&theme=Dark&style=1&timezone=Etc%2FUTC&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=BITSTAMP%3ABTCUSD" 
                className="w-full h-full relative z-10 rounded-xl"
                frameBorder="0"
            />
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

        <div className="flex justify-center">
             <a 
                href="https://dexscreener.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl transition-all border border-white/10 hover:border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
             >
                View on DexScreener <ArrowUpRight className="w-4 h-4" />
             </a>
        </div>

        <div id="liquidity-timeline" className="glass-card rounded-2xl p-8 mt-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-white">Block21 (B21) — Liquidity Timeline</h2>
          <p className="text-gray-400 mt-2">Visual guide to how liquidity and price impact evolve.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="glass-panel rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-heading font-bold text-lg mb-2">Phase 1 — Launch & Discovery</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Liquidity: Limited</li>
                <li>Price Impact: High (expected)</li>
                <li>What this means: Early price discovery. Large trades may move price.</li>
              </ul>
            </div>
            <div className="glass-panel rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-heading font-bold text-lg mb-2">Phase 2 — Early Growth</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Liquidity: Gradually increasing</li>
                <li>Price Impact: Moderate</li>
                <li>What this means: More users trade, slippage reduces naturally.</li>
              </ul>
            </div>
            <div className="glass-panel rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-heading font-bold text-lg mb-2">Phase 3 — Healthy Market</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Liquidity: Sufficient for daily trading</li>
                <li>Price Impact: Low (2–5%)</li>
                <li>What this means: Trading feels stable and predictable.</li>
              </ul>
            </div>
            <div className="glass-panel rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-heading font-bold text-lg mb-2">Phase 4 — Mature Ecosystem</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Liquidity: Strong & distributed</li>
                <li>Price Impact: Very low</li>
                <li>What this means: Multiple pairs, broader usage, long-term stability.</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 glass-panel rounded-xl p-6 border border-white/10">
            <h3 className="text-white font-heading font-bold text-lg mb-4">Always True</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5" />
                <span className="text-sm text-gray-300">Liquidity is added using 50% B21 / 50% USDT</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5" />
                <span className="text-sm text-gray-300">Liquidity is not added to control price</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5" />
                <span className="text-sm text-gray-300">There is no fixed schedule or guaranteed amount</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5" />
                <span className="text-sm text-gray-300">Liquidity grows with real usage and demand</span>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-400 italic mt-6">
            Block21 starts small, grows organically, and becomes stable over time — without artificial liquidity or price control.
          </p>
        </div>

      </div>
    </div>
  );
}
