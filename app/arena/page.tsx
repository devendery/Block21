"use client";

import React, { useEffect, useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { UserProfile } from '@/types/game';
import ArenaHeader from '@/components/arena/ArenaHeader';
import ArenaHero from '@/components/arena/ArenaHero';
import ArenaSidebar from '@/components/arena/ArenaSidebar';
import ArenaFooter from '@/components/arena/ArenaFooter';

export default function ArenaPage() {
  const { address } = useWallet();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (address) {
      fetch(`/api/user/profile?address=${address}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) setProfile(data);
        });
    }
  }, [address]);

  return (
    <div className="min-h-screen bg-[#0b1830] relative overflow-hidden font-sans selection:bg-yellow-400 selection:text-black">
      
      {/* Background Texture (Snowflakes/Particles) */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1e3f] via-transparent to-[#051024]" />
      </div>

      <ArenaHeader 
        username={profile?.username}
        level={profile?.level}
        coins={profile?.totalB21Earned}
        hearts={5} // Placeholder
        maxHearts={20}
      />

      <main className="relative w-full h-screen overflow-hidden flex items-center justify-center">
        <ArenaHero />
      </main>

      <ArenaSidebar />
      <ArenaFooter />

    </div>
  );
}
