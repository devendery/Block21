"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { Loader2, ShieldCheck, CheckCircle2, Copy, AlertTriangle, ArrowRight, Wallet, ChevronLeft, PenTool, Info } from "lucide-react";
import { GOOGLE_SCRIPT_URL } from "@/lib/utils";

const TREASURY_WALLET = "0x7A085FC48397bC0020F9e3979F2061B53F87eC1c"; 

interface ParticipationFormProps {
  price: number;
  minBuy?: number;
  maxBuy?: number;
  onSuccess?: () => void;
}

const STEPS = [
    { number: 1, title: "Amount", icon: PenTool },
    { number: 2, title: "Connect", icon: Wallet },
    { number: 3, title: "Sign", icon: ShieldCheck }
];

export default function ParticipationForm({ price, minBuy = 10, maxBuy = 100, onSuccess }: ParticipationFormProps) {
  const { isConnected, address, connectWallet, signMessage } = useWallet();
  const [amount, setAmount] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [manualWallet, setManualWallet] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  // Use connected address if available, otherwise manual input
  useEffect(() => {
    if (isConnected && address) {
      setManualWallet(address);
    }
  }, [isConnected, address]);

  // Calculate tokens based on input amount (USD)
  const tokenAmount = amount ? (parseFloat(amount) / price).toLocaleString('en-US', { maximumFractionDigits: 2 }) : "0";

  const handleNext = () => {
      setStatus(null);
      if (currentStep === 1) {
          if (!amount || parseFloat(amount) <= 0) {
              setStatus("Please enter a valid amount.");
              return;
          }
          if (parseFloat(amount) < minBuy) {
              setStatus(`Minimum purchase is $${minBuy}.`);
              return;
          }
          if (parseFloat(amount) > maxBuy) {
              setStatus(`Maximum purchase is $${maxBuy}.`);
              return;
          }
          setCurrentStep(2);
      } else if (currentStep === 2) {
          if (!manualWallet) {
              setStatus("Please connect your wallet or enter address.");
              return;
          }
          setCurrentStep(3);
      }
  };

  const handleBack = () => {
      setStatus(null);
      if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!txHash) {
        setStatus("Please enter the transaction hash.");
        return;
    }
    
    setLoading(true);
    setStatus("Waiting for wallet signature...");

    try {
        let signature = "Manual Consent";
        
        // Try to sign if wallet is connected
        if (isConnected) {
            try {
                const message = `I confirm that I am participating in Block21 voluntarily.
Timestamp: ${new Date().toISOString()}
Wallet: ${manualWallet}
Amount: ${amount} USDT
TxHash: ${txHash}`;
                signature = await signMessage(message);
            } catch (signError: any) {
                setLoading(false);
                setStatus("Signature rejected. Please sign to proceed.");
                return;
            }
        } else {
             // Enforce wallet connection for signature as per "more good" user request
             try {
                await connectWallet();
                setStatus("Please connect wallet to sign consent.");
                setLoading(false);
                return;
             } catch (e) {
                 setLoading(false);
                 return;
             }
        }

      setStatus("Submitting registration...");

      // Send data to Google Sheet
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // specific for Google Apps Script
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet: manualWallet,
          usdtAmount: amount,
          tokenAmount: tokenAmount,
          txHash: txHash,
          consent: true,
          signature: signature,
          timestamp: new Date().toISOString()
        }),
      });

      setIsSuccess(true);
      setStatus("Registration submitted successfully!");
      if (onSuccess) onSuccess();
      
    } catch (err: any) {
      console.error(err);
      setStatus("Failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Address copied to clipboard!");
  };

  if (isSuccess) {
    return (
      <div className="glass-card p-8 text-center relative rounded-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-4">Registration Received</h3>
        
        <div className="glass-panel p-6 mb-8 text-left">
          <p className="text-gray-400 text-sm mb-2">Details Recorded:</p>
          <div className="space-y-2 text-sm text-gray-300">
             <div className="flex justify-between">
                 <span>Amount:</span>
                 <span className="text-white font-mono">{amount} USDT</span>
             </div>
             <div className="flex justify-between">
                 <span>Transaction Hash:</span>
                 <span className="text-white font-mono">{txHash.slice(0, 6)}...{txHash.slice(-4)}</span>
             </div>
             <div className="flex justify-between">
                 <span>Wallet:</span>
                 <span className="text-white font-mono">{manualWallet.slice(0, 6)}...{manualWallet.slice(-4)}</span>
             </div>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-8">
          We have received your details. Once the transaction is verified on the blockchain, your B21 tokens will be sent to your wallet.
        </p>

        <button 
          onClick={() => {
            setIsSuccess(false);
            setCurrentStep(1);
            setAmount("");
            setTxHash("");
            setStatus(null);
          }}
          className="text-gold-500 hover:text-white font-medium transition-colors"
        >
          Submit another registration
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 md:p-8 relative rounded-2xl flex flex-col min-h-[500px]">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex justify-between items-center mb-8 relative z-10">
            <h3 className="text-xl md:text-2xl font-heading font-bold text-white">
                Initial Investor Registration
            </h3>
            {/* Step Indicator */}
            <div className="flex items-center gap-2">
                {STEPS.map((s) => (
                    <div key={s.number} className={`w-2.5 h-2.5 rounded-full transition-all ${currentStep >= s.number ? 'bg-gold-500' : 'bg-gray-700'}`} />
                ))}
            </div>
        </div>

        {/* Wizard Progress */}
        <div className="flex justify-between mb-8 relative z-10">
            {STEPS.map((s, i) => (
                <div key={s.number} className={`flex flex-col items-center gap-2 ${currentStep === s.number ? 'opacity-100' : 'opacity-40'} transition-opacity`}>
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        currentStep === s.number ? 'border-gold-500 text-gold-500 bg-gold-500/10' : 
                        currentStep > s.number ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-gray-700 text-gray-500'
                    }`}>
                        <s.icon className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <span className="hidden md:block text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-400">{s.title}</span>
                </div>
            ))}
            {/* Connecting Lines */}
            <div className="absolute top-4 md:top-5 left-0 w-full h-0.5 bg-gray-800 -z-10" />
            <div className="absolute top-4 md:top-5 left-0 h-0.5 bg-gold-500 transition-all duration-500 -z-10" style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }} />
        </div>
        
        <div className="flex-1 relative z-10">
            {status && (
                <div className={`p-4 rounded-lg mb-6 flex items-start gap-3 ${status.includes("Failed") || status.includes("Please") ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{status}</p>
                </div>
            )}

            {/* Step 1: Amount */}
            {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2 font-bold uppercase tracking-wide">Enter Amount (USDT)</label>
                        <div className="relative group">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:border-gold-500/50 transition-colors group-hover:border-white/20"
                                placeholder="0.00"
                                autoFocus
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">USDT</span>
                        </div>
                        <div className="mt-3 flex justify-between items-center">
                            <span className="text-xs text-gray-500">Min: ${minBuy} • Max: ${maxBuy}</span>
                            <span className="text-sm font-bold text-gold-500">≈ {tokenAmount} B21</span>
                        </div>
                    </div>
                    
                    <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4">
                        <p className="text-xs text-yellow-500/80 leading-relaxed">
                            <Info className="w-3 h-3 inline mr-1" />
                            By continuing, you acknowledge that this is a fixed allocation round. Tokens will be distributed to your wallet after transaction verification.
                        </p>
                    </div>
                </div>
            )}

            {/* Step 2: Wallet */}
            {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2 font-bold uppercase tracking-wide">Connect Wallet</label>
                        {!isConnected ? (
                            <button 
                                onClick={connectWallet}
                                className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all border border-gray-700 flex items-center justify-center gap-2 group"
                            >
                                <Wallet className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Connect MetaMask / WalletConnect
                            </button>
                        ) : (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-green-400">Wallet Connected</div>
                                    <div className="text-xs text-gray-400 font-mono">{manualWallet}</div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0A0A0A] px-2 text-gray-500">Or enter manually</span>
                        </div>
                    </div>

                    <div>
                         <input
                            type="text"
                            value={manualWallet}
                            onChange={(e) => setManualWallet(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-colors font-mono"
                            placeholder="0x..."
                        />
                    </div>
                </div>
            )}

            {/* Step 3: Sign & Confirm */}
            {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Purchase Amount</span>
                            <span className="text-white font-bold">{amount} USDT</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Tokens to Receive</span>
                            <span className="text-gold-500 font-bold">{tokenAmount} B21</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Wallet</span>
                            <span className="text-white font-mono text-xs">{manualWallet.slice(0, 6)}...{manualWallet.slice(-4)}</span>
                        </div>
                     </div>

                     <div>
                        <label className="block text-sm text-gray-400 mb-2 font-bold uppercase tracking-wide">Payment Transaction Hash</label>
                        <p className="text-xs text-gray-500 mb-2">Send {amount} USDT to <span className="text-gold-500 cursor-pointer hover:underline" onClick={() => copyToClipboard(TREASURY_WALLET)}>Treasury Wallet</span> and paste hash below.</p>
                        <input
                            type="text"
                            value={txHash}
                            onChange={(e) => setTxHash(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-colors font-mono"
                            placeholder="0x..."
                        />
                    </div>
                </div>
            )}
        </div>

        {/* Navigation Actions */}
        <div className="mt-8 flex gap-4 pt-6 border-t border-white/5 relative z-10">
            {currentStep > 1 && (
                <button 
                    onClick={handleBack}
                    className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                    <ChevronLeft className="w-4 h-4" /> Back
                </button>
            )}
            
            {currentStep < 3 ? (
                <button 
                    onClick={handleNext}
                    className="flex-1 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                    Next Step <ArrowRight className="w-4 h-4" />
                </button>
            ) : (
                <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gold-500 hover:bg-gold-700 text-black font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                        </>
                    ) : (
                        <>
                            Sign & Complete <ShieldCheck className="w-4 h-4" />
                        </>
                    )}
                </button>
            )}
        </div>
    </div>
  );
}
