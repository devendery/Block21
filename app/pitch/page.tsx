import type { Metadata } from 'next';
import { 
  Target, 
  ShieldCheck, 
  TrendingUp, 
  Gamepad2, 
  Coins, 
  Users, 
  Zap, 
  Layers, 
  Ban, 
  CheckCircle2, 
  ArrowRight,
  Gem
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Investor Pitch - Block21',
  description: 'B21 Investor & Partner Pitch Deck: A fixed-supply utility token powering skill-based digital ecosystems.',
};

const MILESTONES = [
  { year: "2025", focus: "Token + Community", achievements: "Launch, liquidity, trust" },
  { year: "2026", focus: "Utility Apps", achievements: "Games, rewards, users" },
  { year: "2027", focus: "Ecosystem", achievements: "Multi-app, DAO" },
  { year: "2028", focus: "Scale", achievements: "Partnerships, APIs" },
  { year: "2029", focus: "Chain (Optional)", achievements: "B21 Network" },
];

export default function PitchPage() {
  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-24">
        
        {/* Header / Positioning */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-heading font-black mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary animate-gradient-x">
              Block21 (B21)
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            "B21 is a fixed-supply utility token powering skill-based digital ecosystems."
          </p>
        </div>

        {/* Section 1: What & Why */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* What is B21? */}
          <div className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
                <Gem size={24} />
              </div>
              <h2 className="text-2xl font-heading font-bold text-white">What is B21?</h2>
            </div>
            <p className="text-lg text-gray-300 leading-relaxed">
              A fixed-supply utility token powering skill-based gaming, learning, and rewards ecosystem.
            </p>
          </div>

          {/* Why B21? */}
          <div className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-primary/20 text-primary">
                <Target size={24} />
              </div>
              <h2 className="text-2xl font-heading font-bold text-white">Why B21?</h2>
            </div>
            <ul className="space-y-4">
              {[
                "Scarcity (2.1M fixed supply)",
                "Real utility (not speculation)",
                "Legal-first approach",
                "Scalable ecosystem"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section 2: Revenue & Growth */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Revenue Model */}
          <div className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-green-500/20 text-green-400">
                <Coins size={24} />
              </div>
              <h2 className="text-2xl font-heading font-bold text-white">Revenue Model</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Platform fee from games",
                "Premium access",
                "Brand partnerships",
                "NFT utilities",
                "Advertisement"
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-black/40 border border-white/5 text-gray-300 text-center text-sm font-medium">
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Growth Strategy */}
          <div className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">
                <TrendingUp size={24} />
              </div>
              <h2 className="text-2xl font-heading font-bold text-white">Growth Strategy</h2>
            </div>
            <div className="flex items-center justify-between gap-2 text-sm md:text-base font-bold text-white bg-black/40 p-6 rounded-xl border border-white/5">
              <span>Games</span>
              <ArrowRight className="w-5 h-5 text-gray-500" />
              <span>Users</span>
              <ArrowRight className="w-5 h-5 text-gray-500" />
              <span>Ecosystem</span>
              <ArrowRight className="w-5 h-5 text-gray-500" />
              <span>Chain</span>
            </div>
          </div>
        </div>

        {/* Section 3: Token Utility Flow */}
        <div className="relative p-8 md:p-12 rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/5 to-black/40 backdrop-blur-md">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap size={120} />
            </div>
            
            <h2 className="text-3xl font-heading font-bold text-white mb-10 flex items-center gap-3">
                <Layers className="text-primary" />
                B21 Token Utility Flow
            </h2>

            <div className="grid md:grid-cols-3 gap-8 items-center">
                {/* Step 1: Earn */}
                <div className="text-center space-y-4 relative group">
                    <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 text-green-400 flex items-center justify-center border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                        <Gamepad2 size={32} />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-white">User Earns B21</h3>
                    <p className="text-gray-400 text-sm">Games, quizzes, rewards</p>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex justify-center text-gray-600">
                    <ArrowRight size={32} className="animate-pulse" />
                </div>

                {/* Step 2: Spend */}
                <div className="text-center space-y-4 relative group">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 text-primary flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                        <Coins size={32} />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-white">User Spends B21</h3>
                    <ul className="text-gray-400 text-sm space-y-1">
                        <li>Entry discounts</li>
                        <li>Power-ups</li>
                        <li>Premium features</li>
                        <li>Governance voting</li>
                    </ul>
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 text-center">
                <p className="text-lg text-primary font-medium">
                    "B21 circulates inside ecosystem. Limited supply → Long-term value."
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                    {["No gambling", "No betting", "Utility-first design"].map((tag, i) => (
                        <span key={i} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>

        {/* Section 4: Milestones */}
        <div>
            <h2 className="text-3xl font-heading font-bold text-white mb-8 text-center">5-Year Vision</h2>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl">
                {/* Table Header */}
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

        {/* Section 5: What B21 Will Never Do */}
        <div className="p-8 rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-md">
            <h2 className="text-2xl font-bold text-red-400 mb-8 flex items-center gap-3">
                <Ban /> What B21 Will NEVER Do
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    "Gambling",
                    "Casino mechanics",
                    "Fake hype",
                    "Unlimited minting"
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-gray-300 bg-black/40 p-4 rounded-xl border border-red-500/10">
                        <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold">✕</span>
                        </div>
                        <span className="font-medium">{item}</span>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}
