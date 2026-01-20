import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const game = searchParams.get("game") || "Snake";
  const season = searchParams.get("season") || "global";
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || "25")));

  let supabase: ReturnType<typeof getSupabaseServerClient>;
  try {
    supabase = getSupabaseServerClient();
  } catch (e) {
    return NextResponse.json({
      game,
      season,
      entries: [],
      error: e instanceof Error ? e.message : "Supabase not configured",
    });
  }
  const { data: gameRow, error: gameError } = await supabase.from("games").select("id").eq("name", game).single();
  if (gameError || !gameRow) {
    return NextResponse.json({ entries: [] });
  }

  const { data, error } = await supabase
    .from("leaderboard")
    .select("score,updated_at,users(wallet_address,username)")
    .eq("game_id", gameRow.id)
    .eq("season", season)
    .order("score", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return NextResponse.json({ entries: [] });
  }

  const entries = data.map((row: any, i: number) => {
    const address = (row as any).users?.wallet_address ?? null;
    const nameRaw = (row as any).users?.username;
    const name = typeof nameRaw === "string" && nameRaw.trim() ? nameRaw.trim() : null;
    return {
      rank: i + 1,
      address,
      name,
      score: row.score,
      updatedAt: row.updated_at,
    };
  });

  return NextResponse.json({ game, season, entries });
}
