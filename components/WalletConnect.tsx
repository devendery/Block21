"use client";

import { useWallet } from "@/hooks/useWallet";
import { Wallet } from "lucide-react";

export default function WalletConnect() {
  const { address, isConnected, connectWallet, disconnectWallet } = useWallet();

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-2 bg-gray-900 px-4 py-2 rounded-full border border-gray-700">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-mono text-gray-300">{shortenAddress(address)}</span>
        <button
          onClick={disconnectWallet}
          className="ml-2 text-xs text-gray-400 hover:text-red-500"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      className="flex items-center space-x-2 bg-primary hover:bg-orange-600 text-white px-3 py-1 rounded-full font-medium transition-all text-sm"
    >
      <Wallet className="h-4 w-4" />
      <span>Connect Wallet</span>
    </button>
  );
}
