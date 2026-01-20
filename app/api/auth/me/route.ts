import { NextRequest, NextResponse } from "next/server";
import { verifySessionJwt } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("b21_session")?.value;
  if (!token) {
    return NextResponse.json({ address: null });
  }

  try {
    const session = await verifySessionJwt(token);
    return NextResponse.json({ address: session.address });
  } catch {
    const res = NextResponse.json({ address: null });
    res.cookies.delete("b21_session");
    return res;
  }
}

