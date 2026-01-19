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

export type FoodType = 'apple' | 'banana' | 'cherry' | 'grape' | 'orange' | 'strawberry' | 'carrot' | 'corn' | 'broccoli' | 'eggplant' | 'coin' | 'gem';
export type PowerUpType = 'magnet' | 'foodMultiplier' | 'deathRadar' | 'speed' | 'maneuver' | 'zoom';
export type SkinId = 'classic' | 'neon' | 'shadow' | 'gold' | 'cyber' | 'toxin' | 'crimson' | 'void';

export type Vector = { x: number; y: number };
export type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string };
export type Food = { x: number; y: number; radius: number; color: string; id: number; type: FoodType };
export type PowerUp = { x: number; y: number; radius: number; color: string; id: number; type: PowerUpType };
export type DeathMark = { x: number; y: number; life: number };

export type GameStats = {
  score: number;
  collected: number;
  defeated: number;
  experience: number;
  lifetime: number;
};
