"use client";

import { useState } from "react";
import PriceTicker from "@/components/PriceTicker";
import { B21_CONTRACT_ADDRESS } from "@/lib/utils";
import B21Coin from "@/components/ui/B21Coin";

export default function Markets() {
  const [activeTab, setActiveTab] = useState<"B21" | "BTC" | "ETH">("B21");

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 pt-24">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-2">Live Markets</h1>
        <p className="text-gray-400">Real-time charts and price analysis.</p>
      </div>
      
      <div className="glass-card p-4 rounded-xl mb-8">
        <PriceTicker />
      </div>
      
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
            <button 
                onClick={() => setActiveTab("B21")}
                className={`px-6 py-3 text-sm font-bold rounded-t-xl transition-all relative overflow-hidden ${activeTab === "B21" ? "text-gold-500 bg-gold-500/10 border-b-2 border-gold-500" : "text-gray-500 hover:text-white hover:bg-white/5"}`}
            >
                <span className="flex items-center gap-1 font-heading">
                    <span className="inline-flex items-center relative scale-[0.3] origin-center w-[24px] justify-center">
                        <span className="relative inline-flex items-center justify-center">
                            <span className="relative z-10 text-transparent bg-clip-text bg-metallic-gold text-5xl drop-shadow-[0_0_15px_rgba(212,175,55,0.9)] font-heading font-bold tracking-wider">B</span>
                            <span className="absolute inset-0 flex items-center justify-center pointer-events-none gap-[5px] rotate-[12deg]">
                                <span className="w-[2px] h-[95%] bg-gradient-to-b from-[#FFD700] via-[#FDB931] to-[#9E7C0C] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.3)]"></span>
                                <span className="w-[2px] h-[95%] bg-gradient-to-b from-[#FFD700] via-[#FDB931] to-[#9E7C0C] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.3)]"></span>
                            </span>
                        </span>
                        <span className="text-transparent bg-clip-text bg-metallic-gold text-3xl font-black ml-1 drop-shadow-[0_0_15px_rgba(212,175,55,0.9)] font-heading">21</span>
                    </span>
                    / USDT
                </span>
            </button>
            <button 
                onClick={() => setActiveTab("BTC")}
                className={`px-6 py-3 text-sm font-bold rounded-t-xl transition-all relative overflow-hidden ${activeTab === "BTC" ? "text-orange-500 bg-orange-500/10 border-b-2 border-orange-500" : "text-gray-500 hover:text-white hover:bg-white/5"}`}
            >
                <span className="flex items-center gap-1 font-heading">
                    BTC / USDT
                </span>
            </button>
             <button 
                onClick={() => setActiveTab("ETH")}
                className={`px-6 py-3 text-sm font-bold rounded-t-xl transition-all relative overflow-hidden ${activeTab === "ETH" ? "text-blue-500 bg-blue-500/10 border-b-2 border-blue-500" : "text-gray-500 hover:text-white hover:bg-white/5"}`}
            >
                <span className="flex items-center gap-1 font-heading">
                    ETH / USDT
                </span>
            </button>
        </div>

        <div className="w-full h-[700px] glass-panel rounded-xl overflow-hidden border border-white/10 relative backdrop-blur-sm shadow-2xl">
            {activeTab === "B21" && (
                 <iframe 
                    src={`https://dexscreener.com/polygon/${B21_CONTRACT_ADDRESS}?embed=1&theme=dark&trades=0&info=0`}
                    style={{ width: '100%', height: '100%', border: 0 }}
                    title="B21 Chart"
                ></iframe>
            )}
             {activeTab === "BTC" && (
                <iframe 
                    src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_btc&symbol=BINANCE%3ABTCUSDT&interval=D&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=1&toolbarbg=F1F3F6&studies=[]&theme=Dark&style=1&timezone=Etc%2FUTC&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=BINANCE%3ABTCUSDT"
                    style={{ width: '100%', height: '100%', border: 0 }}
                    title="BTC Chart"
                ></iframe>
            )}
            {activeTab === "ETH" && (
                <iframe 
                    src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_eth&symbol=BINANCE%3AETHUSDT&interval=D&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=1&toolbarbg=F1F3F6&studies=[]&theme=Dark&style=1&timezone=Etc%2FUTC&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=BINANCE%3AETHUSDT"
                    style={{ width: '100%', height: '100%', border: 0 }}
                    title="ETH Chart"
                ></iframe>
            )}
        </div>
      </div>
    </div>
  );
}
