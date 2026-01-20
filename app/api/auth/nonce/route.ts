import { NextResponse } from "next/server";
import crypto from "node:crypto";

export async function GET() {
  const nonce = crypto.randomUUID();

  const res = NextResponse.json({ nonce });
  res.cookies.set("b21_nonce", nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });
  return res;
}

