import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function envPath() {
  return path.join(process.cwd(), ".env.local");
}

function parseEnv(text: string) {
  const lines = text.split(/\r?\n/);
  const map = new Map<string, string>();
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1);
    map.set(key, value);
  }
  return { lines, map };
}

function upsertEnvLines(lines: string[], updates: Record<string, string>) {
  const out = [...lines];
  const keys = Object.keys(updates);
  for (const key of keys) {
    const nextLine = `${key}=${updates[key]}`;
    let replaced = false;
    for (let i = 0; i < out.length; i++) {
      if (out[i].startsWith(`${key}=`)) {
        out[i] = nextLine;
        replaced = true;
        break;
      }
    }
    if (!replaced) out.push(nextLine);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const url = process.env.SUPABASE_URL || "";
  const hasUrl = url.trim().length > 0;
  const hasServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim().length > 0;
  return NextResponse.json({
    ok: true,
    hasUrl,
    hasServiceRoleKey,
    urlPreview: hasUrl ? `${url.slice(0, 16)}...` : "",
  });
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const supabaseUrl = typeof body?.supabaseUrl === "string" ? body.supabaseUrl.trim() : "";
  const serviceRoleKey = typeof body?.serviceRoleKey === "string" ? body.serviceRoleKey.trim() : "";
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  if (!/^https?:\/\//i.test(supabaseUrl)) {
    return NextResponse.json({ ok: false, error: "SUPABASE_URL must start with http(s)://" }, { status: 400 });
  }

  const file = envPath();
  const existing = await readFile(file, "utf8").catch(() => "");
  const { lines } = parseEnv(existing);
  const next = upsertEnvLines(lines, {
    SUPABASE_URL: JSON.stringify(supabaseUrl),
    SUPABASE_SERVICE_ROLE_KEY: JSON.stringify(serviceRoleKey),
  });
  await writeFile(file, next, "utf8");

  process.env.SUPABASE_URL = supabaseUrl;
  process.env.SUPABASE_SERVICE_ROLE_KEY = serviceRoleKey;

  return NextResponse.json({ ok: true });
}
