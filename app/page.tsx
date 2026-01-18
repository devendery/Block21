import type { Metadata } from 'next';
import HeroSection from '@/components/homepage/HeroSection';
import UnifiedTrustSection from '@/components/homepage/UnifiedTrustSection';

export const metadata: Metadata = { 
  title: 'Block21 - Time Value', 
  description: 'No ICO. No Pre-Sale. Just 2.1M fixed supply and complete transparency. The digital asset built on Bitcoin philosophy and Polygon efficiency.', 
}; 

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <main className="pt-16 relative z-10">
        <section className="relative pt-20 pb-20 px-4 overflow-hidden">
          <HeroSection />
        </section>

        <UnifiedTrustSection />
      </main>

    </div>
  );
}
