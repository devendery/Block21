"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { ethers } from "ethers";
import { ArrowDown, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { B21_CONTRACT_ADDRESS } from "@/lib/utils";
import B21Coin from "@/components/ui/B21Coin";

declare global {
    interface Window {
        ethereum?: any;
    }
}

// User-defined Treasury Wallet (Deployer)
import { OWNER_WALLET_ADDRESS } from "@/lib/utils";
const TREASURY_WALLET = OWNER_WALLET_ADDRESS;

const B21_PRICE_USD = 0.006; // Fixed Price
const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // USDT on Polygon

// ERC20 ABI for Transfer
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)"
];

export default function SwapWidget() {
  const { address, isConnected, connectWallet } = useWallet();
  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [usdtBalance, setUsdtBalance] = useState("0");

  useEffect(() => {
    if (isConnected && address) {
        fetchUsdtBalance();
    }
  }, [isConnected, address]);

  const fetchUsdtBalance = async () => {
    try {
        if (typeof window !== "undefined" && window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, provider);
            const balance = await contract.balanceOf(address);
            setUsdtBalance(ethers.formatUnits(balance, 6)); // USDT has 6 decimals
        }
    } catch (e) {
        console.error("Error fetching USDT balance", e);
    }
  };

  const handlePayChange = (val: string) => {
    setPayAmount(val);
    if (!val || isNaN(Number(val))) {
      setReceiveAmount("");
      return;
    }
    const usdValue = Number(val); // USDT is 1:1 USD
    const b21Tokens = usdValue / B21_PRICE_USD;
    setReceiveAmount(b21Tokens.toFixed(2));
  };

  const handleBuy = async () => {
    if (!isConnected) {
        connectWallet();
        return;
    }
    
    if (!payAmount || Number(payAmount) <= 0) {
        setStatus("Please enter a valid amount.");
        return;
    }

    setLoading(true);
    setStatus(null);

    try {
        if (typeof window !== "undefined" && window.ethereum) {
             const provider = new ethers.BrowserProvider(window.ethereum);
             const signer = await provider.getSigner();
             
             // Create USDT Contract Instance
             const usdtContract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, signer);

             // Calculate amount in Wei (USDT has 6 decimals)
             const amountInWei = ethers.parseUnits(payAmount, 6);

             // Send USDT
             setStatus("Please confirm the transaction in your wallet...");
             const tx = await usdtContract.transfer(TREASURY_WALLET, amountInWei);
             
             setStatus("Transaction Sent! Waiting for confirmation...");
             await tx.wait();
             
             setStatus("Success! USDT sent. Tokens will be airdropped shortly.");
             setPayAmount("");
             setReceiveAmount("");
             fetchUsdtBalance(); // Refresh balance
        }
    } catch (err: any) {
        console.error(err);
        setStatus("Transaction Failed: " + (err.reason || err.message || "Unknown error"));
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-900 border border-gold-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl -z-10" />

      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-xl text-white">Buy B21</h3>
        <button className="text-gray-500 hover:text-white" onClick={fetchUsdtBalance}>
            <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-700/30 p-3 rounded-lg mb-4 flex items-start gap-2">
         <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
         <p className="text-xs text-yellow-200">
            <strong>Presale Mode:</strong> You are sending USDT directly to the Treasury. B21 tokens will be sent to your wallet manually by the admin after verification.
         </p>
      </div>

      {/* Pay Section */}
      <div className="bg-black/50 p-4 rounded-xl mb-2 border border-gray-800 focus-within:border-gold-500 transition-colors">
        <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400">You pay</span>
            <span className="text-xs text-gray-500">Balance: {parseFloat(usdtBalance).toFixed(2)} USDT</span>
        </div>
        <div className="flex justify-between items-center">
            <input 
                type="number" 
                placeholder="0" 
                value={payAmount}
                onChange={(e) => handlePayChange(e.target.value)}
                className="bg-transparent text-2xl font-bold text-white outline-none w-full placeholder-gray-600"
            />
            <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                <img src="https://cryptologos.cc/logos/tether-usdt-logo.png?v=025" alt="USDT" className="w-5 h-5" />
                <span className="font-bold text-sm">USDT</span>
            </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center -my-3 relative z-10">
        <div className="bg-gray-800 p-2 rounded-full border border-gray-700">
            <ArrowDown className="h-4 w-4 text-gold-500" />
        </div>
      </div>

      {/* Receive Section */}
      <div className="bg-black/50 p-4 rounded-xl mb-6 border border-gray-800 mt-2">
        <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400">You receive</span>
            <span className="text-xs text-gray-500">Price: $0.006 (Fixed)</span>
        </div>
        <div className="flex justify-between items-center">
            <input 
                type="text" 
                value={receiveAmount}
                readOnly
                className="bg-transparent text-2xl font-bold text-white outline-none w-full placeholder-gray-600"
                placeholder="0"
            />
             <div className="flex items-center gap-2 bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/30 h-8">
                <span className="inline-flex items-center relative scale-[0.3] origin-center w-[24px] justify-center">
                    <span className="relative inline-flex items-center justify-center">
                        <span className="relative z-10 text-[#FFD700] text-5xl drop-shadow-[0_0_15px_rgba(212,175,55,0.9)] font-serif italic font-bold tracking-wider">B</span>
                        <span className="absolute inset-0 flex items-center justify-center pointer-events-none gap-[5px] rotate-[12deg]">
                            <span className="w-[3px] h-[95%] bg-[#FFD700] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.3)]"></span>
                            <span className="w-[3px] h-[95%] bg-[#FFD700] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.3)]"></span>
                        </span>
                    </span>
                    <span className="text-[#FFD700] text-3xl font-black ml-1 drop-shadow-[0_0_15px_rgba(212,175,55,0.9)]">21</span>
                </span>
                <span className="font-bold text-sm text-gold-500">B21</span>
            </div>
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={handleBuy}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-black text-lg rounded-xl transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin" /> : "Buy with USDT"}
      </button>

      {status && (
        <div className={`mt-4 p-3 rounded-lg text-sm text-center font-medium ${status.includes("Success") ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            {status}
        </div>
      )}

    </div>
  );
}
