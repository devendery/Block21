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

export default function RewardsPanel() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/phase1/rewards?game=Snake&limit=5", { cache: "no-store" });
        if (res.status === 401) {
          setAuthed(false);
          setRewards([]);
          return;
        }
        if (!res.ok) {
          setRewards([]);
          return;
        }
        const data = (await res.json().catch(() => ({ rewards: [] }))) as { rewards?: Reward[] };
        setRewards(data.rewards || []);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-white font-bold">My Rewards</div>
        <div className="text-xs text-gray-500">B21</div>
      </div>
      {loading ? (
        <div className="text-sm text-gray-400">Loading...</div>
      ) : !authed ? (
        <div className="text-sm text-gray-400">Connect wallet and sign in to view rewards.</div>
      ) : rewards.length === 0 ? (
        <div className="text-sm text-gray-400">No rewards yet.</div>
      ) : (
        <div className="space-y-2">
          {rewards.map((r) => (
            <div key={r.id} className="bg-slate-900/40 border border-slate-800 rounded-lg px-3 py-2">
              <div className="flex items-center justify-between">
                <div className="text-white font-bold text-sm">
                  {r.amount} {r.token_symbol}
                </div>
                <div className="text-xs text-gray-500">{r.status}</div>
              </div>
              {r.tx_hash ? (
                <div className="mt-1 text-xs font-mono text-gray-400">{`${r.tx_hash.slice(0, 10)}...`}</div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
