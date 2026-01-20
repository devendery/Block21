import { NextRequest, NextResponse } from "next/server";
import { verifySessionJwt } from "@/lib/auth/jwt";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("b21_session")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let address: string;
  try {
    const session = await verifySessionJwt(token);
    address = session.address;
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const body = await req.json();
  const { txHash, amount, currency = "B21", type = "entry_fee", gameName = "Snake" } = body;

  if (!txHash || !amount) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (e) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  
  const walletAddress = address.trim().toLowerCase();
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("wallet_address", walletAddress)
    .maybeSingle();

  let userId = existingUser?.id as string | undefined;
  if (!userId) {
    const { data: insertedUser, error: insertUserError } = await supabase
      .from("users")
      .insert({ wallet_address: walletAddress })
      .select("id")
      .single();
    if (insertUserError) return NextResponse.json({ error: insertUserError.message }, { status: 500 });
    userId = insertedUser?.id as string | undefined;
  }
  if (!userId) return NextResponse.json({ error: "User not available" }, { status: 500 });

  // Get game
  const { data: game } = await supabase.from("games").select("id").eq("name", gameName).maybeSingle();
  
  const { error } = await supabase.from("transactions").insert({
    user_id: userId,
    game_id: game?.id,
    type,
    amount,
    currency,
    tx_hash: txHash,
    status: "submitted"
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
