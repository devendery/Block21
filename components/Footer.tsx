"use client";

import Link from "next/link";
import Logo from "./Logo";
import InstitutionalB21Logo from "@/components/ui/InstitutionalB21Logo";
import { Instagram, AtSign, Send, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { GOOGLE_SCRIPT_URL } from "@/lib/utils";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      return;
    }

    setStatus("loading");
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "subscribe",
          email: email,
          timestamp: new Date().toISOString()
        }),
      });
      setStatus("success");
      setEmail("");
    } catch (error) {
      console.error("Subscription failed:", error);
      setStatus("error");
    }
  };

  return (
    <footer className="border-t border-red-900/30 pt-24 pb-14 relative overflow-hidden bg-gradient-to-r from-black via-zinc-900 to-black backdrop-blur-md">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Brand */}
            <div>
                <Link href="/" className="flex items-center gap-3 mb-8 group">
                    <Logo />
                </Link>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    No ICO. No Pre-Sale. Just 2.1M fixed supply and complete transparency. The digital asset built on Bitcoin philosophy and Polygon efficiency.
                </p>
                <div className="flex items-center gap-4">
                    <a aria-label="X (Twitter)" href="https://x.com/Block20One" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-600 transition-all group focus:outline-none focus:ring-2 focus:ring-primary">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 group-hover:scale-110 transition-transform">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </a>
                    <a aria-label="Instagram" href="https://instagram.com/block20one" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-600 transition-all group focus:outline-none focus:ring-2 focus:ring-primary">
                        <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </a>
                    <a aria-label="Threads" href="https://www.threads.net/@block20one" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-600 transition-all group focus:outline-none focus:ring-2 focus:ring-primary">
                        <AtSign className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </a>
                    <a aria-label="Telegram" href="https://t.me/block20one" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-600 transition-all group focus:outline-none focus:ring-2 focus:ring-primary">
                        <Send className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </a>
                </div>
            </div>

            {/* Platform */}
            <div>
                <h4 className="font-heading font-bold text-white mb-6">Platform</h4>
                <ul className="space-y-4 text-sm text-gray-400">
                    <li><Link href="/" className="hover:text-primary transition-colors">Homepage</Link></li>
                    <li><Link href="/market" className="hover:text-primary transition-colors">Market</Link></li>
                    <li><Link href="/release-policy" className="hover:text-primary transition-colors">Release Policy</Link></li>
                    <li><Link href="/roadmap" className="hover:text-primary transition-colors">Roadmap</Link></li>
                    <li><Link href="/tokenomics" className="hover:text-primary transition-colors">Tokenomics</Link></li>
                    <li><Link href="/transparency" className="hover:text-primary transition-colors">Transparency</Link></li>
                </ul>
            </div>

            {/* Resources */}
            <div>
                <h4 className="font-heading font-bold text-white mb-6">Resources</h4>
                <ul className="space-y-4 text-sm text-gray-400">
                    <li><Link href="/disclaimer" className="hover:text-primary transition-colors">Disclaimer</Link></li>
                    <li><Link href="/learn" className="hover:text-primary transition-colors">Education</Link></li>
                    <li><Link href="/verify" className="hover:text-primary transition-colors">Verify contract</Link></li>
                </ul>
            </div>

            {/* Stay Updated */}
            <div>
                <h4 className="font-heading font-bold text-white mb-6">Stay updated</h4>
                <p className="text-gray-400 text-sm mb-4">Get the latest updates on platform developments and market milestones.</p>
                <div className="relative">
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email" 
                        disabled={status === "success" || status === "loading"}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg py-3 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                    />
                    <button 
                        onClick={handleSubscribe}
                        disabled={status === "success" || status === "loading"}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center text-black transition-colors ${status === "success" ? "bg-green-500 cursor-default" : "bg-primary hover:bg-white"}`}
                    >
                        {status === "loading" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : status === "success" ? (
                            <CheckCircle2 className="w-4 h-4 text-black" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </div>
                {status === "success" && (
                    <p className="text-green-500 text-xs mt-2">Successfully Subscribed!</p>
                )}
            </div>

        </div>

        <div className="border-t border-red-700/40 pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-red-200/80">
            <p>&copy; 2026 Block21. All rights reserved.</p>
            <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-white">Terms of Service</Link>
                <Link href="/risk" className="hover:text-white">Risk Disclaimer</Link>
                <Link href="/concern" className="hover:text-white">Concern</Link>
            </div>
        </div>

      </div>
    </footer>
  );
}
