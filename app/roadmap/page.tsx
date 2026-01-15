import type { Metadata } from 'next';
import { Flag, Rocket, Trophy, Users, ShieldCheck, Zap, Globe, Layers } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';

export const metadata: Metadata = {
  title: 'Roadmap - Block21',
  description: 'The strategic development plan for the Block21 ecosystem.',
};

const PHASES = [
  {
    phase: "Phase 0",
    title: "Foundation",
    timeline: "Month 0–1",
    status: "Completed",
    icon: "FlagIcon",
    color: "text-green-500",
    border: "border-green-500/50",
    bg: "bg-green-500/10",
    items: [
      "Fixed supply finalized",
      "Deployed on Polygon",
      "Liquidity added on QuickSwap",
      "No mint, no burn, no rug logic"
    ],
    outcome: "Trust + legitimacy"
  },
  {
    phase: "Phase 1",
    title: "Awareness",
    timeline: "Month 1–2",
    status: "In Progress",
    icon: "RocketIcon",
    color: "text-blue-500",
    border: "border-blue-500/50",
    bg: "bg-blue-500/10",
    items: [
      "Official website",
      "Whitepaper v1",
      "X (Twitter), Telegram, Discord",
      "CoinMarketCap & CoinGecko applications",
      "Community rewards (limited)"
    ],
    outcome: "Visibility"
  },
  {
    phase: "Phase 2",
    title: "Utility Launch",
    timeline: "Month 2–4",
    status: "Upcoming",
    icon: "ZapIcon",
    color: "text-yellow-500",
    border: "border-yellow-500/50",
    bg: "bg-yellow-500/10",
    items: [
      "Launch first skill-based app (Ludo / Quiz / Tournament)",
      "Real-money gameplay (legal)",
      "B21 used for rewards & utility"
    ],
    outcome: "B21 is USED"
  },
  {
    phase: "Phase 3",
    title: "Ecosystem Growth",
    timeline: "Month 4–8",
    status: "Upcoming",
    icon: "TrophyIcon",
    color: "text-purple-500",
    border: "border-purple-500/50",
    bg: "bg-purple-500/10",
    items: [
      "Multiple games/apps",
      "Unified B21 wallet",
      "Referral & ranking system",
      "NFT badges (optional)"
    ],
    outcome: "Sticky users"
  },
  {
    phase: "Phase 4",
    title: "Governance & Staking",
    timeline: "Month 8–12",
    status: "Upcoming",
    icon: "ShieldCheckIcon",
    color: "text-cyan-500",
    border: "border-cyan-500/50",
    bg: "bg-cyan-500/10",
    items: [
      "Utility staking (non-cash)",
      "DAO voting (features, games, rewards)",
      "Community governance"
    ],
    outcome: "Decentralization"
  },
  {
    phase: "Phase 5",
    title: "Partnerships",
    timeline: "Year 2",
    status: "Planned",
    icon: "UsersIcon",
    color: "text-orange-500",
    border: "border-orange-500/50",
    bg: "bg-orange-500/10",
    items: [
      "Gaming studios",
      "EdTech platforms",
      "Loyalty & brand rewards",
      "API for third-party apps"
    ],
    outcome: "Ecosystem expansion"
  },
  {
    phase: "Phase 6",
    title: "B21 Chain",
    timeline: "Year 2–3, Optional",
    status: "Vision",
    icon: "LayersIcon",
    color: "text-pink-500",
    border: "border-pink-500/50",
    bg: "bg-pink-500/10",
    items: [
      "Layer-2 / Sidechain",
      "B21 as gas token",
      "1:1 token → coin migration"
    ],
    outcome: "Independent network"
  }
];

const MILESTONES = [
  { year: "2025", focus: "Token + Community", achievements: "Launch, liquidity, trust" },
  { year: "2026", focus: "Utility Apps", achievements: "Games, rewards, users" },
  { year: "2027", focus: "Ecosystem", achievements: "Multi-app, DAO" },
  { year: "2028", focus: "Scale", achievements: "Partnerships, APIs" },
  { year: "2029", focus: "Chain (Optional)", achievements: "B21 Network" },
];

export default function RoadmapPage() {
  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-heading font-black mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary animate-gradient-x">
              Strategic Roadmap
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            A clear path from foundation to a fully decentralized ecosystem.
            Building utility, trust, and value at every step.
          </p>
        </div>

        <div className="relative">
          {/* Vertical Line (Desktop) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent -translate-x-1/2" />
          
          {/* Vertical Line (Mobile) */}
          <div className="md:hidden absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />

          <div className="space-y-8 md:space-y-16">
            {PHASES.map((phase, index) => (
              <div key={index} className={`relative flex flex-col md:flex-row gap-6 items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} pl-10 md:pl-0`}>
                
                {/* Timeline Dot (Desktop) */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-black border-2 border-primary/50 items-center justify-center z-10 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                </div>

                {/* Timeline Dot (Mobile) */}
                <div className="md:hidden absolute left-4 -translate-x-1/2 w-4 h-4 rounded-full bg-black border-2 border-primary/50 items-center justify-center z-10 mt-8 top-0">
                  <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                </div>

                {/* Content Card */}
                <div className="w-full md:w-5/12 group">
                  <div className={`relative p-5 rounded-xl border bg-black/40 backdrop-blur-sm transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl ${phase.border} ${index % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'}`}>
                    
                    {/* Glowing Border Gradient */}
                    <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r ${phase.color.replace('text-', 'from-')}/10 to-transparent`} />

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 ${phase.bg} ${phase.color}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            {phase.status}
                          </div>
                          <h3 className="text-2xl font-heading font-bold text-white mb-1">{phase.title}</h3>
                          <div className="text-sm font-mono text-gray-500">{phase.phase} • {phase.timeline}</div>
                        </div>
                        <div className={`p-3 rounded-xl bg-gray-900/50 border border-gray-800 ${phase.color}`}>
                           <Icon name={phase.icon as any} size={24} />
                        </div>
                      </div>

                      <ul className="space-y-3 mb-6">
                        {phase.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                            <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${phase.color.replace('text-', 'bg-')}`} />
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>

                      <div className={`pt-4 border-t border-gray-800/50 flex items-center gap-2 ${phase.color}`}>
                        <Icon name="TargetIcon" size={16} />
                        <span className="text-sm font-bold">Outcome: {phase.outcome}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Empty Space for alignment */}
                <div className="hidden md:block w-1/2" />
              </div>
            ))}
          </div>
        </div>

        {/* 5-Year Milestone Table */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="text-center mb-10">
             <h2 className="text-3xl font-bold text-white mb-4">5-Year Vision</h2>
             <p className="text-gray-400">Long-term strategic milestones for the B21 ecosystem.</p>
          </div>
          
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl">
            {/* Table Header - Hidden on Mobile */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-5 bg-white/5 border-b border-white/10 font-bold text-primary text-sm uppercase tracking-wider">
              <div className="col-span-2">Year</div>
              <div className="col-span-4">Focus</div>
              <div className="col-span-6">Key Achievements</div>
            </div>
            
            {/* Table Body */}
            <div className="divide-y divide-white/5">
              {MILESTONES.map((milestone, idx) => (
                <div key={idx} className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 p-5 hover:bg-white/5 transition-colors duration-200 group">
                  <div className="col-span-2 font-mono font-bold text-white group-hover:text-primary transition-colors text-lg md:text-base">
                      {milestone.year}
                  </div>
                  <div className="col-span-4 text-gray-300 font-medium">
                      <span className="md:hidden text-xs text-gray-500 uppercase tracking-wider mr-2">Focus:</span>
                      {milestone.focus}
                  </div>
                  <div className="col-span-6 text-gray-400">
                      <span className="md:hidden text-xs text-gray-500 uppercase tracking-wider mr-2">Achievements:</span>
                      {milestone.achievements}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
            <div className="inline-block p-1 rounded-full bg-gradient-to-r from-transparent via-primary/20 to-transparent">
                <p className="px-6 py-2 text-sm text-gray-500 font-mono">
                    Roadmap is subject to community governance and market conditions.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
