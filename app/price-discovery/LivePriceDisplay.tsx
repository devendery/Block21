'use client';

import { useState, useEffect } from 'react';
import { Bitcoin, RefreshCw, ExternalLink, Loader2 } from 'lucide-react';
import { B21_CONTRACT_ADDRESS } from '@/lib/utils';

interface PriceData {
  bitcoin: { usd: number };
  block21: { usd: number | null };
}

export default function LivePriceDisplay() {
  const [prices, setPrices] = useState<PriceData>({
    bitcoin: { usd: 0 },
    block21: { usd: null }
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      // Fetch Bitcoin Price
      const btcRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      const btcData = await btcRes.json();
      
      // Fetch Block21 Price via DexScreener (using contract address)
      // If no pool exists yet, this might return null/empty, we handle that
      const b21Res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${B21_CONTRACT_ADDRESS}`);
      const b21Data = await b21Res.json();
      
      const b21Price = b21Data.pairs && b21Data.pairs.length > 0 
        ? parseFloat(b21Data.pairs[0].priceUsd) 
        : null;

      setPrices({
        bitcoin: { usd: btcData.bitcoin?.usd || 0 },
        block21: { usd: b21Price }
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch prices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    // Refresh every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatB21Price = (val: number | null) => {
    if (val === null) return 'Not Listed Yet';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Bitcoin Today Context */}
      <div className="glass-panel p-6 border-orange-500/30 bg-orange-500/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
          <Bitcoin size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h2 className="text-2xl font-heading font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-2">
                <Bitcoin className="text-orange-500 w-8 h-8" />
                Bitcoin Today
                {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
              </h2>
              <div className="text-4xl md:text-5xl font-black text-white tracking-tight mb-1">
                {prices.bitcoin.usd > 0 ? formatCurrency(prices.bitcoin.usd) : '$65,000+'}
              </div>
              <div className="text-sm text-gray-400 font-medium flex items-center justify-center md:justify-start gap-2">
                Live Price (BTC/USD)
                {lastUpdated && (
                  <span className="text-xs opacity-60">
                    • Updated {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="h-px w-full md:w-px md:h-20 bg-white/10" />
            
            <div className="space-y-4 md:space-y-0 md:flex md:gap-12">
              <div>
                <div className="text-3xl font-black text-green-400 mb-1">&gt; 1 Billion &times;</div>
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Growth</div>
              </div>
              <div>
                <div className="text-3xl font-black text-white mb-1">21,000,000</div>
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Supply (BTC)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Block21 Live Price */}
      <div className="glass-panel p-6 border-blue-500/30 bg-blue-500/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
          <RefreshCw size={120} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h2 className="text-2xl font-heading font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-2">
              <span className="text-blue-500 font-black text-xl">B21</span>
              Block21 Live Price
            </h2>
            <div className="text-4xl md:text-5xl font-black text-white tracking-tight mb-1">
              {prices.block21.usd !== null ? formatB21Price(prices.block21.usd) : 'Tracking...'}
            </div>
            <div className="text-sm text-gray-400 font-medium flex items-center justify-center md:justify-start gap-2">
              Fetched via Contract
              <a 
                href={`https://polygonscan.com/token/${B21_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors ml-1"
              >
                {B21_CONTRACT_ADDRESS.slice(0, 6)}...{B21_CONTRACT_ADDRESS.slice(-4)}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="h-px w-full md:w-px md:h-20 bg-white/10" />

          <div>
             {/* If we have a price, we can show stats, otherwise show info */}
             {prices.block21.usd !== null ? (
                <div className="space-y-4 md:space-y-0 md:flex md:gap-12">
                    <div>
                        <div className="text-3xl font-black text-white mb-1">2,100,000</div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Supply (B21)</div>
                    </div>
                </div>
             ) : (
                <div className="max-w-xs text-sm text-gray-300">
                    <p>Live price tracking requires active liquidity pools. Verify contract on Polygonscan.</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
