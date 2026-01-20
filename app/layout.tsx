import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import InteractiveGridBackground from '@/components/InteractiveGridBackground';
import Web3Providers from "@/components/providers/Web3Providers";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700'], 
  variable: '--font-space' 
});

export const metadata: Metadata = {
  title: 'Block21 (B21) | Decentralized Token',
  description: 'A decentralized, optional participation token on Polygon.',
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: '/images/logo-obsidian-sovereign.svg',
    shortcut: '/images/logo-obsidian-sovereign.svg',
    apple: '/images/logo-obsidian-sovereign.svg',
  },
  other: {
    'google-adsense-account': 'ca-pub-2028888236344019',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const enableAds = process.env.NODE_ENV === "production" && Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID);
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable} font-sans flex flex-col min-h-screen bg-transparent text-foreground relative`}>
        {enableAds && (
          <Script
            id="google-adsense"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        )}
        <InteractiveGridBackground />
        <div className="bg-tech opacity-30" aria-hidden="true" />
        <Web3Providers>
          <Navbar />
          <main className="flex-grow relative z-10">{children}</main>
          <Footer />
        </Web3Providers>
      </body>
    </html>
  );
}
