import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { signSessionJwt } from "@/lib/auth/jwt";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type LoginBody = {
  address?: string;
  message?: string;
  signature?: string;
};

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export async function POST(req: NextRequest) {
  const nonce = req.cookies.get("b21_nonce")?.value;
  if (!nonce) {
    return NextResponse.json({ error: "Missing nonce" }, { status: 400 });
  }

  let body: LoginBody;
  try {
    body = (await req.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const address = body.address?.trim();
  const message = body.message;
  const signature = body.signature;

  if (!address || !message || !signature) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!message.includes(`Nonce: ${nonce}`)) {
    return NextResponse.json({ error: "Invalid nonce" }, { status: 401 });
  }

  if (!message.toLowerCase().includes(address.toLowerCase())) {
    return NextResponse.json({ error: "Address mismatch" }, { status: 401 });
  }

  let recovered: string;
  try {
    recovered = ethers.verifyMessage(message, signature);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (recovered.toLowerCase() !== address.toLowerCase()) {
    return NextResponse.json({ error: "Signature mismatch" }, { status: 401 });
  }

  let user: { id: string; wallet_address: string; created_at: string } | null = null;
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("users")
      .upsert({ wallet_address: address }, { onConflict: "wallet_address" })
      .select("id,wallet_address,created_at")
      .single();
    if (!error && data) {
      user = data as any;
    }
  } catch {
  }

  const token = await signSessionJwt({ address }, SESSION_TTL_SECONDS);

  const res = NextResponse.json({
    ok: true,
    user,
  });

  res.cookies.delete("b21_nonce");
  res.cookies.set("b21_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return res;
}
