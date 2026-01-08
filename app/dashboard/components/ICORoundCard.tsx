"use client";

import { CheckCircle, Clock, Zap, Lock, Gift } from "lucide-react";

interface RoundProps {
  id: number;
  name: string;
  price: number;
  allocation: number;
  sold: number;
  status: string;
  startDate: string;
  endDate: string;
  bonus: string;
}

export default function ICORoundCard({ round }: { round: RoundProps }) {
  const calculatedProgress = (round.sold / round.allocation) * 100;
  const progress = isNaN(calculatedProgress) ? (round.status === 'COMPLETED' ? 100 : 0) : Math.min(calculatedProgress, 100);
  const remaining = Math.max(0, round.allocation - round.sold);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "text-gray-400 bg-gray-800 border-gray-700";
      case "ACTIVE": return "text-green-400 bg-green-900/30 border-green-500/50";
      case "UPCOMING": return "text-blue-400 bg-blue-900/30 border-blue-500/50";
      default: return "text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle className="w-3 h-3" />;
      case "ACTIVE": return <Zap className="w-3 h-3" />;
      case "UPCOMING": return <Clock className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className={`relative glass-card p-6 transition-all group overflow-hidden ${
        round.status === 'ACTIVE' ? 'border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.1)]' : 'hover:border-white/20'
    }`}>
      {/* Background Glow for Active */}
      {round.status === 'ACTIVE' && (
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] -z-10 transition-opacity duration-1000" />
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
            <h3 className="text-xl font-heading font-bold text-white mb-1">{round.name}</h3>
            <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black ${round.status === 'ACTIVE' ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600' : 'text-gray-300'}`}>
                    ${round.price}
                </span>
                <span className="text-xs text-gray-500 font-mono">/ B21</span>
            </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${getStatusColor(round.status)}`}>
            {getStatusIcon(round.status)}
            {round.status}
        </div>
      </div>

      {/* Bonus Badge */}
      <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs font-bold relative overflow-hidden">
        <div className="absolute inset-0 bg-green-400/5 animate-pulse"></div>
        <Gift className="w-3 h-3 relative z-10" />
        <span className="relative z-10">{round.bonus} Bonus Tokens</span>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-400">Progress</span>
            <span className="font-bold text-white">{progress.toFixed(2)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
            <div 
                className={`h-full rounded-full transition-all duration-1000 relative ${
                    round.status === 'COMPLETED' ? 'bg-gray-500' : 
                    round.status === 'ACTIVE' ? 'bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-blue-500'
                }`} 
                style={{ width: `${progress}%` }} 
            >
                {round.status === 'ACTIVE' && (
                    <>
                        <div className="absolute inset-0 bg-white/20 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                        {/* Dynamic Progress Ball */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] z-10">
                            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-50"></div>
                        </div>
                    </>
                )}
            </div>
        </div>
        <div className="flex justify-between text-[10px] mt-2 font-mono">
            <span className="text-gray-500">Sold: <span className="text-gray-300">{round.sold.toLocaleString('en-US')} B21</span></span>
            <span className="text-gray-500">Remaining: <span className="text-gray-300">{remaining.toLocaleString('en-US')} B21</span></span>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
        <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Start Date</div>
            <div className="text-sm font-bold text-white">{round.startDate}</div>
        </div>
        <div className="text-right">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">End Date</div>
            <div className="text-sm font-bold text-white">{round.endDate}</div>
        </div>
      </div>
    </div>
  );
}
