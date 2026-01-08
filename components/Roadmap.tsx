import { Milestone, CheckCircle, Circle } from "lucide-react";

const roadmapData = [
  {
    phase: "Phase 1: Genesis",
    status: "completed",
    items: [
      "Contract Deployment on Polygon",
      "Website Launch (V1)",
      "Community Building",
      "Genesis Allocation"
    ]
  },
  {
    phase: "Phase 2: Liquidity & Growth",
    status: "active",
    items: [
      "DEX Listing (QuickSwap/Uniswap)",
      "CoinGecko / CMC Application",
      "Marketing Campaign",
      "Liquidity Locking"
    ]
  },
  {
    phase: "Phase 3: DeFi Integration",
    status: "upcoming",
    items: [
      "Staking Dashboard",
      "Yield Farming",
      "Governance DAO Setup",
      "Strategic Partnerships"
    ]
  },
  {
    phase: "Phase 4: Expansion",
    status: "upcoming",
    items: [
      "Cross-chain Bridge",
      "Mobile Wallet Integration",
      "Ecosystem Grants",
      "Full Decentralization (Renounce Ownership)"
    ]
  }
];

export default function Roadmap() {
  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold mb-10 text-center">Roadmap to DeFi</h2>
      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-700 before:to-transparent">
        {roadmapData.map((phase, index) => (
          <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            
            {/* Icon */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-700 bg-gray-900 group-hover:bg-primary/20 group-hover:border-primary transition-colors shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              {phase.status === "completed" ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : phase.status === "active" ? (
                <Milestone className="w-5 h-5 text-primary animate-pulse" />
              ) : (
                <Circle className="w-5 h-5 text-gray-600" />
              )}
            </div>
            
            {/* Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-900/50 p-6 rounded-xl border border-gray-800 shadow-xl hover:border-gray-600 transition-all">
              <div className="flex items-center justify-between space-x-2 mb-2">
                <h3 className="font-bold text-white">{phase.phase}</h3>
                <span className={`text-xs px-2 py-1 rounded uppercase font-bold ${
                    phase.status === "completed" ? "bg-green-900/30 text-green-400" :
                    phase.status === "active" ? "bg-primary/20 text-primary" :
                    "bg-gray-800 text-gray-500"
                }`}>
                    {phase.status}
                </span>
              </div>
              <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                {phase.items.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
