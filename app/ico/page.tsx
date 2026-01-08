import type { Metadata } from 'next'; 
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'No ICO — Fair Launch', 
  description: 'Block21 launched without ICO or presale. No initial distribution.', 
}; 
 
export default function ICOPage() { 
  return ( 
    <> 
      <div className="min-h-screen bg-transparent">
        <main className="pt-32 pb-16 px-4"> 
            <div className="container mx-auto max-w-2xl text-center"> 
                <div className="glass-panel rounded-sm p-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-gold/10 mb-6">
                        <AlertCircle className="w-8 h-8 text-brand-gold" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">No ICO — Fair Launch</h1>
                    <p className="text-brand-gray mb-8 text-base">
                        Block21 was launched without ICO or presale. There is no active initial distribution. Please use decentralized markets for live trading availability.
                    </p>
                    <Link 
                        href="/market"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-brand-gold hover:bg-[#B89640] text-brand-charcoal font-bold rounded-sm transition-all font-heading"
                    >
                        View Market
                    </Link>
                </div>
            </div> 
        </main> 
      </div>
    </> 
  ); 
}
