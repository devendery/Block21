"use client";

import { useEffect, useState } from "react";
import { getMarketData, MarketData } from "@/lib/api";
import { RefreshCw } from "lucide-react";

export default function PriceTicker() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const result = await getMarketData();
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
       {/* Reordered: B21 First */}
      <TickerItem 
        label="Block21 (B21)" 
        price={data?.b21} 
        loading={loading}
        color="text-primary"
        isToken
      />
      <TickerItem 
        label="Bitcoin (BTC)" 
        price={data?.btc} 
        loading={loading} 
        color="text-orange-500"
      />
      <TickerItem 
        label="Ethereum (ETH)" 
        price={data?.eth} 
        loading={loading}
        color="text-blue-500"
      />
    </div>
  );
}

function TickerItem({ label, price, loading, color, isToken }: { label: string, price?: number, loading: boolean, color: string, isToken?: boolean }) {
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 p-4 rounded-lg flex justify-between items-center shadow-lg hover:border-primary/50 transition-colors">
      <span className="text-gray-400 font-medium">{label}</span>
      <div className="flex items-center space-x-2">
        {loading && !price ? (
           <RefreshCw className="h-4 w-4 animate-spin text-gray-600" />
        ) : (
           <span className={`font-mono font-bold ${color}`}>
             ${price?.toLocaleString('en-US', { minimumFractionDigits: isToken ? 6 : 2, maximumFractionDigits: isToken ? 8 : 2 })}
           </span>
        )}
      </div>
    </div>
  );
}
