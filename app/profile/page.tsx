"use client";

import React, { useEffect, useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { WalletProvider } from '@/components/economy/WalletContext';
import { UserProfile } from '@/types/game';
import { User, Trophy, Gamepad2, Edit2, Save, Loader2, Wallet, Sparkles } from 'lucide-react';
import WalletConnect from '@/components/WalletConnect';

function ProfileContent() {
  const { address, isConnected } = useWallet();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      fetchProfile(address);
    } else {
      setProfile(null);
    }
  }, [isConnected, address]);

  const fetchProfile = async (addr: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/profile?address=${addr}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProfile(data);
      setNewName(data.username);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile || !address) return;
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          data: { username: newName, activeSkin: profile.activeSkin }
        })
      });
      const data = await res.json();
      setProfile(data);
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const selectSkin = async (skinId: string) => {
    if (!profile || !address) return;
    // Optimistic update
    setProfile({ ...profile, activeSkin: skinId });
    
    try {
        await fetch('/api/user/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              address,
              data: { activeSkin: skinId }
            })
          });
    } catch (err) {
        console.error("Failed to save skin", err);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <Wallet className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Connect Wallet</h2>
        <p className="text-slate-400 mb-8 max-w-md">
          Connect your wallet to access your profile, view stats, and customize your worm.
        </p>
        <WalletConnect />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header / Profile Card */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center shadow-2xl">
            <User className="w-16 h-16 text-slate-400" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
              {editing ? (
                <div className="flex items-center gap-2">
                    <input 
                        type="text" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="bg-slate-800 border border-slate-600 rounded px-3 py-1 text-xl font-bold text-white focus:outline-none focus:border-green-500"
                    />
                    <button 
                        onClick={saveProfile}
                        disabled={saving}
                        className="p-2 bg-green-600 rounded hover:bg-green-500 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </button>
                </div>
              ) : (
                <>
                    <h1 className="text-3xl font-bold text-white">{profile.username}</h1>
                    <button onClick={() => setEditing(true)} className="text-slate-500 hover:text-white transition-colors">
                        <Edit2 className="w-4 h-4" />
                    </button>
                </>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-400 font-mono mb-4">
                <span>Lvl {profile.level}</span>
                <span>•</span>
                <span>{profile.xp} XP</span>
                <span>•</span>
                <span>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown'}</span>
            </div>

            <div className="w-full max-w-md h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[45%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col items-center justify-center text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mb-3" />
            <div className="text-3xl font-bold text-white mb-1">{profile.highScore}</div>
            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">High Score</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col items-center justify-center text-center">
            <Gamepad2 className="w-8 h-8 text-blue-500 mb-3" />
            <div className="text-3xl font-bold text-white mb-1">{profile.gamesPlayed}</div>
            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Games Played</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col items-center justify-center text-center">
            <Sparkles className="w-8 h-8 text-purple-500 mb-3" />
            <div className="text-3xl font-bold text-white mb-1">{profile.totalB21Earned}</div>
            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">B21 Earned</div>
        </div>
      </div>

      {/* Skins */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-green-500" />
            Skin Collection
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {['classic', 'neon', 'shadow', 'gold', 'cyber', 'toxin', 'crimson', 'void'].map((skin) => (
                <button
                    key={skin}
                    onClick={() => selectSkin(skin)}
                    className={`relative aspect-square rounded-xl border-2 transition-all group overflow-hidden ${
                        profile.activeSkin === skin 
                            ? 'border-green-500 bg-green-500/10' 
                            : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                    }`}
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-12 h-12 rounded-full shadow-lg transform group-hover:scale-110 transition-transform`} style={{
                            backgroundColor: getSkinColor(skin)
                        }} />
                    </div>
                    <div className="absolute bottom-3 left-0 right-0 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                        {skin}
                    </div>
                    {profile.activeSkin === skin && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]" />
                    )}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
}

function getSkinColor(id: string) {
    const map: Record<string, string> = {
        classic: '#22c55e',
        neon: '#22d3ee',
        shadow: '#6366f1',
        gold: '#facc15',
        cyber: '#ec4899',
        toxin: '#84cc16',
        crimson: '#ef4444',
        void: '#1e293b',
    };
    return map[id] || '#666';
}

export default function ProfilePage() {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-black text-white pt-24 pb-12">
        <ProfileContent />
      </div>
    </WalletProvider>
  );
}