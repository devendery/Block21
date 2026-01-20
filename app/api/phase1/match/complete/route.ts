import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { maybeSendReward } from "@/lib/rewards/polygon";

type MatchPlayer = {
  sessionId: string;
  address: string;
  score: number;
  alive: boolean;
};

type MatchPayload = {
  game: string;
  roomId: string;
  startedAt: number;
  endedAt: number;
  winnerAddress: string | null;
  players: MatchPlayer[];
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export async function POST(req: NextRequest) {
  const expected = process.env.PHASE1_SERVER_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
  const secret = req.headers.get("x-phase1-secret");
  if (secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: MatchPayload;
  try {
    payload = (await req.json()) as MatchPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isNonEmptyString(payload.game) || !isNonEmptyString(payload.roomId)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!Array.isArray(payload.players) || payload.players.length < 2) {
    return NextResponse.json({ error: "Not enough players" }, { status: 400 });
  }

  if (typeof payload.startedAt !== "number" || typeof payload.endedAt !== "number") {
    return NextResponse.json({ error: "Invalid timestamps" }, { status: 400 });
  }

  const durationMs = payload.endedAt - payload.startedAt;
  if (!Number.isFinite(durationMs) || durationMs < 1000 || durationMs > 30 * 60 * 1000) {
    return NextResponse.json({ error: "Invalid match duration" }, { status: 400 });
  }

  const winner = payload.winnerAddress
    ? payload.players.find(
        (p) => isNonEmptyString(p.address) && p.address.toLowerCase() === payload.winnerAddress?.toLowerCase()
      )
    : null;

  if (payload.winnerAddress && !winner) {
    return NextResponse.json({ error: "Winner not in match" }, { status: 400 });
  }

  let supabase: ReturnType<typeof getSupabaseServerClient>;
  try {
    supabase = getSupabaseServerClient();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Supabase not configured" },
      { status: 500 }
    );
  }

  const { data: gameRow, error: gameError } = await supabase
    .from("games")
    .upsert(
      { name: payload.game, status: "active", reward_enabled: true },
      { onConflict: "name" }
    )
    .select("id,name,reward_enabled")
    .single();

  if (gameError || !gameRow) {
    return NextResponse.json({ error: "Failed to ensure game" }, { status: 500 });
  }

  const usersByAddress = new Map<string, { id: string; wallet_address: string }>();
  for (const p of payload.players) {
    if (!isNonEmptyString(p.address)) continue;
    const address = p.address.trim();
    const { data: user, error } = await supabase
      .from("users")
      .upsert({ wallet_address: address }, { onConflict: "wallet_address" })
      .select("id,wallet_address")
      .single();
    if (error || !user) {
      return NextResponse.json({ error: "Failed to upsert users" }, { status: 500 });
    }
    usersByAddress.set(address.toLowerCase(), user);
  }

  const sessionIdsByAddress = new Map<string, string>();
  for (const p of payload.players) {
    const user = usersByAddress.get(p.address.toLowerCase());
    if (!user) continue;
    if (typeof p.score !== "number" || !Number.isFinite(p.score) || p.score < 0) {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 });
    }
    const result =
      payload.winnerAddress && p.address.toLowerCase() === payload.winnerAddress.toLowerCase()
        ? "win"
        : "loss";

    const { data: session, error } = await supabase
      .from("game_sessions")
      .insert({
        user_id: user.id,
        game_id: gameRow.id,
        room_id: payload.roomId,
        score: Math.floor(p.score),
        result,
        metadata: {
          players: payload.players.length,
          startedAt: payload.startedAt,
          endedAt: payload.endedAt,
        },
      })
      .select("id")
      .single();

    if (error || !session) {
      return NextResponse.json({ error: "Failed to log session" }, { status: 500 });
    }
    sessionIdsByAddress.set(p.address.toLowerCase(), session.id);

    const { data: existing } = await supabase
      .from("leaderboard")
      .select("id,score")
      .eq("game_id", gameRow.id)
      .eq("user_id", user.id)
      .eq("season", "global")
      .maybeSingle();

    const nextScore = existing ? Math.max(existing.score ?? 0, Math.floor(p.score)) : Math.floor(p.score);
    if (!existing || nextScore !== existing.score) {
      const upsertResult = await supabase.from("leaderboard").upsert(
        {
          id: existing?.id,
          game_id: gameRow.id,
          user_id: user.id,
          season: "global",
          score: nextScore,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "game_id,user_id,season" }
      );
      if (upsertResult.error) {
        return NextResponse.json({ error: "Failed to update leaderboard" }, { status: 500 });
      }
    }
  }

  if (payload.winnerAddress && winner && winner.alive && gameRow.reward_enabled) {
    const user = usersByAddress.get(payload.winnerAddress.toLowerCase());
    if (user) {
      const sessionId = sessionIdsByAddress.get(payload.winnerAddress.toLowerCase()) ?? null;
      const amount = "1";
      const rewardInsert = await supabase
        .from("rewards")
        .insert({
          user_id: user.id,
          game_id: gameRow.id,
          session_id: sessionId,
          amount,
          token_symbol: "B21",
          status: "pending",
          payload: {
            game: payload.game,
            roomId: payload.roomId,
            score: winner.score,
          },
        })
        .select("id")
        .single();

      if (!rewardInsert.error && rewardInsert.data) {
        const rewardId = rewardInsert.data.id as string;
        const tx = await maybeSendReward({
          rewardId,
          recipient: payload.winnerAddress,
          amount,
          game: payload.game,
        });
        if (tx && tx.txHash) {
          await supabase
            .from("rewards")
            .update({ status: "sent", tx_hash: tx.txHash })
            .eq("id", rewardId);
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
