"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Play, RefreshCw, Zap, MousePointer2, Settings, X, Timer, Eye, Users } from 'lucide-react';
// WebSocket is loaded dynamically only when needed (client-side only)
import type { WormsMode } from '@/types/game';

type Vector = { x: number; y: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string };
type FoodType = 'apple' | 'berry' | 'coin' | 'gem' | 'star' | 'heart' | 'diamond' | 'crystal';
type Food = { x: number; y: number; radius: number; color: string; id: number; type: FoodType; image?: HTMLImageElement };
type PowerUpType = 'magnet' | 'foodMultiplier' | 'deathRadar' | 'speed' | 'maneuver' | 'zoom';
type PowerUp = { x: number; y: number; radius: number; color: string; id: number; type: PowerUpType };
type DeathMark = { x: number; y: number; life: number };
type SkinId = 'classic' | 'neon' | 'shadow' | 'gold' | 'cyber' | 'toxin' | 'crimson' | 'void' | 'rainbow' | 'fire' | 'ice' | 'electric';

// Dynamic arena sizing based on player count
const getArenaSize = (playerCount: number) => {
  const baseSize = 3000;
  const perPlayer = 200;
  return Math.min(baseSize + (playerCount * perPlayer), 10000); // Max 10k
};

const INITIAL_LENGTH = 20;
const SEGMENT_DIST = 8;
const BASE_SPEED = 4;
const BOOST_SPEED = 7;
const TURN_SPEED = 0.3;
const BOT_TURN_SPEED = 0.15;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 1.5;
const ZOOM_PER_SEGMENT = 0.001;
const POWERUP_SCORE_MULTIPLIER = 5;
const POWERUP_DURATION_TICKS = 60 * 8;
const MAX_PLAYERS = 100;
const MAX_BOTS = 50;

const POWERUP_TYPES: PowerUpType[] = ['magnet', 'foodMultiplier', 'deathRadar', 'speed', 'maneuver', 'zoom'];
const POWERUP_COLORS: Record<PowerUpType, string> = {
  magnet: '#ef4444',
  foodMultiplier: '#3b82f6',
  deathRadar: '#a855f7',
  speed: '#22c55e',
  maneuver: '#22c55e',
  zoom: '#facc15',
};
const POWERUP_LABELS: Record<PowerUpType, string> = {
  magnet: 'Magnet',
  foodMultiplier: 'x5 Food',
  deathRadar: 'Death Radar',
  speed: 'Speed Boost',
  maneuver: 'Maneuver',
  zoom: 'Zoom Out',
};

const POWERUP_ICONS: Record<PowerUpType, string> = {
  magnet: '🧲',
  foodMultiplier: '⚡',
  deathRadar: '📡',
  speed: '💨',
  maneuver: '🌀',
  zoom: '🔍',
};

// Enhanced skins matching worms.zone style
const SKINS: Record<SkinId, { base: string; boost: string; shield: string; pattern?: string }> = {
  classic: { base: 'hsl(142, 72%, 45%)', boost: 'hsl(142, 90%, 60%)', shield: 'hsl(160, 95%, 70%)' },
  neon: { base: 'hsl(187, 92%, 49%)', boost: 'hsl(187, 100%, 65%)', shield: 'hsl(196, 100%, 80%)' },
  shadow: { base: 'hsl(239, 84%, 67%)', boost: 'hsl(262, 84%, 70%)', shield: 'hsl(262, 100%, 82%)' },
  gold: { base: 'hsl(47, 96%, 57%)', boost: 'hsl(47, 100%, 70%)', shield: 'hsl(52, 100%, 80%)' },
  cyber: { base: 'hsl(330, 81%, 60%)', boost: 'hsl(330, 90%, 70%)', shield: 'hsl(330, 100%, 82%)' },
  toxin: { base: 'hsl(84, 81%, 59%)', boost: 'hsl(84, 90%, 68%)', shield: 'hsl(96, 100%, 80%)' },
  crimson: { base: 'hsl(0, 84%, 60%)', boost: 'hsl(0, 92%, 70%)', shield: 'hsl(0, 96%, 80%)' },
  void: { base: 'hsl(222, 47%, 11%)', boost: 'hsl(222, 47%, 20%)', shield: 'hsl(222, 70%, 30%)' },
  rainbow: { base: 'hsl(0, 100%, 50%)', boost: 'hsl(60, 100%, 50%)', shield: 'hsl(120, 100%, 50%)', pattern: 'rainbow' },
  fire: { base: 'hsl(0, 100%, 50%)', boost: 'hsl(30, 100%, 60%)', shield: 'hsl(60, 100%, 70%)' },
  ice: { base: 'hsl(200, 100%, 60%)', boost: 'hsl(200, 100%, 70%)', shield: 'hsl(200, 100%, 80%)' },
  electric: { base: 'hsl(60, 100%, 50%)', boost: 'hsl(60, 100%, 70%)', shield: 'hsl(60, 100%, 90%)' },
};

const FOOD_TYPES: FoodType[] = ['apple', 'berry', 'coin', 'gem', 'star', 'heart', 'diamond', 'crystal'];
const FOOD_COLORS: Record<FoodType, string> = {
  apple: '#ff4444',
  berry: '#ff88cc',
  coin: '#ffd700',
  gem: '#00ffff',
  star: '#ffff00',
  heart: '#ff69b4',
  diamond: '#b9f2ff',
  crystal: '#9370db',
};

const MODE_LABELS: Record<WormsMode, { short: string; full: string }> = {
  infinity: { short: 'INF', full: 'Infinity Run' },
  time: { short: 'TIME', full: 'Time Assault' },
  treasure: { short: 'TRE', full: 'Treasure Hunt' },
};

const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;
const randomColor = () => `hsl(${Math.random() * 360}, 70%, 60%)`;

type WormEntity = {
  id: string;
  head: Vector;
  body: Vector[];
  path: Vector[];
  angle: number;
  speed: number;
  color: string;
  boosting: boolean;
  name: string;
  isBot: boolean;
  skin?: SkinId;
  score: number;
};

type WormsGameEnhancedProps = {
  onGameOver?: (score: number) => void;
  playerName?: string;
  skinId?: SkinId;
  mode?: WormsMode;
  multiplayer?: boolean;
  roomId?: string;
  spectator?: boolean;
  onlinePlayers?: number;
};

export default function WormsGameEnhanced({
  onGameOver,
  playerName = 'Guest',
  skinId = 'classic',
  mode = 'infinity',
  multiplayer = false,
  roomId,
  spectator = false,
  onlinePlayers = 0,
}: WormsGameEnhancedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activePowerUps, setActivePowerUps] = useState<Partial<Record<PowerUpType, number>>>({});
  const [playerCount, setPlayerCount] = useState(onlinePlayers || 1);
  
  const wormRef = useRef<WormEntity>({
    id: 'player',
    head: { x: 0, y: 0 },
    body: [],
    path: [],
    angle: 0,
    speed: BASE_SPEED,
    color: SKINS[skinId].base,
    boosting: false,
    name: playerName,
    isBot: false,
    skin: skinId,
    score: 0,
  });

  const botsRef = useRef<WormEntity[]>([]);
  const onlinePlayersRef = useRef<Map<string, WormEntity>>(new Map());
  const foodRef = useRef<Food[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const cameraRef = useRef<Vector>({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);
  const ticksRef = useRef(0);
  const arenaSizeRef = useRef(getArenaSize(playerCount));

  // Load food images
  const foodImagesRef = useRef<Map<FoodType, HTMLImageElement>>(new Map());
  
  useEffect(() => {
    const loadFoodImages = async () => {
      const images = new Map<FoodType, HTMLImageElement>();
      for (const type of FOOD_TYPES) {
        const img = new Image();
        img.src = `/images/food/${type}.png`; // You'll need to add these images
        img.onerror = () => {
          // Fallback to colored circle if image not found
        };
        images.set(type, img);
      }
      foodImagesRef.current = images;
    };
    loadFoodImages();
  }, []);

  // WebSocket connection for multiplayer
  useEffect(() => {
    if (multiplayer && roomId && !spectator && typeof window !== 'undefined') {
      // Load websocket dynamically
      import('@/lib/websocket').then((module) => {
        module.gameSocket.connect(roomId, wormRef.current.id);
        
        module.gameSocket.on('game-state', (data: any) => {
          // Sync online players
          data.players?.forEach((p: any) => {
            if (p.id !== wormRef.current.id) {
              onlinePlayersRef.current.set(p.id, {
                id: p.id,
                head: { x: p.x, y: p.y },
                body: p.body || [],
                path: [],
                angle: p.angle,
                speed: BASE_SPEED,
                color: randomColor(),
                boosting: false,
                name: p.name || 'Player',
                isBot: false,
                score: p.score || 0,
              });
            }
          });
          setPlayerCount(onlinePlayersRef.current.size + botsRef.current.length + 1);
        });

        module.gameSocket.on('player-moved', (move: any) => {
          const existing = onlinePlayersRef.current.get(move.playerId);
          if (existing) {
            existing.head = { x: move.x, y: move.y };
            existing.angle = move.angle;
            existing.body = move.body || [];
            existing.score = move.score || 0;
          }
        });
      });

      return () => {
        import('@/lib/websocket').then((module) => {
          module.gameSocket.disconnect();
        }).catch(() => {});
      };
    }
  }, [multiplayer, roomId, spectator]);

  // Dynamic arena resizing
  useEffect(() => {
    arenaSizeRef.current = getArenaSize(playerCount);
  }, [playerCount]);

  // Initialize game
  const initGame = () => {
    const arenaSize = arenaSizeRef.current;
    const botCount = Math.min(Math.floor(playerCount * 0.3), MAX_BOTS);
    const foodCount = Math.max(250, playerCount * 15);
    const powerUpCount = Math.max(8, Math.floor(playerCount / 5));

    wormRef.current = {
      id: 'player',
      head: { x: arenaSize / 2, y: arenaSize / 2 },
      body: [],
      path: [],
      angle: Math.random() * Math.PI * 2,
      speed: BASE_SPEED,
      color: SKINS[skinId].base,
      boosting: false,
      name: playerName,
      isBot: false,
      skin: skinId,
      score: 0,
    };

    // Initialize body
    for (let i = 0; i < INITIAL_LENGTH; i++) {
      const angle = wormRef.current.angle;
      wormRef.current.body.push({
        x: wormRef.current.head.x - Math.cos(angle) * i * SEGMENT_DIST,
        y: wormRef.current.head.y - Math.sin(angle) * i * SEGMENT_DIST,
      });
    }

    // Spawn bots
    botsRef.current = [];
    for (let i = 0; i < botCount; i++) {
      const x = randomRange(100, arenaSize - 100);
      const y = randomRange(100, arenaSize - 100);
      const skinKeys = Object.keys(SKINS) as SkinId[];
      const randomSkinId = skinKeys[Math.floor(Math.random() * skinKeys.length)];
      const randomSkin = SKINS[randomSkinId];
      
      botsRef.current.push({
        id: `bot-${i}`,
        head: { x, y },
        body: [],
        path: [],
        angle: Math.random() * Math.PI * 2,
        speed: BASE_SPEED,
        color: randomSkin.base,
        boosting: false,
        name: `Bot ${i + 1}`,
        isBot: true,
        skin: randomSkinId,
        score: 0,
      });
    }

    // Spawn food
    foodRef.current = [];
    for (let i = 0; i < foodCount; i++) {
      const type = FOOD_TYPES[Math.floor(Math.random() * FOOD_TYPES.length)];
      foodRef.current.push({
        x: randomRange(50, arenaSize - 50),
        y: randomRange(50, arenaSize - 50),
        radius: randomRange(4, 8),
        color: FOOD_COLORS[type],
        id: Math.random(),
        type,
      });
    }

    // Spawn powerups
    powerUpsRef.current = [];
    for (let i = 0; i < powerUpCount; i++) {
      const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
      powerUpsRef.current.push({
        x: randomRange(80, arenaSize - 80),
        y: randomRange(80, arenaSize - 80),
        radius: 14,
        color: POWERUP_COLORS[type],
        id: Math.random(),
        type,
      });
    }

    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    ticksRef.current = 0;
  };

  // Main game loop would continue here with all the rendering and update logic...
  // This is a simplified version - the full implementation would include all game mechanics

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-700">
      <canvas ref={canvasRef} className="w-full h-full cursor-crosshair block" />
      
      {/* Powerup Indicators */}
      {Object.keys(activePowerUps).length > 0 && (
        <div className="absolute top-20 left-4 flex flex-col gap-2">
          {Object.entries(activePowerUps).map(([type, ticks]) => (
            <div
              key={type}
              className="px-3 py-2 bg-black/60 backdrop-blur rounded-lg border border-white/20 flex items-center gap-2"
            >
              <span className="text-2xl">{POWERUP_ICONS[type as PowerUpType]}</span>
              <div>
                <div className="text-xs text-white font-bold">{POWERUP_LABELS[type as PowerUpType]}</div>
                <div className="text-[10px] text-gray-400">{Math.ceil((ticks || 0) / 60)}s</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Player Count */}
      <div className="absolute top-4 right-4 px-4 py-2 bg-black/60 backdrop-blur rounded-lg border border-white/20 text-white text-sm flex items-center gap-2">
        <Users className="w-4 h-4" />
        {playerCount} Players
      </div>

      {/* Spectator Mode Indicator */}
      {spectator && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-purple-500/80 backdrop-blur rounded-lg border border-purple-300 text-white text-sm flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Spectator Mode
        </div>
      )}

      {!isPlaying && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-2">
            Block 21 Arena
          </h1>
          <p className="text-white/60 mb-8 text-lg">Eat. Grow. Conquer.</p>
          <button
            onClick={initGame}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-xl hover:scale-105 transition-transform"
          >
            <Play className="w-6 h-6" />
            {gameOver ? 'Play Again' : 'Play Now'}
          </button>
        </div>
      )}
    </div>
  );
}
