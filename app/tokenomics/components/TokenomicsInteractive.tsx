"use client";

import { useState } from "react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import Icon from "@/components/ui/AppIcon";
import InstitutionalB21Logo from "@/components/ui/InstitutionalB21Logo";

// --- Data ---
const DISTRIBUTION_DATA = [
  { name: 'Treasury', value: 40, color: '#10b981' }, 
  { name: 'Liquidity Pool', value: 20, color: '#0ea5e9' }, 
  { name: 'Public Allocation', value: 10, color: '#3b82f6' }, 
  { name: 'Ecosystem', value: 10, color: '#f59e0b' }, 
  { name: 'Founder', value: 10, color: '#8b5cf6' }, 
  { name: 'Team', value: 5, color: '#ec4899' }, 
  { name: 'Reserve', value: 5, color: '#eab308' }, 
];

const VESTING_DATA = [
    { name: 'Month 1-6', dev: 0, mkt: 20, res: 0 },
    { name: 'Month 7-12', dev: 25, mkt: 30, res: 10 },
    { name: 'Month 13-18', dev: 35, mkt: 25, res: 20 },
    { name: 'Month 19-24', dev: 40, mkt: 25, res: 70 },
];

const WALLETS = [
  { 
    name: "Treasury (40%)", 
    status: "ACTIVE", 
    balance: "840,000 B21", 
    percentage: "40%", 
    address: "0x3e71f6AaDF8D6c79F7dac9F11AAB9Bfe4beA8233",
    color: "text-green-500",
    bg: "bg-green-500/10"
  },
  { 
    name: "Liquidity Pool (20%)", 
    status: "LOCKED", 
    balance: "420,000 B21", 
    percentage: "20%", 
    address: "0x0227b2341debcbb8462729d52b0dc9003250db50", 
    color: "text-cyan-500",
    bg: "bg-cyan-500/10"
  },
  { 
    name: "Public Allocation (10%)", 
    status: "ACTIVE",  
    balance: "210,000 B21", 
    percentage: "10%", 
    address: "0x9e885a4b54a04c8311e8c480f89c0e92cc0a1db2",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  { 
    name: "Founder (10%)", 
    status: "LOCKED", 
    balance: "210,000 B21", 
    percentage: "10%", 
    address: "0xColdWallet1...",
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  { 
    name: "Ecosystem & Rewards (10%)", 
    status: "RESERVED", 
    balance: "210,000 B21", 
    percentage: "10%", 
    address: "0xEcosystem...",
    color: "text-orange-500",
    bg: "bg-orange-500/10"
  },
  { 
    name: "Team (5%)", 
    status: "VESTING", 
    balance: "105,000 B21", 
    percentage: "5%", 
    address: "0xTeam...",
    color: "text-pink-500",
    bg: "bg-pink-500/10"
  },
  { 
    name: "Reserve (5%)", 
    status: "LOCKED", 
    balance: "105,000 B21", 
    percentage: "5%", 
    address: "0xReserve...",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10"
  }
];

const UTILITIES = [
    { title: "Governance Rights", desc: "Participate in protocol decisions and vote on proposals that shape the future of Block21 ecosystem", icon: "VoteIcon", color: "text-cyan-400" },
    { title: "Staking Rewards", desc: "Earn passive income by staking B21 tokens in liquidity pools with competitive APY rates", icon: "PiggyBankIcon", color: "text-green-400" },
    { title: "Transaction Discounts", desc: "Reduced fees on all platform transactions when using B21 as payment method", icon: "PercentIcon", color: "text-yellow-400" },
    { title: "Access to Premium Features", desc: "Unlock advanced analytics, priority support, and exclusive platform features", icon: "StarIcon", color: "text-blue-400" },
    { title: "Liquidity Mining", desc: "Provide liquidity to earn additional rewards and contribute to market stability", icon: "DatabaseIcon", color: "text-orange-400" },
    { title: "Community Incentives", desc: "Participate in airdrops, bounty programs, and community-driven initiatives", icon: "HeartIcon", color: "text-pink-400" },
];

export default function TokenomicsInteractive() {
  const [activeTab, setActiveTab] = useState<'transfer' | 'buy' | 'sell'>('transfer');
  const [amount, setAmount] = useState<string>("1000");

  const fees = { transfer: 0, buy: 2, sell: 3 };
  const currentFee = fees[activeTab];
  const feeAmount = (parseFloat(amount || "0") * currentFee) / 100;
  const receiveAmount = parseFloat(amount || "0") - feeAmount;

  return (
    <div className="space-y-12">
      
      {/* 1. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { title: "Total Supply", val: "2,100,000", sub: "B21 Tokens (2.1M)", sub2: "Fixed Forever", icon: "LockIcon", color: "text-green-500" },
            { title: "Public Allocation", val: "210,000", sub: "10% reserved for market liquidity", sub2: "No ICO / Presale", icon: "UsersIcon", color: "text-cyan-500" },
            { title: "DEX Liquidity", val: "420,000", sub: "20% of total supply", sub2: "Growing Liquidity", icon: "ActivityIcon", color: "text-blue-500" },
            { title: "Sell Fee Range", val: "0.17-2%", sub: "Reduces gradually", sub2: "Decreasing Over Time", icon: "BanknoteIcon", color: "text-yellow-500" },
        ].map((item, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 relative overflow-hidden group hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="text-muted-foreground text-xs font-bold capitalize tracking-wide mb-1">{item.title}</div>
                        <div className="text-2xl font-black text-foreground">{item.val}</div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${item.color.replace('text-', 'bg-')} animate-pulse`} />
                </div>
                <div className="text-sm text-muted-foreground">{item.sub}</div>
                <div className={`text-xs font-bold ${item.color} mt-1`}>{item.sub2}</div>
            </div>
        ))}
      </div>

      {/* 2. Philosophy */}
      <div className="bg-card border border-border rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/20 p-2 rounded-lg w-12 h-12 flex items-center justify-center overflow-hidden">
                <InstitutionalB21Logo size={60} variant="v1" theme="obsidian" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">BLOCK21 Philosophy</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { title: "Maximum Transferability", desc: "Designed for investors and holders with minimal friction. Low fees ensure easy movement." },
                { title: "Immutable Base Token", desc: "No changes to base token through contract. What you see is what you get, forever." },
                { title: "BTC-Inspired Model", desc: "Following Bitcoin's proven footprints for community success and long-term value." }
            ].map((item, i) => (
                <div key={i}>
                    <h3 className="font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
            ))}
        </div>
      </div>

      {/* 3. Distribution & Wallets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Pie Chart */}
         <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-full flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/20 p-1 rounded"><span className="font-bold text-primary text-xs">B21</span></div>
                    <h3 className="font-bold text-foreground">Token Distribution</h3>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-900/50 rounded-full">
                    <Icon name="LockIcon" size={12} className="text-green-500" />
                    <span className="text-xs font-bold text-green-500">Fixed Forever</span>
                </div>
            </div>
            
            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={DISTRIBUTION_DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                        >
                            {DISTRIBUTION_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mt-6">
                {DISTRIBUTION_DATA.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-gray-400">{item.name}</span>
                    </div>
                ))}
            </div>
         </div>

         {/* Wallets */}
         <div className="bg-card border border-border rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-foreground">Wallet Balances</h3>
                <a href="#" className="text-xs text-primary flex items-center gap-1 hover:underline">
                    View on Polygonscan <Icon name="ExternalLinkIcon" size={12} />
                </a>
            </div>
            <div className="space-y-4">
                {WALLETS.map((wallet, i) => (
                    <div key={i} className="bg-black/40 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg ${wallet.bg} flex items-center justify-center`}>
                                <Icon name={wallet.name.includes("ICO") ? "BanknoteIcon" : wallet.name.includes("Liquidity") ? "ActivityIcon" : wallet.name.includes("Development") ? "ZapIcon" : "ShieldCheckIcon"} className={wallet.color} size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-white text-sm">{wallet.name}</div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className={`text-xs font-bold ${wallet.color}`}>{wallet.percentage}</div>
                                    <div className={`text-[10px] font-medium text-gray-500`}>{wallet.status}</div>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-lg font-bold ${wallet.color}`}>{wallet.percentage}</div>
                            <div className="text-xs text-gray-500 mb-1">of supply</div>
                            <div className="text-sm font-medium text-white mb-1">{wallet.balance}</div>
                            <div className="flex items-center justify-end gap-2">
                                <span className="text-[10px] text-gray-600 font-mono bg-gray-900 px-2 py-0.5 rounded truncate max-w-[80px]">
                                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                                </span>
                                <button className="text-gray-500 hover:text-white transition-colors">
                                    <Icon name="CopyIcon" size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
         </div>
      </div>

      {/* 4. Fee Calculator */}
      <div className="bg-card border border-border rounded-2xl p-8">
         <h3 className="text-xl font-bold mb-6">Fee Calculator</h3>
         
         <div className="grid grid-cols-3 gap-4 mb-6">
            {[
                { id: 'transfer', label: 'Transfer', fee: '0%' },
                { id: 'buy', label: 'Buy', fee: '2%' },
                { id: 'sell', label: 'Sell', fee: '3%' },
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex flex-col items-center justify-center py-4 rounded-xl border transition-all ${
                        activeTab === tab.id 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-black/40 border-gray-800 text-muted-foreground hover:bg-gray-800'
                    }`}
                >
                    <span className="font-bold text-sm">{tab.label}</span>
                    <span className="text-xs mt-1 opacity-60">{tab.fee} fee</span>
                </button>
            ))}
         </div>

         <div className="space-y-4">
             <div className="bg-black/40 rounded-xl p-4 border border-gray-800">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Amount (B21)</span>
                </div>
                <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-transparent text-xl font-bold text-white outline-none"
                />
             </div>
             
             <div className="bg-black/20 rounded-xl p-4 border border-gray-800/50 space-y-3">
                 <div className="flex justify-between items-center text-sm">
                     <span className="text-muted-foreground">Transaction Amount</span>
                     <span className="font-bold text-white">{parseFloat(amount || "0").toLocaleString('en-US')} B21</span>
                 </div>
                 <div className="flex justify-between items-center text-sm pb-3 border-b border-gray-800">
                     <span className="text-muted-foreground">Fee ({currentFee}%)</span>
                     <span className="font-bold text-yellow-500">{feeAmount.toLocaleString('en-US')} B21</span>
                 </div>
                 <div className="flex justify-between items-center">
                     <span className="font-bold text-white">You Receive</span>
                     <span className="font-black text-xl text-primary">{receiveAmount.toLocaleString('en-US')} B21</span>
                 </div>
             </div>
             
             <div className="bg-gray-900/50 rounded-lg p-3 flex items-center gap-3">
                 <Icon name="CheckCircleIcon" size={16} className="text-green-500" />
                 <span className="text-xs text-gray-400">Standard wallet-to-wallet transfers</span>
             </div>
         </div>
      </div>

      {/* 5. Token Utility */}
      <div className="bg-card border border-border rounded-2xl p-8">
         <h3 className="text-xl font-bold mb-2">Token Utility</h3>
         <p className="text-sm text-muted-foreground mb-8">B21 tokens provide multiple use cases within the ecosystem, ensuring real value beyond speculation</p>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
             {UTILITIES.map((item, i) => (
                 <div key={i} className="glass-panel p-6 hover:border-white/30 transition-colors group">
                     <div className="flex items-start gap-4">
                         <div className={`mt-1 p-2 rounded-lg bg-gray-900/50 ${item.color} group-hover:scale-110 transition-transform`}>
                             <Icon name={item.icon} size={20} />
                         </div>
                         <div>
                             <h4 className={`font-bold text-sm mb-2 ${item.color}`}>{item.title}</h4>
                             <p className="text-xs text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{item.desc}</p>
                         </div>
                     </div>
                 </div>
             ))}
         </div>

         <div className="glass-card p-5 flex items-start gap-3">
             <div className="mt-0.5"><Icon name="ZapIcon" size={18} className="text-red-500 animate-pulse" /></div>
             <div>
                  <h4 className="text-sm font-bold text-white mb-1">Utility-Driven Value</h4>
                  <p className="text-xs text-gray-400">
                      B21 is designed as a pure utility token. Demand is driven by ecosystem usage, not speculation.
                  </p>
             </div>
         </div>
      </div>

      {/* 6. Vesting Schedule */}
      <div className="bg-card border border-border rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-2">Vesting Schedule</h3>
          <p className="text-sm text-muted-foreground mb-8">Token release timeline for development, marketing, and reserve allocations over 24 months</p>
          
          <div className="w-full h-[300px] mb-8">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={VESTING_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis dataKey="name" stroke="#666" tick={{fontSize: 12}} />
                      <YAxis stroke="#666" tick={{fontSize: 12}} label={{ value: 'Release %', angle: -90, position: 'insideLeft', fill: '#666' }} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      />
                      <Bar dataKey="dev" name="Development" fill="#3b82f6" stackId="a" />
                      <Bar dataKey="mkt" name="Marketing" fill="#f97316" stackId="a" />
                      <Bar dataKey="res" name="Reserve" fill="#eab308" stackId="a" />
                  </BarChart>
              </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                  { title: "Development", period: "24-month linear vesting", amount: "15%", color: "text-blue-500", dot: "bg-blue-500" },
                  { title: "Marketing", period: "Gradual release over 24 months", amount: "10%", color: "text-orange-500", dot: "bg-orange-500" },
                  { title: "Reserve", period: "Locked until month 12", amount: "10%", color: "text-yellow-500", dot: "bg-yellow-500" },
              ].map((item, i) => (
                  <div key={i} className="bg-black/40 border border-gray-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${item.dot}`} />
                          <span className="font-bold text-white text-sm">{item.title}</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">{item.period}</div>
                      <div className={`text-xl font-bold ${item.color}`}>{item.amount}</div>
                      <div className="text-[10px] text-gray-600">of total supply</div>
                  </div>
              ))}
          </div>
      </div>
      
      {/* 7. Bottom Transparency Banner */}
      <div className="bg-black/60 border border-gray-800 rounded-2xl p-8 flex flex-col md:flex-row gap-6 items-start">
          <div className="mt-1">
              <Icon name="ShieldCheckIcon" size={24} className="text-green-500" />
          </div>
          <div>
              <h3 className="font-bold text-white mb-2">Complete Transparency Commitment</h3>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                  All wallet addresses, smart contracts, and transaction histories are publicly verifiable on Polygonscan. We believe in radical transparency as the foundation of trust in decentralized systems.
              </p>
              <a href="#" className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
                  Verify All Contracts <Icon name="ArrowRightIcon" size={14} />
              </a>
          </div>
      </div>
    </div>
  );
}
