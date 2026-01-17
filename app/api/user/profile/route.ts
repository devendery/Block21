import { NextRequest, NextResponse } from "next/server";
import { getUserProfile, saveUserProfile, createDefaultProfile } from "@/lib/gameDb";
import { UserProfile } from "@/types/game";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address required" }, { status: 400 });
  }

  try {
    let profile = await getUserProfile(address);
    if (!profile) {
      profile = await createDefaultProfile(address);
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

    let profile = await getUserProfile(address);
    if (!profile) {
      profile = await createDefaultProfile(address);
    }

    // Secure merge: Only allow specific fields to be updated by client
    // For now, allowing most fields but strictly ensuring walletAddress doesn't change
    const updatedProfile: UserProfile = { 
        ...profile, 
        ...data, 
        walletAddress: profile.walletAddress, // Immutable
        updatedAt: Date.now() 
    };

    await saveUserProfile(updatedProfile);
    return NextResponse.json(updatedProfile);
  } catch (err) {
    console.error("Profile POST error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}