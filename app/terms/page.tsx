import type { Metadata } from 'next';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service - Block21',
  description: 'Terms of Service for Block21.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-8">
            <h1 className="text-4xl font-heading font-black text-white mb-4">Terms of Service</h1>
            <p className="text-gray-400 text-sm">Last Updated: January 2026</p>
        </div>

        <div className="space-y-8 text-gray-300 leading-relaxed">
            <section className="glass-panel p-8">
                <h2 className="text-xl font-heading font-bold text-white mb-4">1. Acceptance of Terms</h2>
                <p>
                    By accessing or using the Block21 website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
            </section>

            <section className="glass-panel p-8">
                <h2 className="text-xl font-heading font-bold text-white mb-4">2. Description of Service</h2>
                <p>
                    Block21 is a decentralized project on the Polygon blockchain. We provide a website interface to interact with the Block21 smart contracts. You understand that the website is merely an interface and we do not control the blockchain.
                </p>
            </section>

            <section className="glass-panel p-8">
                <h2 className="text-xl font-heading font-bold text-white mb-4">3. Risks</h2>
                <p>
                    You acknowledge that using cryptocurrency and blockchain technology involves significant risks, including but not limited to market volatility, technical glitches, and regulatory uncertainty. You agree to assume all such risks.
                </p>
            </section>

            <section className="glass-panel p-8">
                <h2 className="text-xl font-heading font-bold text-white mb-4">4. No Financial Advice</h2>
                <p>
                    The content provided on this website is for informational purposes only and does not constitute financial, investment, or legal advice. You should conduct your own research before making any decisions.
                </p>
            </section>

            <section className="glass-panel p-8">
                <h2 className="text-xl font-heading font-bold text-white mb-4">5. Limitation of Liability</h2>
                <p>
                    To the maximum extent permitted by law, Block21 shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
                </p>
            </section>

             <section className="glass-panel p-8">
                <h2 className="text-xl font-heading font-bold text-white mb-4">6. Modifications</h2>
                <p>
                    We reserve the right to modify these terms at any time. We will notify users of any changes by updating the "Last Updated" date of these Terms of Service.
                </p>
            </section>
        </div>

      </div>
    </div>
  );
}
