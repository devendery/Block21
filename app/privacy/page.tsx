import type { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - Block21',
  description: 'Privacy Policy for Block21.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-8">
            <h1 className="text-4xl font-heading font-black text-white mb-4">Privacy Policy</h1>
            <p className="text-gray-400 text-sm">Last Updated: January 2026</p>
        </div>

        <div className="space-y-8 text-gray-300 leading-relaxed">
            <section className="glass-panel p-8">
                <h2 className="text-xl font-heading font-bold text-white mb-4">1. Introduction</h2>
                <p>
                    Block21 ("we", "our", or "us") respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you visit our website or use our services.
                </p>
            </section>

            <section className="glass-panel p-8">
                <h2 className="text-xl font-heading font-bold text-white mb-4">2. Information We Collect</h2>
                <p className="mb-4">
                    As a decentralized application (dApp), we collect minimal personal information. We may collect:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                    <li><strong>Blockchain Data:</strong> Public wallet addresses and transaction data interactions with our smart contracts.</li>
                    <li><strong>Usage Data:</strong> Anonymous analytics data (e.g., page views) to improve our website performance.</li>
                    <li><strong>Communication Data:</strong> Email address if you voluntarily subscribe to our newsletter.</li>
                </ul>
            </section>

            <section className="glass-panel p-8">
                <h2 className="text-xl font-heading font-bold text-white mb-4">3. How We Use Your Information</h2>
                <p>
                    We use the collected information to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400 mt-2">
                    <li>Provide and maintain our services.</li>
                    <li>Monitor the usage of our website.</li>
                    <li>Detect, prevent, and address technical issues.</li>
                    <li>Communicate with you (if you opted in).</li>
                </ul>
            </section>

            <section className="glass-panel p-8">
                <h2 className="text-xl font-heading font-bold text-white mb-4">4. Third-Party Services</h2>
                <p>
                    We may use third-party services (e.g., analytics providers, wallet connectors) that may collect information used to identify you. Please refer to their respective privacy policies.
                </p>
            </section>

            <section className="glass-panel p-8">
                <h2 className="text-xl font-heading font-bold text-white mb-4">5. Security</h2>
                <p>
                    We value your trust in providing us your information, but remember that no method of transmission over the internet or method of electronic storage is 100% secure.
                </p>
            </section>
        </div>

      </div>
    </div>
  );
}
