"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Logo from "./Logo";
import WalletConnect from "./WalletConnect";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Game", href: "/game" },
  { name: "Learn", href: "/learn" },
  { name: "Tokenomics", href: "/tokenomics" },
  { name: "Release Policy", href: "/release-policy" },
  { name: "Roadmap", href: "/roadmap" },
  { name: "Pitch deck", href: "/pitch" },
  { name: "Transparency", href: "/transparency" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b border-white/10 sticky top-0 z-50 bg-black/60 backdrop-blur-md overflow-hidden relative">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" aria-label="Go to homepage" className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary rounded-md">
              <Logo className="h-auto w-auto" />
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
                    pathname === item.href
                      ? "text-primary bg-gray-900"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:block">
             <WalletConnect />
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black border-b border-gray-800">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary",
                  pathname === item.href
                    ? "text-primary bg-gray-900"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
