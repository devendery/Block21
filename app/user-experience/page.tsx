import type { Metadata } from 'next';
import {
  ShieldCheck,
  Eye,
  Lock,
  Users,
  AlertTriangle,
  MessageCircle,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import InstitutionalB21Logo from '@/components/ui/InstitutionalB21Logo';

export const metadata: Metadata = {
  title: 'User Experience - Block21',
  description: 'A fixed-supply digital asset governed by its holders, focused on scarcity, transparency, and long-term value.',
};

export default function UserExperiencePage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Hero */}
        <div className="mb-20 text-center relative z-10">
          <div role="heading" aria-level={1} className="text-4xl lg:text-6xl font-black tracking-tight text-white mb-8 leading-tight font-heading">
            <span className="block text-gray-400 text-2xl lg:text-3xl mb-3 font-bold tracking-normal">
              <span className="text-red-500">Block21</span>: Scarcity, Governance, Transparency
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-white to-red-500 drop-shadow-[0_2px_10px_rgba(239,68,68,0.3)]">
              Designed Around Real Users
            </span>
          </div>
          <p className="text-xl lg:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
            B21 is built for people who care about rules, time, and trust. Fixed supply, visible wallets, and governance-first design create a user journey that can be understood and verified, not guessed.
          </p>
        </div>

        {/* Design Guarantees Strip */}
        <section className="mb-12">
          <div className="glass-panel p-4 md:p-6 border-white/10 bg-black/60 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs font-mono text-gray-400 uppercase tracking-[0.2em]">
              Trust by Design
            </div>
            <div className="flex flex-col md:flex-row gap-3 md:gap-6 text-xs md:text-sm text-gray-300 text-center md:text-left">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                <span>Fixed supply, no presale, Bitcoin-inspired rules.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                <span>Transparent wallets and verifiable on-chain governance.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                <span>Utility-first adoption, long-term reliability over hype.</span>
              </div>
            </div>
          </div>
        </section>

        {/* What is B21 */}
        <section className="mb-12">
          <div className="glass-panel p-8 border-white/10 bg-gradient-to-br from-white/5 to-transparent flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h2 className="text-2xl font-heading font-bold text-white mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">
                  1
                </span>
                What Is B21?
              </h2>
              <p className="text-gray-300 mb-3">
                B21 is a fixed-supply crypto asset built on simple, verifiable rules:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>A permanently capped supply</li>
                <li>Locked liquidity</li>
                <li>Transparent wallets</li>
                <li>DAO-based governance</li>
                <li>Utility introduced only through community consensus</li>
              </ul>
              <p className="text-gray-400 mt-4">
                B21 does not attempt to replace Bitcoin. It explores how discipline, governance, and transparency can protect value in a
                smaller, community-driven system.
              </p>
            </div>
            <div className="w-full md:w-72 flex justify-center">
              <div className="glass-panel p-6 rounded-xl border-white/10 bg-black/60 flex flex-col items-center gap-4">
                <InstitutionalB21Logo size={80} variant="v1" theme="obsidian" />
                <div className="text-xs font-mono text-gray-400 uppercase tracking-wide text-center">
                  Fixed Supply • No Minting • Community Governance
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Principles */}
        <section className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-white mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">
              2
            </span>
            Core Principles
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Scarcity',
                desc: 'B21 has a fixed and immutable supply. No minting. No rebasing. No inflation.'
              },
              {
                title: 'Predictability',
                desc: 'Rules are defined at launch and are not changed later to benefit insiders.'
              },
              {
                title: 'Transparency',
                desc: 'All contracts, wallets, and liquidity actions are publicly verifiable.'
              },
              {
                title: 'Governance',
                desc: 'Decisions evolve through a DAO, not through a central authority.'
              },
              {
                title: 'Long-Term Focus',
                desc: 'B21 prioritizes sustainability and value protection over short-term price action.'
              }
            ].map((item, i) => (
              <div key={i} className="glass-panel p-6 border-white/10">
                <h3 className="text-lg font-heading font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Token Economics */}
        <section className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-white mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">
              3
            </span>
            Token Economics
          </h2>
          <div className="glass-panel p-8 border-white/10">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3 text-gray-300">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Total Supply</span>
                  <span className="font-bold text-white">2,100,000 B21</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Minting</span>
                  <span className="font-bold text-red-500">Disabled permanently</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Liquidity</span>
                  <span className="font-bold text-white">Locked / Burned (verifiable on-chain)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Treasury</span>
                  <span className="font-bold text-white">Controlled by DAO governance</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span>Team Allocation</span>
                  <span className="font-bold text-white">Transparent and time-locked (or none)</span>
                </div>
              </div>
              <div className="flex flex-col justify-between">
                <p className="text-gray-300 mb-4">
                  B21 is intentionally simple. Complexity introduces risk. Its economic model is designed around scarcity and verifiable
                  commitments, not clever mechanics.
                </p>
                <div className="mt-4 text-center font-heading font-bold text-gold-500">
                  Scarcity + predictability = confidence
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Governance & DAO */}
        <section className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-white mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">
              4
            </span>
            Governance and DAO
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 border-white/10">
              <h3 className="text-lg font-heading font-bold text-white mb-3">DAO Responsibilities</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
                <li>Treasury management</li>
                <li>Liquidity decisions</li>
                <li>Utility expansion</li>
                <li>Partnerships and integrations</li>
                <li>Long-term roadmap execution</li>
              </ul>
            </div>
            <div className="glass-panel p-6 border-white/10">
              <h3 className="text-lg font-heading font-bold text-white mb-3">Governance Model</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
                <li>Token-based voting</li>
                <li>Public proposals</li>
                <li>Transparent outcomes</li>
                <li>No control over token supply</li>
              </ul>
              <p className="text-gray-400 text-sm mt-4">
                Governance is not a one-time promise. It is an ongoing process that shifts control from founders to the community.
              </p>
            </div>
          </div>
        </section>

        {/* Utility */}
        <section className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-white mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">
              5
            </span>
            Utility (Designed to Support Holding)
          </h2>
          <div className="glass-panel p-8 border-white/10">
            <p className="text-gray-300 mb-4">
              B21 utility is introduced gradually and deliberately. Utility is meant to support the asset, not dilute it.
            </p>
            <h3 className="text-lg font-heading font-bold text-white mb-3">Planned Utility Layers</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm mb-4">
              <li>Governance participation</li>
              <li>Treasury voting rights</li>
              <li>Access to future B21 tools and platforms</li>
              <li>DAO-approved integrations</li>
              <li>Optional fee or value-sharing mechanisms</li>
            </ul>
            <p className="text-gray-400 text-sm">
              B21 avoids inflationary rewards, high-risk yield farming, or forced utility. Each new layer must strengthen the asset rather
              than weaken its scarcity.
            </p>
          </div>
        </section>

        {/* Roadmap */}
        <section className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-white mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">
              6
            </span>
            Roadmap
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                phase: 'Phase I — Foundation',
                items: ['Contract finalization', 'Liquidity lock', 'Website and documentation', 'Transparency dashboard']
              },
              {
                phase: 'Phase II — Governance',
                items: ['DAO framework launch', 'Voting mechanism', 'First community proposals']
              },
              {
                phase: 'Phase III — Utility',
                items: ['Treasury deployment', 'DAO-approved partnerships', 'Utility integrations']
              },
              {
                phase: 'Phase IV — Maturity',
                items: ['Reduced founder control', 'DAO autonomy', 'Long-term sustainability']
              }
            ].map((block, i) => (
              <div key={i} className="glass-panel p-6 border-white/10">
                <h3 className="text-lg font-heading font-bold text-white mb-3">{block.phase}</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
                  {block.items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Transparency */}
        <section className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-white mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">
              7
            </span>
            Transparency
          </h2>
          <div className="glass-panel p-8 border-white/10 flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-3 text-gray-300 text-sm">
              <p>B21 believes trust is earned through visibility, not promises.</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Smart contracts are public.</li>
                <li>Liquidity actions are verifiable.</li>
                <li>Treasury movements are documented.</li>
                <li>Governance decisions are archived.</li>
              </ul>
              <p className="text-gray-400 mt-3">
                If something cannot be verified on-chain, it should not be trusted.
              </p>
            </div>
            <div className="w-full md:w-64">
              <div className="glass-panel p-4 border-white/10 bg-black/60 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Eye className="w-4 h-4 text-gold-500" />
                  <span>On-chain first</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <FileText className="w-4 h-4 text-gold-500" />
                  <span>Documented movements</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <ShieldCheck className="w-4 h-4 text-gold-500" />
                  <span>Audit-ready mindset</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Risk Disclosure */}
        <section className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-white mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">
              8
            </span>
            Risk Disclosure
          </h2>
          <div className="glass-panel p-8 border-white/10 bg-red-900/10">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <span className="font-bold text-sm uppercase tracking-wide">No Guaranteed Outcomes</span>
            </div>
            <p className="text-gray-300 mb-4">
              B21 does not promise profits. The value of B21 can go up or down. It is an early-stage experiment in:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm mb-4">
              <li>Digital scarcity</li>
              <li>Governance-driven value protection</li>
              <li>Community-owned decision making</li>
            </ul>
            <p className="text-gray-400 text-sm">
              Participants should understand the risks involved in crypto assets before taking part.
            </p>
          </div>
        </section>

        {/* Philosophy */}
        <section className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-white mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">
              9
            </span>
            Philosophy
          </h2>
          <div className="glass-panel p-8 border-white/10 bg-white/5">
            <p className="text-gray-300 mb-4">
              B21 is not designed to be exciting. It is designed to be reliable.
            </p>
            <p className="text-gray-300 mb-4">
              Time, discipline, and transparency are the real incentives. The goal is not to engineer hype, but to create a system that can
              be trusted to behave the same way tomorrow as it does today.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-white mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">
              10
            </span>
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: 'Can more B21 be minted?',
                a: 'No. Supply is fixed permanently and cannot be increased.'
              },
              {
                q: 'Is liquidity locked?',
                a: 'Yes. Proof of liquidity lock or burn is publicly available on-chain.'
              },
              {
                q: 'Who controls B21?',
                a: 'The community, through DAO governance and transparent rules.'
              },
              {
                q: 'Is this a short-term project?',
                a: 'No. B21 is designed for long-term participation and gradual decentralization.'
              }
            ].map((item, i) => (
              <div key={i} className="glass-panel p-6 border-white/10">
                <p className="text-sm font-heading font-bold text-white mb-2">{item.q}</p>
                <p className="text-sm text-gray-300">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Join the Community */}
        <section className="mt-8 pt-10 border-t border-white/10">
          <div className="glass-panel p-8 border-white/10 bg-black/60 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-heading font-bold text-white mb-3">Join the Community</h2>
              <p className="text-gray-300 text-sm mb-2">
                B21 grows through participation, not promotion. Governance discussions, proposal reviews, and long-term contributors matter
                more than short-term hype.
              </p>
              <p className="text-gray-400 text-xs font-mono mt-2">
                Rules first. Price later.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/40">
                <MessageCircle className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-sm text-gray-400 max-w-xs">
                Engage, ask questions, and help shape how B21 evolves over time.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
