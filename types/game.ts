export type UserProfile = {
  walletAddress: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  highScore: number;
  gamesPlayed: number;
  totalB21Earned: number;
  unlockedSkins: string[];
  activeSkin: string;
  settings: {
    audio: boolean;
    mouseRing: boolean;
  };
  createdAt: number;
  updatedAt: number;
};

export type WormsMode = 'infinity' | 'time' | 'treasure';
