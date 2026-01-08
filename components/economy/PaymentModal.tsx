"use client";

import React, { useState } from 'react';
import { useWallet } from './WalletContext';
import { CreditCard, RefreshCw, X, DollarSign, Coins } from 'lucide-react';

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'deposit' | 'swap';
};

export default function PaymentModal({ isOpen, onClose, defaultTab = 'deposit' }: PaymentModalProps) {
  const { balanceUSD, balanceB21, addFunds, swapToB21 } = useWallet();
  const [activeTab, setActiveTab] = useState<'deposit' | 'swap'>(defaultTab);
  
  // Deposit State
  const [depositAmount, setDepositAmount] = useState('100');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Swap State
  const [swapAmount, setSwapAmount] = useState('10');

  if (!isOpen) return null;

  const handleDeposit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      addFunds(parseFloat(depositAmount));
      setIsProcessing(false);
      // Don't close immediately so they can see success or swap next
    }, 1500);
  };

  const handleSwap = () => {
    swapToB21(parseFloat(swapAmount));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-400" />
            Wallet
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Balance Display */}
        <div className="p-6 bg-slate-800/50">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
              <p className="text-slate-400 text-xs uppercase font-bold mb-1">USD Balance</p>
              <p className="text-2xl font-mono text-white">${balanceUSD.toFixed(2)}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
              <p className="text-slate-400 text-xs uppercase font-bold mb-1">B21 Tokens</p>
              <p className="text-2xl font-mono text-green-400">{balanceB21.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              activeTab === 'deposit' 
                ? 'bg-purple-500/10 text-purple-400 border-b-2 border-purple-500' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Add Funds
          </button>
          <button
            onClick={() => setActiveTab('swap')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              activeTab === 'swap' 
                ? 'bg-green-500/10 text-green-400 border-b-2 border-green-500' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Swap to B21
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'deposit' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Amount to Add (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
              
              <div className="p-4 bg-purple-500/5 rounded-lg border border-purple-500/20 text-sm text-purple-200">
                <p className="font-bold mb-1">Mock Payment Gateway</p>
                <p className="text-xs opacity-70">This is a simulation. No real money is charged. Click below to instantly add funds.</p>
              </div>

              <button
                onClick={handleDeposit}
                disabled={isProcessing}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Add Funds Now'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
               <div>
                <label className="block text-sm text-slate-400 mb-2">Amount to Swap (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="number"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center text-slate-500">
                <RefreshCw className="w-5 h-5 animate-spin-slow" />
              </div>

              <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
                <span className="text-slate-400 text-sm">You Receive:</span>
                <span className="text-xl font-mono font-bold text-green-400">
                  {(parseFloat(swapAmount || '0') * 10).toLocaleString()} B21
                </span>
              </div>

              <button
                onClick={handleSwap}
                disabled={parseFloat(swapAmount) > balanceUSD || parseFloat(swapAmount) <= 0}
                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {parseFloat(swapAmount) > balanceUSD ? 'Insufficient USD Balance' : 'Confirm Swap'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
