import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Wallet, Lock, Activity, Users, FileText, PieChart, Info, TrendingDown, Calendar, ArrowRight } from 'lucide-react';
import { B21_CONTRACT_ADDRESS } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Transparency - Block21',
  description: 'Verified wallet allocations and contract permissions for Block21.',
};

const ALLOCATION = [
  { category: "Treasury & Operations", amount: "840,000", percent: "40%", purpose: "Long-term operations, development, partnerships, sustainability" },
  { category: "Liquidity (Reserved for Gradual Provisioning)", amount: "420,000", percent: "20%", purpose: "DEX liquidity added progressively based on real demand" },
  { category: "Public Market Allocation", amount: "210,000", percent: "10%", purpose: "Open market availability via decentralized exchanges" },
  { category: "Ecosystem & Rewards", amount: "210,000", percent: "10%", purpose: "Community incentives, gaming, ecosystem usage" },
  { category: "Founder (Cold Wallet, Vested)", amount: "210,000", percent: "10%", purpose: "Long-term founder alignment (not for early selling)" },
  { category: "Team (Cold Wallet, Vested)", amount: "105,000", percent: "5%", purpose: "Core contributors, long-term vesting" },
  { category: "Strategic Reserve", amount: "105,000", percent: "5%", purpose: "Emergency use or future strategic opportunities" },
];

const FEE_SCHEDULE = [
  { phase: "Launch Phase", feeChange: "Base fee (initial)", description: "Higher initial fee supports early ecosystem funding and stability" },
  { phase: "Year 1", feeChange: "50% reduction", description: "First scheduled reduction to lower transaction costs" },
  { phase: "Year 2", feeChange: "Additional 50% reduction", description: "Further reduction as adoption and liquidity grow" },
  { phase: "Long-Term", feeChange: "Gradual decline to 0.17%", description: "Fees approach the minimum hard-coded rate" },
];

const WALLETS = [
  {
    name: "Treasury & Operations",
    address: "0x3e71f6AaDF8D6c79F7dac9F11AAB9Bfe4beA8233",
    purpose: "Operational costs, development, partnerships, ecosystem growth",
    usageScope: "Used for running and sustaining the project. Does not interact with liquidity pools or user funds.",
    status: "Active"
  },
  {
    name: "Liquidity Future (DEX)",
    address: "0x29804F6Bd1c45f0B5982C1b9973FcfF574E39529",
    purpose: "Decentralized exchange liquidity provisioning",
    usageScope: "Used only to add DEX liquidity. Liquidity is deployed gradually and never used for operational or personal expenses.",
    status: "Locked"
  },
  {
    name: "Deployer",
    address: "0x7A085FC48397bC0020F9e3979F2061B53F87eC1c",
    purpose: "Contract deployment and management",
    usageScope: "Primary address for deploying contracts and initial configuration.",
    status: "Active"
  },
  {
    name: "Ecosystem & Rewards",
    address: "0x32139484596761c7D224e8650A7A80DDc221b170",
    purpose: "Community rewards, incentives, grants, future utilities",
    usageScope: "Supports ecosystem participation. Not used for liquidity or treasury spending.",
    status: "Active"
  },
  {
    name: "QC Wallet",
    address: "0xBBA9BEEB5c817354D1B988Ddd72C4B927B2aB96a",
    purpose: "Contract testing, audits, verification",
    usageScope: "Holds minimal balances. Not involved in market activity.",
    status: "Active"
  },
  {
    name: "Strategic Reserve",
    address: "0x47eb3893CbC913F8447C6b5E39A0081228F8D7AE",
    purpose: "Emergency use or future strategic opportunities",
    usageScope: "Long-term reserve. Not part of circulating supply or routine expenses.",
    status: "Cold Storage"
  },
  {
    name: "Team Cold Wallet",
    address: "0xb83559A870C8a519A6Ca0c678Fdaa99c5e140333",
    purpose: "Long-term team allocation",
    usageScope: "Intended for long-term contributor alignment and subject to vesting principles.",
    status: "Cold Storage"
  },
  {
    name: "Founder Cold Wallet",
    address: "0x82D53623c4F52d7c5f88723377f8c9F11E4183ec",
    purpose: "Founder allocation",
    usageScope: "Represents long-term founder alignment. Not intended for early market activity or liquidity provisioning.",
    status: "Cold Storage"
  }
];

export default function TransparencyPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground pt-24 pb-16 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-20 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-panel px-4 py-1.5 mb-8 hover:bg-white/10 transition-colors cursor-default shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold tracking-wide text-gray-200">Verified On-Chain Data</span>
          </div>

          {/* Heading */}
          <div role="heading" aria-level={1} className="text-4xl lg:text-6xl font-black tracking-tight text-white mb-8 leading-tight font-heading">
            <span className="block text-gray-400 text-2xl lg:text-3xl mb-3 font-bold tracking-normal">Don't Trust. Verify.</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-white to-red-500 drop-shadow-[0_2px_10px_rgba(239,68,68,0.3)]">
              100% On-Chain Transparency
            </span>
          </div>

          <div className="mb-8">
             <Link 
                href="/usd-value-check" 
                className="inline-flex items-center gap-2 text-red-500 hover:text-white transition-colors border-b border-red-500/30 hover:border-white pb-0.5"
             >
                Read: USD Value Over Time — A Reality Check <ArrowRight className="w-4 h-4" />
             </Link>
          </div>

          {/* Subtext */}
          <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            We believe in complete openness. Every wallet, every transaction, and every allocation is <span className="text-white font-bold">public and verifiable</span> on the Polygon network.
          </p>
        </div>

        {/* Wallet Table */}
        <div className="glass-card rounded-2xl overflow-hidden mb-16 shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
          <div className="p-4 md:p-6 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                  <Wallet className="w-6 h-6" />
                </div>
                Official Wallets
              </h2>
              <p className="text-xs md:text-sm text-red-500/80 font-mono uppercase tracking-wider pl-14">
                Transparent · Purpose-Driven · On-Chain Verifiable
              </p>
            </div>
            <a 
              href={`https://polygonscan.com/token/${B21_CONTRACT_ADDRESS}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-red-500 hover:text-white transition-colors flex items-center gap-2 font-medium px-4 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
            >
              View on Polygonscan <Activity className="w-4 h-4" />
            </a>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="p-3 md:p-4 text-xs font-heading font-bold text-red-500/80 tracking-wider">Wallet Name</th>
                  <th className="p-3 md:p-4 text-xs font-heading font-bold text-red-500/80 tracking-wider">Wallet Address</th>
                  <th className="p-3 md:p-4 text-xs font-heading font-bold text-red-500/80 tracking-wider">Purpose</th>
                  <th className="p-3 md:p-4 text-xs font-heading font-bold text-red-500/80 tracking-wider">Usage Scope</th>
                  <th className="p-3 md:p-4 text-xs font-heading font-bold text-red-500/80 tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {WALLETS.map((wallet, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors group">
                    <td className="p-3 md:p-4">
                      <a 
                        href={`https://polygonscan.com/address/${wallet.address}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-bold text-white group-hover:text-red-500 transition-colors hover:underline decoration-red-500/50 underline-offset-4"
                      >
                        {wallet.name}
                      </a>
                    </td>
                    <td className="p-3 md:p-4 text-xs font-mono text-gray-400 break-all min-w-[120px]">
                      {wallet.name.includes("Liquidity") ? (
                        <span className="text-gray-500 italic">Contract Managed</span>
                      ) : (
                        <a 
                          href={`https://polygonscan.com/address/${wallet.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-red-500 transition-colors hover:underline decoration-red-500/50"
                        >
                          {wallet.address}
                        </a>
                      )}
                    </td>
                    <td className="p-3 md:p-4 text-sm text-gray-300 max-w-xs">{wallet.purpose}</td>
                    <td className="p-3 md:p-4 text-sm text-gray-400 max-w-md">{wallet.usageScope}</td>
                    <td className="p-3 md:p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        wallet.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        wallet.status === 'Locked' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {wallet.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Supply Allocation Overview */}
        <div className="glass-card rounded-2xl overflow-hidden mb-16 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="p-4 md:p-6 border-b border-white/10 bg-white/5 backdrop-blur-md">
                <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                        <PieChart className="w-6 h-6" />
                    </div>
                    Supply Allocation Overview
                </h2>
            </div>
            
            <div className="overflow-x-auto relative z-10">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="p-3 md:p-4 text-red-500/80 font-heading font-medium uppercase text-xs tracking-wider">Category</th>
                            <th className="p-3 md:p-4 text-red-500/80 font-heading font-medium uppercase text-xs tracking-wider">Amount (B21)</th>
                            <th className="p-3 md:p-4 text-red-500/80 font-heading font-medium uppercase text-xs tracking-wider">% of Supply</th>
                            <th className="p-3 md:p-4 text-red-500/80 font-heading font-medium uppercase text-xs tracking-wider">Purpose</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {ALLOCATION.map((item, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors group">
                                <td className="p-3 md:p-4 text-white font-medium group-hover:text-red-500 transition-colors">
                                    {item.category.includes("**") ? <strong>{item.category.replace(/\*\*/g, '')}</strong> : item.category}
                                </td>
                                <td className="p-3 md:p-4 text-gray-300 font-mono">{item.amount}</td>
                                <td className="p-3 md:p-4 text-red-500 font-bold">{item.percent}</td>
                                <td className="p-3 md:p-4 text-gray-400 text-sm">{item.purpose}</td>
                            </tr>
                        ))}
                         <tr className="bg-red-500/10 border-t-2 border-red-500/20">
                            <td className="p-3 md:p-4 text-white font-black uppercase tracking-wider">Total</td>
                            <td className="p-3 md:p-4 text-white font-black font-mono">2,100,000</td>
                            <td className="p-3 md:p-4 text-white font-black">100%</td>
                            <td className="p-3 md:p-4 text-white font-medium italic">Fixed forever</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-white/5 bg-white/5 backdrop-blur-md">
                 <ul className="text-sm text-gray-300 italic leading-relaxed list-disc list-inside space-y-1">
                    <li>Block21 does not conduct private or preferential token sales.</li>
                    <li>All token access occurs through public decentralized exchanges under the same market conditions for everyone.</li>
                    <li>Liquidity tokens are reserved and deployed gradually.</li>
                    <li>Founder and team allocations are held in cold wallets and intended for long-term alignment.</li>
                    <li>Liquidity pool funds are locked and not used for operational or personal expenses.</li>
                 </ul>
            </div>
        </div>

        {/* Progressive Fee Reduction */}
        <div className="glass-card rounded-2xl overflow-hidden mb-16 shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
          <div className="p-4 md:p-6 border-b border-white/10 bg-white/5 backdrop-blur-md">
            <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                <TrendingDown className="w-6 h-6" />
              </div>
              Progressive Fee Reduction
            </h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-3xl">
              Block21 implements a progressive fee reduction model inspired by Bitcoin’s halving mechanism. 
              Transaction fees decrease over time according to predefined rules, rewarding long-term participation and reducing friction as the ecosystem matures.
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="p-3 md:p-4 text-xs font-heading font-bold text-red-500/80 tracking-wider">Phase</th>
                  <th className="p-3 md:p-4 text-xs font-heading font-bold text-red-500/80 tracking-wider">Fee Change</th>
                  <th className="p-3 md:p-4 text-xs font-heading font-bold text-red-500/80 tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {FEE_SCHEDULE.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 md:p-4 text-white font-bold">{item.phase}</td>
                    <td className="p-3 md:p-4 text-green-400 font-bold">{item.feeChange}</td>
                    <td className="p-3 md:p-4 text-sm text-gray-300">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Permissions / Security */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card rounded-2xl p-6 md:p-8 hover:border-red-500/30 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-red-500/20">
                    <Lock className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-xl font-heading font-bold text-white mb-6 flex items-center gap-2">
                    What We <span className="text-red-500">Cannot</span> Do
                </h3>
                <ul className="space-y-4">
                    <li className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-red-500/20 transition-colors">
                        <span className="text-red-500 font-bold mt-0.5">✕</span>
                        <span className="text-gray-300 text-sm">We cannot mint new tokens (Fixed Supply).</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-red-500/20 transition-colors">
                        <span className="text-red-500 font-bold mt-0.5">✕</span>
                        <span className="text-gray-300 text-sm">We cannot pause trading or blacklist addresses.</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-red-500/20 transition-colors">
                        <span className="text-red-500 font-bold mt-0.5">✕</span>
                        <span className="text-gray-300 text-sm">We cannot access user funds or reverse transactions.</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-red-500/20 transition-colors">
                        <span className="text-red-500 font-bold mt-0.5">✕</span>
                        <span className="text-gray-300 text-sm">We cannot increase fees beyond hard-coded limits.</span>
                    </li>
                </ul>
            </div>

            <div className="glass-card rounded-2xl p-6 md:p-8 hover:border-green-500/30 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-green-500/20">
                    <FileText className="w-7 h-7 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    Contract <span className="text-green-500">Facts</span>
                </h3>
                <ul className="space-y-4">
                    <li className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-green-500/20 transition-colors">
                        <span className="text-green-500 font-bold mt-0.5">✓</span>
                        <span className="text-gray-300 text-sm">Total Supply is strictly fixed at 2,100,000 B21.</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-green-500/20 transition-colors">
                        <span className="text-green-500 font-bold mt-0.5">✓</span>
                        <span className="text-gray-300 text-sm">Initial liquidity is locked and verifiable on-chain.</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-green-500/20 transition-colors">
                        <span className="text-green-500 font-bold mt-0.5">✓</span>
                        <span className="text-gray-300 text-sm">Smart Contract source code is verified on Polygonscan.</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-green-500/20 transition-colors">
                        <span className="text-green-500 font-bold mt-0.5">✓</span>
                        <span className="text-gray-300 text-sm">Sell tax (0.17% to 2%) is automatically routed to Treasury & Rewards.</span>
                    </li>
                </ul>
            </div>
        </div>

        {/* Liquidity Note */}
        <div className="mt-8 glass-panel border-l-4 border-l-blue-500 p-4 md:p-6 rounded-r-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
             <div className="flex items-start gap-4 relative z-10">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <Info className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-white mb-2 text-lg">Liquidity Note</h4>
                    <p className="text-gray-300 leading-relaxed">
                        Liquidity will be added gradually based on real trading demand.
                        <br />
                        Initial liquidity is intentionally limited to support fair market price discovery.
                    </p>
                </div>
             </div>
        </div>

      </div>
    </div>
  );
}
