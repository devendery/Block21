import { NextRequest, NextResponse } from "next/server";
import { getUserProfile, saveUserProfile, createDefaultProfile } from "@/lib/gameDb";
import { UserProfile } from "@/types/game";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function normalizeAddress(address: string) {
  return address.trim().toLowerCase();
}

function sanitizeUsername(username: string) {
  const trimmed = username.trim().replace(/\s+/g, " ");
  if (trimmed.length < 2) return null;
  if (trimmed.length > 24) return null;
  return trimmed;
}

async function getOrCreateSupabaseUser(walletAddress: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("users")
    .select("id,wallet_address,username")
    .eq("wallet_address", walletAddress)
    .maybeSingle();
  if (error) throw error;
  if (data) return data as any;

  const { data: inserted, error: insertError } = await supabase
    .from("users")
    .insert({ wallet_address: walletAddress })
    .select("id,wallet_address,username")
    .single();
  if (insertError) throw insertError;
  return inserted as any;
}

async function setSupabaseUsername(walletAddress: string, username: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("users")
    .update({ username })
    .eq("wallet_address", walletAddress)
    .select("id,wallet_address,username")
    .single();
  if (error) throw error;
  return data as any;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address required" }, { status: 400 });
  }

  const walletAddress = normalizeAddress(address);
  try {
    let profile = await getUserProfile(walletAddress);
    if (!profile) {
      profile = await createDefaultProfile(walletAddress);
    }
    try {
      const userRow = await getOrCreateSupabaseUser(walletAddress);
      if (typeof userRow?.username === "string" && userRow.username.trim()) {
        profile.username = userRow.username.trim();
      }
    } catch {
    }
    return NextResponse.json(profile);
  } catch (err) {
    console.error("Profile GET error:", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, data } = body; 

    if (!address) {
       return NextResponse.json({ error: "Address required" }, { status: 400 });
    }

    const walletAddress = normalizeAddress(address);
    let profile = await getUserProfile(walletAddress);
    if (!profile) {
      profile = await createDefaultProfile(walletAddress);
    }

    // Secure merge: Only allow specific fields to be updated by client
    // For now, allowing most fields but strictly ensuring walletAddress doesn't change
    const updatedProfile: UserProfile = { 
        ...profile, 
        ...data, 
        walletAddress: profile.walletAddress, // Immutable
        updatedAt: Date.now() 
    };

    if (typeof (data as any)?.username === "string") {
      const nextUsername = sanitizeUsername((data as any).username);
      if (!nextUsername) {
        return NextResponse.json({ error: "Invalid username" }, { status: 400 });
      }
      updatedProfile.username = nextUsername;
      try {
        await getOrCreateSupabaseUser(walletAddress);
        await setSupabaseUsername(walletAddress, nextUsername);
      } catch {
      }
    }

    const saved = await saveUserProfile(updatedProfile);
    if (!saved) {
      return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
    }
    return NextResponse.json(updatedProfile);
  } catch (err) {
    console.error("Profile POST error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
