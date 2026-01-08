import type { Metadata } from 'next';
import { ShieldCheck, Lock, Unlock, TrendingUp, AlertCircle, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Release Policy - Block21',
  description: 'Detailed token release schedule, vesting periods, and supply management policy.',
};

const RELEASE_SCHEDULE = [
  { 
    year: "Year 1", 
    phase: "Foundation & Launch", 
    allocation: "**Public Allocation + Initial Liquidity (partial)**", 
    percent: "**~10–15%**", 
    description: "Public market access begins via decentralized exchanges. A portion of the Public Allocation (10%) and a small part of the Liquidity reserve (20%) enter circulation to enable price discovery. Initial liquidity is provided and locked." 
  },
  { 
    year: "Year 2", 
    phase: "Ecosystem Expansion", 
    allocation: "**Ecosystem & Rewards + Treasury (partial)**", 
    percent: "**~10–12%**", 
    description: "Ecosystem & Rewards allocation (10%) is utilized gradually to support utilities, community participation, and early use cases. Treasury funds support development and partnerships." 
  },
  { 
    year: "Year 3", 
    phase: "Growth & Stabilization", 
    allocation: "**Liquidity (additional) + Treasury (controlled)**", 
    percent: "**~8–10%**", 
    description: "Additional liquidity is provisioned based on real trading demand. Treasury usage remains operational only. Circulating supply increases as adoption grows and volatility reduces." 
  },
  { 
    year: "Year 4", 
    phase: "Maturity", 
    allocation: "**Remaining Liquidity + Ecosystem usage**", 
    percent: "**~5–8%**", 
    description: "Majority of circulating supply is reached through public access and ecosystem usage. Transaction fees approach the long-term minimum floor (0.17%) as defined by contract rules." 
  },
];

export default function ReleasePolicyPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-black mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary animate-gradient-x">
              Token Release Policy
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Transparency first. A predictable, capped release schedule designed to align incentives and prevent market saturation.
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="glass-card p-6 border-l-4 border-green-500">
            <ShieldCheck className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Hard Cap</h3>
            <p className="text-sm text-gray-400">
              Total supply is strictly limited to 2,100,000 B21. No minting capability exists in the contract.
            </p>
          </div>
          <div className="glass-card p-6 border-l-4 border-blue-500">
            <Lock className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Vesting</h3>
            <p className="text-sm text-gray-400">
              Allocated tokens are subject to transparent vesting schedules to ensure long-term commitment.
            </p>
          </div>
          <div className="glass-card p-6 border-l-4 border-gold-500">
            <TrendingUp className="w-8 h-8 text-gold-500 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Demand-Driven</h3>
            <p className="text-sm text-gray-400">
              Market releases are coordinated with ecosystem growth milestones, not arbitrary dates.
            </p>
          </div>
        </div>

        {/* Release Schedule */}
        <div className="glass-card p-8 mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
          
          <h2 className="text-2xl font-heading font-bold text-white mb-8 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            4-Year Release Schedule
          </h2>

          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="p-3 md:p-4 text-gold-500/80 font-heading font-medium uppercase text-xs tracking-wider">Year</th>
                  <th className="p-3 md:p-4 text-gold-500/80 font-heading font-medium uppercase text-xs tracking-wider">Phase</th>
                  <th className="p-3 md:p-4 text-gold-500/80 font-heading font-medium uppercase text-xs tracking-wider">Allocation Used</th>
                  <th className="p-3 md:p-4 text-gold-500/80 font-heading font-medium uppercase text-xs tracking-wider">% of Total Supply</th>
                  <th className="p-3 md:p-4 text-gold-500/80 font-heading font-medium uppercase text-xs tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {RELEASE_SCHEDULE.map((item, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors group">
                    <td className="p-3 md:p-4 text-white font-bold">{item.year}</td>
                    <td className="p-3 md:p-4 text-white font-medium">{item.phase}</td>
                    <td className="p-3 md:p-4 text-gray-300 text-sm">
                        {item.allocation.includes("**") ? <strong>{item.allocation.replace(/\*\*/g, '')}</strong> : item.allocation}
                    </td>
                    <td className="p-3 md:p-4 text-gold-500 font-bold">
                        {item.percent.includes("**") ? item.percent.replace(/\*\*/g, '') : item.percent}
                    </td>
                    <td className="p-3 md:p-4 text-gray-400 text-sm max-w-md">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warning / Disclaimer */}
        <div className="glass-panel border-red-500/20 bg-red-500/5 p-6 rounded-xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-red-400 mb-2">Important Notice</h4>
            <p className="text-sm text-red-200/80 leading-relaxed">
              The release schedule is a strategic framework. Actual market releases may be adjusted by community governance or market conditions to protect token value. No new tokens can ever be created, ensuring the hard cap remains absolute.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
