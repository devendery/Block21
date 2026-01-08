import type { Metadata } from 'next';
import { ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: 'Investor Concern & Consent - Block21',
  description: 'Review the terms of participation and express your concern/interest in the Block21 ecosystem.',
};

export default function ConcernPage() {
  return (
    <div className="min-h-screen bg-transparent pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        
        <div className="glass-card p-8 md:p-12 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-8 flex items-center gap-4">
                <ShieldCheck className="w-12 h-12 text-gold-500" />
                Investor Concern & Consent
            </h1>

            <div className="space-y-8 text-gray-300 leading-relaxed">
                
                <section className="glass-panel p-6 border-l-4 border-l-orange-500">
                    <h2 className="text-xl font-heading font-bold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        Nature of Participation
                    </h2>
                    <p>
                        By participating in the initial distribution of Block21 (B21), you acknowledge that this is a voluntary contribution to a social experiment and decentralized ecosystem. 
                        You understand that B21 is a fixed-supply digital asset with no central authority, no guaranteed value, and no promise of future returns.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-heading font-bold text-white mb-4">Expression of Concern</h2>
                    <p className="mb-4">
                        The term "Concern" in this context refers to your active interest and stake in the success of the Block21 network. 
                        As an initial investor, you are not just buying a token; you are signaling your support for:
                    </p>
                    <ul className="space-y-3 pl-4">
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                            <span><strong>Fair Distribution:</strong> A launch with no pre-mine for founders and no hidden allocations.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                            <span><strong>Market Discovery:</strong> Allowing the market to determine the value of the asset from a low initial starting point.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                            <span><strong>Decentralization:</strong> Supporting a protocol that is immutable and code-governed.</span>
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-heading font-bold text-white mb-4">Risk Acknowledgment</h2>
                    <p className="mb-4">
                        You confirm that you have read and understood the risks associated with cryptocurrency investments, including but not limited to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-400">
                        <li><strong>Volatility Risk:</strong> The value of B21 may fluctuate significantly.</li>
                        <li><strong>Regulatory Risk:</strong> Changes in laws and regulations may impact the project.</li>
                        <li><strong>Technical Risk:</strong> Smart contract vulnerabilities (though audited/verified) or blockchain network issues.</li>
                    </ul>
                </section>

                <section className="glass-panel p-6 bg-gold-500/5 border-gold-500/20">
                    <h2 className="text-xl font-heading font-bold text-gold-500 mb-4">Final Consent</h2>
                    <p className="text-white font-medium italic">
                        "I express my interest to participate in the initial distribution of Block21. I understand that my contribution is voluntary and acknowledges my support for the project's vision. I confirm that this transaction represents my consent and concern to be an initial holder."
                    </p>
                </section>

            </div>
        </div>

      </div>
    </div>
  );
}
