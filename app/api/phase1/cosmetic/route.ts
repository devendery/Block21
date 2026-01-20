import { NextRequest, NextResponse } from "next/server";
import { verifySessionJwt } from "@/lib/auth/jwt";
import { getSnakeCosmetic, saveSnakeCosmetic } from "@/lib/gameDb";

const SKINS = new Set(["classic", "neon", "magma", "toxic", "void", "scales", "custom"]);
const EYES = new Set(["cat", "round", "angry"]);
const MOUTHS = new Set(["tongue", "smile", "fangs"]);

function clampColor(v: any) {
  if (typeof v === "number" && Number.isFinite(v)) {
    return Math.max(0, Math.min(0xffffff, Math.floor(v)));
  }
  if (typeof v === "string") {
    const s = v.trim().replace("#", "");
    const n = Number.parseInt(s.slice(0, 6), 16);
    if (Number.isFinite(n)) return Math.max(0, Math.min(0xffffff, n));
  }
  return null;
}

async function getAddress(req: NextRequest) {
  const token = req.cookies.get("b21_session")?.value;
  if (!token) return null;
  try {
    const session = await verifySessionJwt(token);
    return session.address;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const address = await getAddress(req);
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cosmetic = await getSnakeCosmetic(address);
  return NextResponse.json({ cosmetic: cosmetic || null });
}

export async function POST(req: NextRequest) {
  const address = await getAddress(req);
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as any;
  const skin = String(body?.skin || "");
  const eyes = String(body?.eyes || "");
  const mouth = String(body?.mouth || "");

  if (!SKINS.has(skin) || !EYES.has(eyes) || !MOUTHS.has(mouth)) {
    return NextResponse.json({ error: "Invalid cosmetic" }, { status: 400 });
  }

  let customPalette: { primary: number; secondary: number } | null = null;
  if (body?.customPalette) {
    const primary = clampColor(body.customPalette.primary);
    const secondary = clampColor(body.customPalette.secondary);
    if (primary !== null && secondary !== null) customPalette = { primary, secondary };
  }

  const ok = await saveSnakeCosmetic(address, { skin, eyes, mouth, customPalette });
  if (!ok) return NextResponse.json({ error: "Failed to save" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
