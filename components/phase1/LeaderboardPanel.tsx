"use client";

import { useEffect, useState } from "react";
import { formatNameWithWalletSuffix } from "@/lib/nameFormat";

type Entry = { rank: number; name: string | null; address: string | null; score: number; updatedAt: string };

export default function LeaderboardPanel() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/phase1/leaderboard?game=Snake&season=global&limit=10", { cache: "no-store" });
        if (!res.ok) {
          setEntries([]);
          return;
        }
        const data = (await res.json().catch(() => ({ entries: [] }))) as { entries?: Entry[] };
        setEntries(data.entries || []);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-white font-bold">Leaderboard</div>
        <div className="text-xs text-gray-500">Snake</div>
      </div>
      {loading ? (
        <div className="text-sm text-gray-400">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-sm text-gray-400">No entries yet.</div>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => (
            <div
              key={e.rank}
              className="flex items-center justify-between bg-slate-900/40 border border-slate-800 rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-500 w-7">#{e.rank}</div>
                <div className="text-xs text-white font-bold">
                  {e.name && e.address ? formatNameWithWalletSuffix(e.name, e.address) : e.name || "Unknown"}
                </div>
              </div>
              <div className="text-sm text-white font-bold">{e.score}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
