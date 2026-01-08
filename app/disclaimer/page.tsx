import type { Metadata } from 'next';
import { AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Disclaimer - Block21',
  description: 'Legal disclaimer and risk warning for Block21.',
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
            <h1 className="text-3xl font-heading font-black text-white">Disclaimer & Risk Warning</h1>
        </div>

        <div className="space-y-8 text-gray-400 leading-relaxed">
            <section className="glass-panel p-8 hover:bg-white/5 transition-colors">
                <h2 className="text-xl font-heading font-bold text-white mb-3">No Investment Advice</h2>
                <p>
                    The information provided on this website does not constitute investment advice, financial advice, trading advice, or any other sort of advice and you should not treat any of the website's content as such. The Block21 team does not recommend that you buy, sell, or hold any cryptocurrency. Do conduct your own due diligence and consult your financial advisor before making any investment decisions.
                </p>
            </section>

            <section className="glass-panel p-8 hover:bg-white/5 transition-colors">
                <h2 className="text-xl font-heading font-bold text-white mb-3">No Guarantees</h2>
                <p>
                    Block21 (B21) is an experimental digital token. There are no guarantees of value, profit, or stability. The token may have no value. You should only participate if you are willing to lose the entire amount of your participation.
                </p>
            </section>

            <section id="fair-launch" className="glass-panel p-8 hover:bg-white/5 transition-colors">
                <h2 className="text-xl font-heading font-bold text-white mb-3">Fair Launch</h2>
                <p>
                    Block21 was launched without ICO or presale. No privileged allocations and no admin keys after renounce. Initial liquidity was minimal and market-driven discovery applies. Participation is open and transparent.
                </p>
            </section>

            <section className="glass-panel p-8 hover:bg-white/5 transition-colors">
                <h2 className="text-xl font-heading font-bold text-white mb-3">Regulatory Compliance</h2>
                <p>
                    By purchasing B21, you agree that you are not purchasing a security or investment contract and you agree to hold the team harmless and not liable for any losses or taxes you may incur. You also agree that the team is presenting the token "as is" and is not required to provide any support or services. You should verify that your participation is compliant with local laws and regulations.
                </p>
            </section>

            <section className="glass-panel p-8 hover:bg-white/5 transition-colors">
                <h2 className="text-xl font-heading font-bold text-white mb-3">Market Risks</h2>
                <p>
                    Crypto assets are highly volatile. The price of Block21 can go up or down significantly. You assume full responsibility for any risks associated with the use of the Block21 website and token.
                </p>
            </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-sm text-gray-500 text-center">
            Last updated: January 2026
        </div>

      </div>
    </div>
  );
}
