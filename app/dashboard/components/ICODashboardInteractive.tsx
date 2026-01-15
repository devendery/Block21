"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { Shield, CheckCircle, AlertCircle, Info, Wallet, RefreshCcw } from "lucide-react";
import ICORoundCard from "./ICORoundCard";
import ParticipationForm from "./ParticipationForm";
import ParticipationHistory from "./ParticipationHistory";
import { GOOGLE_SCRIPT_URL } from "@/lib/utils";

// 2.1M Supply Model Data
const ROUNDS = [
  {
    id: 1,
    name: "Seed Allocation",
    price: 0.006, // Fixed
    allocation: 210000,
    sold: 210000,
    status: "COMPLETED",
    startDate: "Dec 25, 2025",
    endDate: "Dec 31, 2025",
    bonus: "0%"
  },
  {
    id: 2,
    name: "Initial Investor Round",
    price: 0.006, // Fixed
    allocation: 420000,
    sold: 0,
    status: "ACTIVE",
    startDate: "Jan 1, 2026",
    endDate: "Jan 5, 2026",
    bonus: "0%"
  },
  {
    id: 3,
    name: "Public Market",
    price: 0.006, // Fixed
    allocation: 1680000,
    sold: 0,
    status: "UPCOMING",
    startDate: "Jan 6, 2026",
    endDate: "Feb 28, 2026",
    bonus: "0%"
  }
];

export default function ICODashboardInteractive() {
  const { isConnected, connectWallet } = useWallet();
  const [stats, setStats] = useState({ totalRaised: 0, investors: 0, tokensAllocated: 0 });
  const [history, setHistory] = useState<any[]>([]);
  const [rounds, setRounds] = useState(ROUNDS);
  const [loading, setLoading] = useState(true);
  const activeRound = rounds.find((round) => round.status === "ACTIVE");
  const maxUsdPerInvestor = activeRound ? activeRound.allocation * 0.05 * activeRound.price : undefined;

  // Fetch stats from Google Sheet
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(GOOGLE_SCRIPT_URL);
      const data = await response.json();
      
      let calculatedSold = 0;
      let calculatedRaised = 0;
      const uniqueInvestors = new Set();
      const fetchedHistory = data.history && Array.isArray(data.history) ? data.history : [];

      if (fetchedHistory.length > 0) {
          fetchedHistory.forEach((item: any) => {
              const tokens = parseFloat(item.tokens) || 0;
              const usdt = parseFloat(item.usdt) || 0;
              calculatedSold += tokens;
              calculatedRaised += usdt;
              if (item.wallet) uniqueInvestors.add(item.wallet);
          });
      } else {
          calculatedSold = parseFloat(data.tokensAllocated || 0);
          calculatedRaised = parseFloat(data.totalRaised || 0);
      }

      setStats({
        totalRaised: calculatedRaised,
        investors: uniqueInvestors.size || parseInt(data.investors || 0),
        tokensAllocated: calculatedSold
      });
      setHistory(fetchedHistory);

      // Update Rounds Data
      setRounds(prevRounds => prevRounds.map(round => {
        if (round.id === 2) {
            return { ...round, sold: calculatedSold };
        }
        return round;
      }));

    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-12">
      
      {/* Hero / Stats */}
      <div className="glass-card p-4 md:p-12 relative overflow-hidden group">
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000" />
         
         <div className="flex justify-between items-start relative z-10">
            <h1 className="text-4xl md:text-5xl font-heading font-black mb-6 tracking-tight">
               <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary animate-gradient-x">
                   Initial Investor Distribution
               </span>
            </h1>
            <button onClick={fetchStats} className="p-2.5 glass-panel hover:bg-white/10 transition-all active:scale-95" title="Refresh Stats">
                <RefreshCcw className={`w-5 h-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>

        <p className="text-xl text-gray-400 max-w-2xl mb-10">
          Exclusive access for initial investors. Register your interest and participate in the initial distribution of Block21. <span className="text-white font-medium">$0.006 = 1 B21.</span>
       </p>

         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl relative z-10">
            <div className="glass-panel p-4 md:p-6 hover:border-green-500/30 transition-colors duration-300">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total Recorded</div>
                <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 drop-shadow-sm">
                    ${stats.totalRaised.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </div>
            </div>
            <div className="glass-panel p-4 md:p-6 hover:border-blue-500/30 transition-colors duration-300">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Investors</div>
                <div className="text-3xl md:text-4xl font-black text-white">
                    {stats.investors}
                </div>
            </div>
            <div className="glass-panel p-4 md:p-6 hover:border-gold-500/30 transition-colors duration-300">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tokens Allocated</div>
                <div className="text-3xl md:text-4xl font-black text-white">
                    {stats.tokensAllocated.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span className="text-sm text-gold-500 font-bold">B21</span>
                </div>
            </div>
         </div>
      </div>

      {/* Connect Wallet Bar */}
      {!isConnected && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                    <h3 className="font-heading font-bold text-white text-lg">Connect Your Wallet</h3>
                    <p className="text-sm text-gray-500">Connect to auto-fill your address (Optional)</p>
                </div>
            </div>
            <button 
                onClick={connectWallet}
                className="px-8 py-3 bg-green-500 hover:bg-green-600 text-black font-bold rounded-lg transition-colors shadow-lg shadow-green-500/20"
            >
                Connect Wallet
            </button>
        </div>
      )}

      {/* Rounds */}
      <div>
          <h2 className="text-2xl font-heading font-bold text-white mb-8">Allocation Phases</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {ROUNDS.map((round) => (
                  <ICORoundCard key={round.id} round={round} />
              ))}
          </div>
      </div>

      {/* Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ParticipationForm
            price={activeRound?.price ?? 0.006}
            maxBuy={maxUsdPerInvestor}
            onSuccess={fetchStats}
          />
          <ParticipationHistory data={history} loading={loading} onRefresh={fetchStats} />
      </div>

      {/* Footer Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <h4 className="text-lg font-heading font-bold mb-4 flex items-center gap-2 text-white">
                <Info className="w-5 h-5 text-green-500" /> Important Information
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    This is not financial advice. Participate only with funds you can afford to lose.
                </li>
                <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    All participation requires wallet signature consent. No automatic transactions.
                </li>
                <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    Review our tokenomics and smart contract verification before participating.
                </li>
                <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    Cryptocurrency investments are highly volatile and carry significant risk.
                </li>
            </ul>
        </div>

    </div>
  );
}
