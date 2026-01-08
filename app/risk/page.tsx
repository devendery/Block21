import type { Metadata } from 'next';
import { AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Risk Disclosure - Block21',
  description: 'Detailed risk disclosure for Block21 participants.',
};

export default function RiskPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-8 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-4xl font-heading font-black text-white">Risk Disclosure</h1>
        </div>

        <div className="space-y-6 text-gray-300 leading-relaxed">
            <p className="text-lg text-gray-400">
                Please read this risk disclosure carefully before participating in the Block21 ecosystem.
            </p>

            <section className="glass-panel p-8 border-l-4 border-l-red-500">
                <h2 className="text-xl font-heading font-bold text-white mb-4">1. Volatility Risk</h2>
                <p>
                    The price of digital assets, including B21, is extremely volatile and may fluctuate significantly in short periods. You may lose all or a substantial portion of your contribution.
                </p>
            </section>

            <section className="glass-panel p-8">
                <h2 className="text-xl font-heading font-bold text-white mb-4">2. Regulatory Risk</h2>
                <p>
                    The regulatory status of cryptographic tokens and blockchain technology is unclear or unsettled in many jurisdictions. Changes in laws and regulations may impact the utility, transferability, or value of B21.
                </p>
            </section>

            <section className="glass-panel p-8">
                <h2 className="text-xl font-heading font-bold text-white mb-4">3. Technology Risk</h2>
                <p>
                    Block21 relies on the Polygon blockchain and smart contracts. While we strive for security, there are inherent risks of software bugs, vulnerabilities, or network attacks that could lead to the loss of funds.
                </p>
            </section>

            <section className="glass-panel p-8">
                <h2 className="text-xl font-heading font-bold text-white mb-4">4. Adoption Risk</h2>
                <p>
                    The success of Block21 depends on the adoption of its ecosystem and utility. There is no guarantee that the project will achieve its goals or that there will be sufficient demand for the token.
                </p>
            </section>

            <section className="glass-panel p-8">
                <h2 className="text-xl font-heading font-bold text-white mb-4">5. Private Key Risk</h2>
                <p>
                    You are solely responsible for the security of your private keys and wallet. If you lose access to your wallet, you may lose access to your B21 tokens permanently.
                </p>
            </section>
        </div>

      </div>
    </div>
  );
}
