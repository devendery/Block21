"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type WalletContextType = {
  balanceUSD: number;
  balanceB21: number;
  addFunds: (amount: number) => void;
  swapToB21: (usdAmount: number) => void;
  payEntryFee: (amount: number) => boolean;
  addToHistory: (type: 'deposit' | 'swap' | 'game_fee' | 'game_win', amount: number, description: string) => void;
  history: Transaction[];
};

type Transaction = {
  id: string;
  type: 'deposit' | 'swap' | 'game_fee' | 'game_win';
  amount: number;
  currency: 'USD' | 'B21';
  description: string;
  date: number;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [balanceUSD, setBalanceUSD] = useState(100);
  const [balanceB21, setBalanceB21] = useState(100);
  const [history, setHistory] = useState<Transaction[]>([]);

  // Load from LocalStorage on mount, but ensure a minimum starter balance
  useEffect(() => {
    const savedUSD = localStorage.getItem('b21_balance_usd');
    const savedB21 = localStorage.getItem('b21_balance_b21');
    const savedHistory = localStorage.getItem('b21_history');

    const hasUSD = savedUSD !== null;
    const hasB21 = savedB21 !== null;

    if (!hasUSD && !hasB21) {
      setBalanceUSD(100);
      setBalanceB21(100);
      localStorage.setItem('b21_balance_usd', '100');
      localStorage.setItem('b21_balance_b21', '100');
    } else {
      const usd = hasUSD ? parseFloat(savedUSD || '0') : 0;
      const b21 = hasB21 ? parseFloat(savedB21 || '0') : 0;

      if (usd === 0 && b21 === 0) {
        setBalanceUSD(100);
        setBalanceB21(100);
        localStorage.setItem('b21_balance_usd', '100');
        localStorage.setItem('b21_balance_b21', '100');
      } else {
        setBalanceUSD(usd);
        setBalanceB21(b21);
      }
    }

    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('b21_balance_usd', balanceUSD.toString());
    localStorage.setItem('b21_balance_b21', balanceB21.toString());
    localStorage.setItem('b21_history', JSON.stringify(history));
  }, [balanceUSD, balanceB21, history]);

  const addToHistory = (type: Transaction['type'], amount: number, description: string) => {
    const currency = type === 'deposit' ? 'USD' : 'B21'; // Simplified logic
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      amount,
      currency: type === 'deposit' ? 'USD' : 'B21',
      description,
      date: Date.now(),
    };
    setHistory(prev => [newTx, ...prev]);
  };

  const addFunds = (amount: number) => {
    setBalanceUSD(prev => prev + amount);
    addToHistory('deposit', amount, 'Added funds via Payment Gateway');
  };

  const swapToB21 = (usdAmount: number) => {
    if (balanceUSD < usdAmount) return;
    
    const rate = 10; // 1 USD = 10 B21
    const b21Amount = usdAmount * rate;

    setBalanceUSD(prev => prev - usdAmount);
    setBalanceB21(prev => prev + b21Amount);
    
    // Log effectively 2 transactions or just one swap record? Let's keep it simple.
    addToHistory('swap', b21Amount, `Swapped $${usdAmount} to ${b21Amount} B21`);
  };

  const payEntryFee = (amount: number): boolean => {
    if (balanceB21 < amount) return false;
    setBalanceB21(prev => prev - amount);
    addToHistory('game_fee', -amount, 'Tournament Entry Fee');
    return true;
  };

  return (
    <WalletContext.Provider value={{ balanceUSD, balanceB21, addFunds, swapToB21, payEntryFee, addToHistory, history }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
