import type { Metadata } from 'next';
import { ShieldCheck, Search, ExternalLink, Code } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Verify - Block21',
  description: 'Verify the Block21 smart contract and ownership status.',
};

export default function VerifyPage() {
  const CONTRACT_ADDRESS = "0x9e885a4b54a04c8311e8c480f89c0e92cc0a1db2";

  return (
    <div className="min-h-screen bg-transparent text-foreground pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        
        <div className="mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                <ShieldCheck className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-5xl font-heading font-black text-white mb-6">Don't Trust. <span className="text-green-500">Verify.</span></h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
                Blockchain allows you to check everything yourself. Here are the official contract details for full transparency.
            </p>
        </div>

        <div className="glass-card rounded-2xl p-8 mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-[60px] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-sm font-heading font-bold text-gold-500 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
                Token Contract Address
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-black/40 p-6 rounded-xl border border-white/10 backdrop-blur-sm group-hover:border-gold-500/30 transition-colors">
                <code className="text-white font-mono break-all text-lg">{CONTRACT_ADDRESS}</code>
                <button className="text-sm text-gold-500 hover:text-white font-bold px-4 py-2 rounded-lg bg-gold-500/10 hover:bg-gold-500/20 transition-all shrink-0">
                    Copy Address
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a href={`https://polygonscan.com/token/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer" 
               className="group flex flex-col items-center justify-center p-8 glass-card rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-gold-500/10 transition-colors">
                    <Search className="w-8 h-8 text-gray-400 group-hover:text-gold-500 transition-colors" />
                </div>
                <h3 className="font-heading font-bold text-white mb-2 text-xl group-hover:text-gold-500 transition-colors">View on Polygonscan</h3>
                <span className="text-sm text-gray-500 flex items-center gap-1 group-hover:text-gray-300 transition-colors">
                    Check Holders & Transfers <ExternalLink className="w-3 h-3" />
                </span>
            </a>

            <a href={`https://polygonscan.com/address/${CONTRACT_ADDRESS}#code`} target="_blank" rel="noopener noreferrer"
               className="group flex flex-col items-center justify-center p-8 glass-card rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-gold-500/10 transition-colors">
                    <Code className="w-8 h-8 text-gray-400 group-hover:text-gold-500 transition-colors" />
                </div>
                <h3 className="font-heading font-bold text-white mb-2 text-xl group-hover:text-gold-500 transition-colors">Read Source Code</h3>
                <span className="text-sm text-gray-500 flex items-center gap-1 group-hover:text-gray-300 transition-colors">
                    Verify Contract Logic <ExternalLink className="w-3 h-3" />
                </span>
            </a>
        </div>

        <div className="mt-12 p-8 glass-panel border-l-4 border-l-blue-500 rounded-r-xl relative overflow-hidden text-left">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
            <h3 className="text-blue-400 font-heading font-bold mb-3 text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Ownership Status
            </h3>
            <p className="text-gray-300 text-base leading-relaxed">
                The contract ownership has been renounced/locked (check transaction hash). This means the developer cannot modify the contract, mint new tokens, or pause trading.
            </p>
        </div>

      </div>
    </div>
  );
}
