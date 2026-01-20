import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import SupabaseEnvSetup from "@/components/admin/SupabaseEnvSetup";

function shortAddress(addr: string | null | undefined) {
  if (!addr) return "—";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function shortHash(hash: string | null | undefined) {
  if (!hash) return "—";
  if (hash.length <= 18) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

export default async function AdminDatabasePage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (e) {
    return (
      <div className="min-h-screen bg-transparent text-foreground pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-heading font-black text-white mb-4">Database</h1>
          <div className="mb-6 glass-panel p-4">
            <div className="text-sm text-red-300">{e instanceof Error ? e.message : "Supabase not configured"}</div>
          </div>
          <SupabaseEnvSetup />
          <div className="mt-6 text-sm text-gray-400">
            Schema files:{" "}
            <Link className="text-primary hover:underline" href="/api/admin/schema">
              view schema
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [usersCount, gamesCount, sessionsCount, leaderboardCount, rewardsCount, transactionsCount] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("games").select("id", { count: "exact", head: true }),
    supabase.from("game_sessions").select("id", { count: "exact", head: true }),
    supabase.from("leaderboard").select("id", { count: "exact", head: true }),
    supabase.from("rewards").select("id", { count: "exact", head: true }),
    supabase.from("transactions").select("id", { count: "exact", head: true }),
  ]);

  const [usersRes, gamesRes, sessionsRes, leaderboardRes, rewardsRes, transactionsRes] = await Promise.all([
    supabase.from("users").select("id,wallet_address,created_at").order("created_at", { ascending: false }).limit(20),
    supabase.from("games").select("id,name,status,reward_enabled,created_at").order("created_at", { ascending: false }).limit(20),
    supabase
      .from("game_sessions")
      .select("id,score,result,room_id,created_at,users(wallet_address),games(name)")
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("leaderboard")
      .select("id,score,season,updated_at,users(wallet_address),games(name)")
      .order("updated_at", { ascending: false })
      .limit(25),
    supabase
      .from("rewards")
      .select("id,amount,token_symbol,status,tx_hash,created_at,users(wallet_address),games(name)")
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("transactions")
      .select("id,type,amount,currency,tx_hash,status,created_at,users(wallet_address),games(name)")
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  const users = (usersRes.data ?? []) as any[];
  const games = (gamesRes.data ?? []) as any[];
  const sessions = (sessionsRes.data ?? []) as any[];
  const leaderboard = (leaderboardRes.data ?? []) as any[];
  const rewards = (rewardsRes.data ?? []) as any[];
  const transactions = (transactionsRes.data ?? []) as any[];

  return (
    <div className="min-h-screen bg-transparent text-foreground pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-heading font-black text-white">Database</h1>
            <div className="text-sm text-gray-400">Supabase tables used for Phase‑1 gameplay</div>
          </div>
          <Link
            href="/play"
            className="bg-primary hover:bg-primary/90 text-black font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Back to Play
          </Link>
        </div>

        <div className="grid md:grid-cols-6 gap-4">
          <div className="glass-panel p-4">
            <div className="text-xs text-gray-400">Users</div>
            <div className="text-2xl font-black text-white">{usersCount.count ?? 0}</div>
          </div>
          <div className="glass-panel p-4">
            <div className="text-xs text-gray-400">Games</div>
            <div className="text-2xl font-black text-white">{gamesCount.count ?? 0}</div>
          </div>
          <div className="glass-panel p-4">
            <div className="text-xs text-gray-400">Sessions</div>
            <div className="text-2xl font-black text-white">{sessionsCount.count ?? 0}</div>
          </div>
          <div className="glass-panel p-4">
            <div className="text-xs text-gray-400">Leaderboard</div>
            <div className="text-2xl font-black text-white">{leaderboardCount.count ?? 0}</div>
          </div>
          <div className="glass-panel p-4">
            <div className="text-xs text-gray-400">Rewards</div>
            <div className="text-2xl font-black text-white">{rewardsCount.count ?? 0}</div>
          </div>
          <div className="glass-panel p-4">
            <div className="text-xs text-gray-400">Transactions</div>
            <div className="text-2xl font-black text-white">{transactionsCount.count ?? 0}</div>
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="text-white font-bold mb-3">Transactions (latest)</div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-xs text-gray-400">
                <tr>
                  <th className="text-left py-2 pr-4">Time</th>
                  <th className="text-left py-2 pr-4">User</th>
                  <th className="text-left py-2 pr-4">Type</th>
                  <th className="text-left py-2 pr-4">Amount</th>
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-left py-2 pr-4">Tx Hash</th>
                </tr>
              </thead>
              <tbody className="text-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td className="py-3 text-gray-400" colSpan={6}>
                      No transactions yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="border-t border-white/5">
                      <td className="py-2 pr-4 text-gray-400 whitespace-nowrap">{new Date(t.created_at).toLocaleString()}</td>
                      <td className="py-2 pr-4 font-mono whitespace-nowrap">{shortAddress(t.users?.wallet_address)}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{t.type}</td>
                      <td className="py-2 pr-4 font-bold whitespace-nowrap">
                        {t.amount} {t.currency}
                      </td>
                      <td className="py-2 pr-4 whitespace-nowrap">{t.status}</td>
                      <td className="py-2 pr-4 font-mono text-gray-400 whitespace-nowrap">{shortHash(t.tx_hash)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6">
            <div className="text-white font-bold mb-3">Users (latest)</div>
            <div className="space-y-2">
              {users.length === 0 ? (
                <div className="text-sm text-gray-400">No users yet.</div>
              ) : (
                users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between bg-slate-900/40 border border-slate-800 rounded-lg px-3 py-2">
                    <div className="font-mono text-sm text-white">{shortAddress(u.wallet_address)}</div>
                    <div className="text-xs text-gray-500">{new Date(u.created_at).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="text-white font-bold mb-3">Games</div>
            <div className="space-y-2">
              {games.length === 0 ? (
                <div className="text-sm text-gray-400">No games yet.</div>
              ) : (
                games.map((g) => (
                  <div key={g.id} className="flex items-center justify-between bg-slate-900/40 border border-slate-800 rounded-lg px-3 py-2">
                    <div>
                      <div className="text-white font-bold">{g.name}</div>
                      <div className="text-xs text-gray-500">
                        status: {g.status} • rewards: {g.reward_enabled ? "on" : "off"}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{new Date(g.created_at).toLocaleDateString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="text-white font-bold mb-3">Game Sessions (latest)</div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-xs text-gray-400">
                <tr>
                  <th className="text-left py-2 pr-4">Time</th>
                  <th className="text-left py-2 pr-4">Game</th>
                  <th className="text-left py-2 pr-4">Player</th>
                  <th className="text-left py-2 pr-4">Score</th>
                  <th className="text-left py-2 pr-4">Result</th>
                  <th className="text-left py-2 pr-4">Room</th>
                </tr>
              </thead>
              <tbody className="text-gray-200">
                {sessions.length === 0 ? (
                  <tr>
                    <td className="py-3 text-gray-400" colSpan={6}>
                      No sessions yet.
                    </td>
                  </tr>
                ) : (
                  sessions.map((s) => (
                    <tr key={s.id} className="border-t border-white/5">
                      <td className="py-2 pr-4 text-gray-400 whitespace-nowrap">{new Date(s.created_at).toLocaleString()}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{s.games?.name ?? "—"}</td>
                      <td className="py-2 pr-4 font-mono whitespace-nowrap">{shortAddress(s.users?.wallet_address)}</td>
                      <td className="py-2 pr-4 font-bold whitespace-nowrap">{s.score}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{s.result}</td>
                      <td className="py-2 pr-4 font-mono text-gray-400 whitespace-nowrap">{s.room_id ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6">
            <div className="text-white font-bold mb-3">Leaderboard (latest updates)</div>
            <div className="space-y-2">
              {leaderboard.length === 0 ? (
                <div className="text-sm text-gray-400">No leaderboard entries yet.</div>
              ) : (
                leaderboard.map((l) => (
                  <div key={l.id} className="flex items-center justify-between bg-slate-900/40 border border-slate-800 rounded-lg px-3 py-2">
                    <div>
                      <div className="text-white font-bold">{l.games?.name ?? "—"}</div>
                      <div className="text-xs text-gray-500">
                        {shortAddress(l.users?.wallet_address)} • season: {l.season}
                      </div>
                    </div>
                    <div className="text-white font-black">{l.score}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="text-white font-bold mb-3">Rewards (latest)</div>
            <div className="space-y-2">
              {rewards.length === 0 ? (
                <div className="text-sm text-gray-400">No rewards yet.</div>
              ) : (
                rewards.map((r) => (
                  <div key={r.id} className="bg-slate-900/40 border border-slate-800 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="text-white font-bold">
                        {r.amount} {r.token_symbol}
                      </div>
                      <div className="text-xs text-gray-500">{r.status}</div>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                      <div>
                        {r.games?.name ?? "—"} • {shortAddress(r.users?.wallet_address)}
                      </div>
                      <div className="font-mono">{shortHash(r.tx_hash)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="text-white font-bold mb-2">Schema</div>
          <div className="text-sm text-gray-400">
            View the SQL schema and seed files in the repo:{" "}
            <span className="font-mono">supabase/schema.sql</span> and <span className="font-mono">supabase/seed.sql</span>.
          </div>
        </div>
      </div>
    </div>
  );
}
