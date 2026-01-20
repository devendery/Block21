import { NextRequest, NextResponse } from "next/server";
import { verifySessionJwt } from "@/lib/auth/jwt";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("b21_session")?.value;
  if (!token) {
    return NextResponse.json({ address: null, rewards: [], unauthorized: true });
  }

  let address: string;
  try {
    const session = await verifySessionJwt(token);
    address = session.address;
  } catch {
    return NextResponse.json({ address: null, rewards: [], unauthorized: true });
  }

  const { searchParams } = new URL(req.url);
  const game = searchParams.get("game") || "Snake";
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || "25")));

  let supabase: ReturnType<typeof getSupabaseServerClient>;
  try {
    supabase = getSupabaseServerClient();
  } catch (e) {
    return NextResponse.json({
      address,
      rewards: [],
      error: e instanceof Error ? e.message : "Supabase not configured",
    });
  }
  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("wallet_address", address)
    .single();
  if (userError || !userRow) {
    return NextResponse.json({ rewards: [] });
  }

  const { data: gameRow } = await supabase.from("games").select("id").eq("name", game).maybeSingle();
  const gameId = gameRow?.id ?? null;

  let query = supabase
    .from("rewards")
    .select("id,amount,token_symbol,status,tx_hash,created_at,payload,game_id")
    .eq("user_id", userRow.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (gameId) query = query.eq("game_id", gameId);

  const { data, error } = await query;
  if (error || !data) {
    return NextResponse.json({ rewards: [] });
  }

  return NextResponse.json({ address, rewards: data });
}
