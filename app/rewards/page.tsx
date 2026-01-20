"use client";

import { useEffect, useState } from "react";

type Reward = {
  id: string;
  amount: string;
  token_symbol: string;
  status: string;
  tx_hash: string | null;
  created_at: string;
};

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/phase1/rewards?game=Snake&limit=25", { cache: "no-store" });
        if (res.status === 401) {
          setAuthed(false);
          setRewards([]);
          return;
        }
        const data = (await res.json()) as { rewards?: Reward[] };
        setRewards(data.rewards || []);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-foreground pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-heading font-black text-white mb-6">My Rewards</h1>
        <div className="glass-panel p-6">
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : !authed ? (
            <div className="text-gray-400">Connect wallet and sign in to view rewards.</div>
          ) : rewards.length === 0 ? (
            <div className="text-gray-400">No rewards yet.</div>
          ) : (
            <div className="space-y-3">
              {rewards.map((r) => (
                <div key={r.id} className="bg-slate-900/40 border border-slate-800 rounded-lg px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-white font-bold">
                      {r.amount} {r.token_symbol}
                    </div>
                    <div className="text-xs text-gray-400">{new Date(r.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm text-gray-400">Status: {r.status}</div>
                    <div className="text-sm font-mono text-gray-300">
                      {r.tx_hash ? `${r.tx_hash.slice(0, 10)}...` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

