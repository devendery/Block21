"use client";

import { useState } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";

interface ContributionFormProps {
  onContribute: (amount: number) => void;
  price: number;
}

export default function ContributionForm({ onContribute, price }: ContributionFormProps) {
  const [amount, setAmount] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid USDT amount.");
      return;
    }
    if (!consent) {
      setError("You must agree to the terms.");
      return;
    }

    setLoading(true);

    // Simulate transaction delay
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      onContribute(Number(amount));
      setAmount("");
      setConsent(false);
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  const b21Amount = amount ? (Number(amount) / price).toFixed(2) : "0";

  return (
    <div className="glass-card p-6 md:p-8">
      <h3 className="text-2xl font-heading font-bold mb-6 text-white">Contribute USDT</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Amount (USDT)</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500/50 transition-colors"
              placeholder="0.00"
              step="0.01"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">USDT</span>
          </div>
          <div className="mt-2 text-right text-sm text-gold-500">
            ≈ {b21Amount} B21
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/10 bg-black/50 checked:border-gold-500 checked:bg-gold-500 transition-all"
            />
            <Check className="pointer-events-none absolute h-3 w-3 left-1 text-black opacity-0 peer-checked:opacity-100" />
          </div>
          <label className="text-sm text-gray-400 leading-tight cursor-pointer" onClick={() => setConsent(!consent)}>
            I consent that this is a test/demo contribution and I am sending USDT to the designated address.
          </label>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-500 text-sm bg-green-500/10 p-3 rounded-lg border border-green-500/20">
            <Check className="w-4 h-4" />
            Contribution successful! Bar updated.
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-gold-500 to-yellow-600 hover:to-yellow-500 text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-gold-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Contribute Now"
          )}
        </button>
      </form>
    </div>
  );
}
