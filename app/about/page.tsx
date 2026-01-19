import type { Metadata } from 'next';
import { Info, Target, Users, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us - Block21',
  description: 'Learn about the mission, vision, and team behind Block21.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-12 text-center">
            <h1 className="text-5xl font-heading font-black text-white mb-6">About Block21</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Redefining decentralized gaming and tokenomics on the Polygon network.
            </p>
        </div>

        <div className="space-y-12">
            {/* Mission Section */}
            <section className="glass-panel p-8 md:p-12 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <Target className="w-8 h-8 text-primary" />
                        <h2 className="text-3xl font-heading font-bold text-white">Our Mission</h2>
                    </div>
                    <p className="text-gray-300 leading-relaxed text-lg">
                        Block21 (B21) was born from a desire to create a truly fair and decentralized digital asset. Unlike traditional crypto projects that rely on ICOs or pre-sales, B21 is distributed entirely through merit and participation. Our mission is to build a sustainable ecosystem where value is driven by gameplay, community engagement, and transparent mechanics.
                    </p>
                </div>
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            </section>

            {/* What is Block21 Section */}
            <div className="grid md:grid-cols-2 gap-8">
                <section className="glass-panel p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Zap className="w-6 h-6 text-yellow-400" />
                        <h2 className="text-2xl font-heading font-bold text-white">The Token (B21)</h2>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                        B21 is an ERC-20 token on the Polygon blockchain with a strict fixed supply of 2.1 million tokens. It serves as the lifeblood of our ecosystem, used for in-game transactions, rewards, and governance. With no inflation and a deflationary burn mechanism, B21 is designed for long-term scarcity.
                    </p>
                </section>

                <section className="glass-panel p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Users className="w-6 h-6 text-blue-400" />
                        <h2 className="text-2xl font-heading font-bold text-white">The Community</h2>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                        We believe in community-first development. Block21 is not owned by a corporation but is a collaborative effort of developers, gamers, and crypto enthusiasts. Every player has a voice, and the direction of the project is shaped by those who participate in it.
                    </p>
                </section>
            </div>

            {/* The Game Section */}
            <section className="glass-panel p-8 md:p-12">
                <div className="flex items-center gap-3 mb-6">
                    <Info className="w-8 h-8 text-green-400" />
                    <h2 className="text-3xl font-heading font-bold text-white">The Game</h2>
                </div>
                <div className="prose prose-invert max-w-none text-gray-300">
                    <p className="mb-4">
                        Our flagship game, <strong>Block21 Arena</strong>, is a skill-based "eat-to-grow" survival game. It demonstrates the utility of the B21 token in real-time.
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Skill-Based:</strong> Success depends on your reflexes and strategy, not your wallet size.</li>
                        <li><strong>Fair Economy:</strong> Earn B21 by competing in tournaments and completing challenges.</li>
                        <li><strong>Ad-Supported Rewards:</strong> We use revenue from non-intrusive ads to buy back and burn tokens, supporting the ecosystem's value.</li>
                    </ul>
                </div>
            </section>
        </div>

      </div>
    </div>
  );
}
