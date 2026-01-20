"use client";

import { useEffect, useState } from "react";
import { formatNameWithWalletSuffix } from "@/lib/nameFormat";

type Entry = { rank: number; name: string | null; address: string | null; score: number; updatedAt: string };

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/phase1/leaderboard?game=Snake&season=global&limit=25", { cache: "no-store" });
        const data = (await res.json()) as { entries?: Entry[] };
        setEntries(data.entries || []);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-foreground pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-heading font-black text-white mb-6">Leaderboard</h1>
        <div className="glass-panel p-6">
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="text-gray-400">No entries yet.</div>
          ) : (
            <div className="space-y-3">
              {entries.map((e) => (
                <div key={e.rank} className="flex items-center justify-between bg-slate-900/40 border border-slate-800 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-400 w-10">#{e.rank}</div>
                    <div className="text-sm text-white font-bold">
                      {e.name && e.address ? formatNameWithWalletSuffix(e.name, e.address) : e.name || "Unknown"}
                    </div>
                  </div>
                  <div className="text-white font-bold">{e.score}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
