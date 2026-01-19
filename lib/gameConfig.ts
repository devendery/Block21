import { FoodType, PowerUpType, SkinId, WormsMode } from '@/types/game';

export const GAME_CONFIG = {
  // Base map size will be dynamic
  ARENA_SIZE: 3000, 
  
  // Economy Constants
  B21_DECIMALS: 8,
  FOOD_VALUE_B21: 0.00000001,
  BOOST_DRAIN_BASE: 0.00000002,
  
  // Power-up Costs (B21)
  POWERUP_COSTS: {
    speed: 0.00000005,      // per sec drain
    maneuver: 0.00000030,   // activation (Shield)
    magnet: 0.00000004,     // per sec drain
    foodMultiplier: 0.00000050, // activation
    zoom: 0.00000010,       // activation (custom)
    deathRadar: 0.00000010, // activation
  },

  INITIAL_LENGTH: 20,
  SEGMENT_DIST: 8,
  
  // Speed scaling
  BASE_SPEED: 4.2, // Max starting speed
  MIN_SPEED: 1.6,
  BOOST_SPEED_MULTIPLIER: 1.5,
  
  TURN_SPEED: 0.3,
  BOT_TURN_SPEED: 0.15,
  
  FOOD_COUNT: 300, // Increased slightly
  MIN_FOOD_RADIUS: 8, // Increased from implicit 4
  MAX_FOOD_RADIUS: 14, // Increased from implicit 8
  
  MIN_ZOOM: 0.4, // Allow seeing more map
  MAX_ZOOM: 1.2,
  ZOOM_PER_SEGMENT: 0.002,
  
  POWERUP_COUNT: 12, // More powerups for economy
  POWERUP_SCORE_MULTIPLIER: 5,
  POWERUP_DURATION_TICKS: 60 * 8,
  FOLLOW_STRENGTH: 0.28,
  BOT_COUNT: 15,
  TIME_ATTACK_DURATION_SECONDS: 300,
  TREASURE_HUNT_DURATION_SECONDS: 180,
};

export const POWERUP_TYPES: PowerUpType[] = ['magnet', 'foodMultiplier', 'deathRadar', 'speed', 'maneuver', 'zoom'];

export const POWERUP_COLORS: Record<PowerUpType, string> = {
  magnet: '#ef4444',
  foodMultiplier: '#3b82f6',
  deathRadar: '#a855f7',
  speed: '#22c55e',
  maneuver: '#22c55e',
  zoom: '#facc15',
};

export const POWERUP_LABELS: Record<PowerUpType, string> = {
  magnet: 'Magnet',
  foodMultiplier: 'x5 Food',
  deathRadar: 'Death Radar',
  speed: 'Speed Boost',
  maneuver: 'Maneuver',
  zoom: 'Zoom Out',
};

export const SKINS: Record<SkinId, { base: string; boost: string; shield: string }> = {
  classic: { base: 'hsl(142, 72%, 45%)', boost: 'hsl(142, 90%, 60%)', shield: 'hsl(160, 95%, 70%)' },
  neon: { base: 'hsl(187, 92%, 49%)', boost: 'hsl(187, 100%, 65%)', shield: 'hsl(196, 100%, 80%)' },
  shadow: { base: 'hsl(239, 84%, 67%)', boost: 'hsl(262, 84%, 70%)', shield: 'hsl(262, 100%, 82%)' },
  gold: { base: 'hsl(47, 96%, 57%)', boost: 'hsl(47, 100%, 70%)', shield: 'hsl(52, 100%, 80%)' },
  cyber: { base: 'hsl(330, 81%, 60%)', boost: 'hsl(330, 90%, 70%)', shield: 'hsl(330, 100%, 82%)' },
  toxin: { base: 'hsl(84, 81%, 59%)', boost: 'hsl(84, 90%, 68%)', shield: 'hsl(96, 100%, 80%)' },
  crimson: { base: 'hsl(0, 84%, 60%)', boost: 'hsl(0, 92%, 70%)', shield: 'hsl(0, 96%, 80%)' },
  void: { base: 'hsl(222, 47%, 11%)', boost: 'hsl(222, 47%, 20%)', shield: 'hsl(222, 70%, 30%)' },
};

export const FOOD_TYPES: FoodType[] = [
  'apple', 'banana', 'cherry', 'grape', 'orange', 'strawberry', 
  'carrot', 'corn', 'broccoli', 'eggplant', 
  'coin', 'gem'
];

export const FOOD_COLORS: Record<FoodType, string> = {
  apple: '#ef4444',      // Red
  banana: '#facc15',     // Yellow
  cherry: '#be123c',     // Dark Red
  grape: '#9333ea',      // Purple
  orange: '#f97316',     // Orange
  strawberry: '#f43f5e', // Pink-Red
  carrot: '#fb923c',     // Orange
  corn: '#fde047',       // Yellow
  broccoli: '#22c55e',   // Green
  eggplant: '#581c87',   // Dark Purple
  coin: '#ffd700',       // Gold (Special)
  gem: '#06b6d4',        // Cyan (Special)
};

export const FOOD_EMOJIS: Record<FoodType, string> = {
  apple: '🍎',
  banana: '🍌',
  cherry: '🍒',
  grape: '🍇',
  orange: '🍊',
  strawberry: '🍓',
  carrot: '🥕',
  corn: '🌽',
  broccoli: '🥦',
  eggplant: '🍆',
  coin: '🪙',
  gem: '💎',
};

export const MODE_LABELS: Record<WormsMode, { short: string; full: string }> = {
  infinity: { short: 'INF', full: 'Infinity Run' },
  time: { short: 'TIME', full: 'Time Assault' },
  treasure: { short: 'TRE', full: 'Treasure Hunt' },
};

export const MODE_COLORS: Record<WormsMode, { panel: string; border: string }> = {
  infinity: { panel: 'bg-slate-900/70 text-sky-100', border: 'border-sky-400/70' },
  time: { panel: 'bg-violet-900/70 text-violet-100', border: 'border-violet-400/70' },
  treasure: { panel: 'bg-amber-900/70 text-amber-100', border: 'border-amber-400/70' },
};
