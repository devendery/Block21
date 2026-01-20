import { NextResponse } from "next/server";

function toHttpUrl(wsUrl: string) {
  if (wsUrl.startsWith("ws://")) return `http://${wsUrl.slice("ws://".length)}`;
  if (wsUrl.startsWith("wss://")) return `https://${wsUrl.slice("wss://".length)}`;
  return wsUrl;
}

export async function GET() {
  const wsUrl = process.env.NEXT_PUBLIC_COLYSEUS_URL || "ws://localhost:2567";
  const base = toHttpUrl(wsUrl).replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/health`, { cache: "no-store" });
    const data = (await res.json().catch(() => null)) as any;
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: data?.error || `HTTP ${res.status}` }, { status: 200 });
    }
    return NextResponse.json({ ok: Boolean(data?.ok), error: data?.error || null }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, error: "unreachable" }, { status: 200 });
  }
}

