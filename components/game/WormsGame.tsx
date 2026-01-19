"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Play, RefreshCw, Zap, MousePointer2, Settings, X, Timer } from 'lucide-react';
import type { WormsMode, FoodType, PowerUpType, SkinId, Vector, Particle, Food, PowerUp, DeathMark, GameStats } from '@/types/game';
import { 
  GAME_CONFIG, 
  POWERUP_TYPES, 
  POWERUP_COLORS, 
  POWERUP_LABELS, 
  SKINS, 
  FOOD_TYPES, 
  FOOD_COLORS, 
  FOOD_EMOJIS,
  MODE_LABELS, 
  MODE_COLORS 
} from '@/lib/gameConfig';
import { gameSocket, PlayerMove } from '@/lib/websocket';

  const { 
  ARENA_SIZE, 
  INITIAL_LENGTH, 
  SEGMENT_DIST, 
  BASE_SPEED, 
  MIN_SPEED,
  BOOST_SPEED_MULTIPLIER,
  TURN_SPEED, 
  BOT_TURN_SPEED, 
  FOOD_COUNT, 
  MIN_FOOD_RADIUS,
  MAX_FOOD_RADIUS,
  MIN_ZOOM, 
  MAX_ZOOM, 
  ZOOM_PER_SEGMENT, 
  POWERUP_COUNT, 
  POWERUP_SCORE_MULTIPLIER, 
  POWERUP_DURATION_TICKS, 
  FOLLOW_STRENGTH, 
  BOT_COUNT, 
  TIME_ATTACK_DURATION_SECONDS, 
  TREASURE_HUNT_DURATION_SECONDS,
  B21_DECIMALS,
  FOOD_VALUE_B21,
  BOOST_DRAIN_BASE
} = GAME_CONFIG;

const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;
const randomColor = () => `hsl(${Math.random() * 360}, 70%, 60%)`;
const adjustColor = (hsl: string, amount: number) => {
  const parts = hsl.match(/hsl\((\d+(?:\.\d+)?),\s*(\d+)%,\s*(\d+)%\)/);
  if (!parts) return hsl;
  let h = parseFloat(parts[1]);
  let s = parseInt(parts[2]);
  let l = parseInt(parts[3]);
  l = Math.max(0, Math.min(100, l + amount));
  return `hsl(${h}, ${s}%, ${l}%)`;
};

const formatTime = (totalSeconds: number) => {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');
  return `${mm}:${ss}`;
};

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
  target?: Vector; // For AI
  state?: 'seeking' | 'fleeing' | 'wandering'; // For AI
};

type WormsGameProps = {
  onGameOver?: (stats: GameStats | number) => void;
  onProgress?: (progress: number) => void;
  playerName?: string;
  skinId?: SkinId;
  mode?: WormsMode;
  multiplayer?: boolean;
  roomId?: string;
};

export default function WormsGame({
  onGameOver: onGameOverProp,
  onProgress,
  playerName = 'Guest',
  skinId = 'classic',
  mode = 'infinity',
  multiplayer = false,
  roomId,
}: WormsGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game State
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showMouseRing, setShowMouseRing] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [, setChartRefreshKey] = useState(0);
  
  // Mutable Game State (Refs for performance)
  const wormRef = useRef<WormEntity>({
    id: 'player',
    head: { x: ARENA_SIZE / 2, y: ARENA_SIZE / 2 },
    body: [],
    path: [],
    angle: 0,
    speed: BASE_SPEED,
    color: '#00ff88',
    boosting: false,
    name: playerName,
    isBot: false,
  });

  const botsRef = useRef<WormEntity[]>([]);

  const foodRef = useRef<Food[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<Vector>({ x: 0, y: 0 });
  const cameraRef = useRef<Vector>({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);
  const joystickVectorRef = useRef<Vector>({ x: 0, y: 0 });
  const joystickActiveRef = useRef(false);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const activePowerUpsRef = useRef<Partial<Record<PowerUpType, number>>>({});
  const deathMarksRef = useRef<DeathMark[]>([]);
  const ticksRef = useRef(0);
  const lastSecondRef = useRef(0);

  // Remote players for multiplayer
  const remotePlayersRef = useRef<Map<string, PlayerMove>>(new Map());

  const resolvedSkin = SKINS[skinId] || SKINS.classic;

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Multiplayer connection effect
  useEffect(() => {
    if (!multiplayer || !roomId) return;

    const connect = async () => {
      // Connect to server
      await gameSocket.connect(roomId, wormRef.current.id);

      // Listen for updates
      gameSocket.on('player-joined', (data: any) => {
        console.log('Player joined:', data);
      });

      gameSocket.on('player-left', (data: { playerId: string }) => {
        if (data?.playerId) {
          remotePlayersRef.current.delete(data.playerId);
        }
      });

      gameSocket.on('player-moved', (move: PlayerMove) => {
        // Don't update self
        if (move && move.playerId && move.playerId !== wormRef.current.id) {
          remotePlayersRef.current.set(move.playerId, move);
        }
      });

      gameSocket.on('game-state', (state: any) => {
        if (!state) return;
        
        // Sync full state if needed
        if (Array.isArray(state.players)) {
          state.players.forEach((p: PlayerMove) => {
            if (p && p.playerId !== wormRef.current.id) {
              remotePlayersRef.current.set(p.playerId, p);
            }
          });
        }
        if (state.food) {
          // Merge server food with local if needed, or replace
          // For now, let's just add missing ones to avoid flickering
        }
      });
    };

    connect();

    return () => {
      gameSocket.disconnect();
      remotePlayersRef.current.clear();
    };
  }, [multiplayer, roomId]);

  useEffect(() => {
    if (!isPlaying && !gameOver) {
      initGame();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJoystickStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left - rect.width / 2;
    const y = touch.clientY - rect.top - rect.height / 2;
    joystickVectorRef.current = { x, y };
    joystickActiveRef.current = true;
    e.preventDefault();
  };

  const handleJoystickMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left - rect.width / 2;
    const y = touch.clientY - rect.top - rect.height / 2;
    joystickVectorRef.current = { x, y };
    joystickActiveRef.current = true;
    e.preventDefault();
  };

  const handleJoystickEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    joystickActiveRef.current = false;
    joystickVectorRef.current = { x: 0, y: 0 };
    e.preventDefault();
  };

  const handleBoostPress = () => {
    wormRef.current.boosting = true;
  };

  const handleBoostRelease = () => {
    wormRef.current.boosting = false;
  };

  const createWorm = (isBot: boolean, startX: number, startY: number, id: string, name: string, color: string): WormEntity => {
    const angle = Math.random() * Math.PI * 2;
    const worm: WormEntity = {
      id,
      head: { x: startX, y: startY },
      body: [],
      path: [],
      angle,
      speed: BASE_SPEED,
      color,
      boosting: false,
      name,
      isBot,
      state: 'wandering',
    };

    // Pre-fill path
    for (let i = 0; i < INITIAL_LENGTH * SEGMENT_DIST; i++) {
      worm.path.push({
        x: startX - Math.cos(angle) * i,
        y: startY - Math.sin(angle) * i,
      });
    }

    // Create initial segments
    let currentDist = SEGMENT_DIST;
    for (let i = 0; i < INITIAL_LENGTH; i++) {
      const pathIdx = Math.min(worm.path.length - 1, Math.floor(currentDist));
      worm.body.push({ ...worm.path[pathIdx] });
      currentDist += SEGMENT_DIST;
    }

    return worm;
  };

  const spawnBot = () => {
    const x = randomRange(100, ARENA_SIZE - 100);
    const y = randomRange(100, ARENA_SIZE - 100);
    const skinKeys = Object.keys(SKINS) as SkinId[];
    const randomSkin = SKINS[skinKeys[Math.floor(Math.random() * skinKeys.length)]];
    const botName = `Bot ${Math.floor(Math.random() * 999)}`;
    
    const bot = createWorm(true, x, y, `bot-${Math.random()}`, botName, randomSkin.base);
    botsRef.current.push(bot);
  };

  const initGame = () => {
    wormRef.current = createWorm(
      false, 
      ARENA_SIZE / 2, 
      ARENA_SIZE / 2, 
      'player', 
      playerName, 
      resolvedSkin.base
    );

    botsRef.current = [];
    for (let i = 0; i < BOT_COUNT; i++) {
      spawnBot();
    }

    foodRef.current = spawnFood(FOOD_COUNT);

    powerUpsRef.current = [];
    for (let i = 0; i < POWERUP_COUNT; i++) {
      spawnPowerUp();
    }
    activePowerUpsRef.current = {};
    deathMarksRef.current = [];

    ticksRef.current = 0;
    lastSecondRef.current = 0;
    setElapsedSeconds(0);
    if (mode === 'infinity') {
      setRemainingSeconds(null);
    } else if (mode === 'time') {
      setRemainingSeconds(TIME_ATTACK_DURATION_SECONDS);
    } else {
      setRemainingSeconds(TREASURE_HUNT_DURATION_SECONDS);
    }

    setScore(0);
    collectedRef.current = 0;
    defeatedRef.current = 0;
    experienceRef.current = 0;
    setGameOver(false);
    setIsPlaying(true);
  };

  // Calculate dynamic game state
  const totalMass = useRef(0);
  const currentArenaSize = useRef(ARENA_SIZE);
  
  // Stats for game over screen
  const collectedRef = useRef(0);
  const defeatedRef = useRef(0);
  const experienceRef = useRef(0);

  // Helper to get current speed based on mass
  const getSpeed = (mass: number) => {
    // Speed = max(1.6 , 4.2 - log10(balance+1 ))
    // Here mass is roughly equivalent to segments, we can treat it as balance proxy
    const speed = Math.max(MIN_SPEED, BASE_SPEED - Math.log10(mass + 1));
    return speed;
  };

  const spawnFood = (count: number, center?: Vector, radius?: number) => {
    const newFood: Food[] = [];
    for (let i = 0; i < count; i++) {
      let x, y;
      if (center && radius) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * radius;
        x = center.x + Math.cos(angle) * dist;
        y = center.y + Math.sin(angle) * dist;
      } else {
        // Spawn within dynamic map bounds
        const bounds = currentArenaSize.current / 2;
        x = randomRange(-bounds + 50, bounds - 50);
        y = randomRange(-bounds + 50, bounds - 50);
      }

      const type = FOOD_TYPES[Math.floor(Math.random() * FOOD_TYPES.length)];
      // Food unit system: 1 food = 0.00000001 B21
      // Bigger food = more mass/value
      const sizeMultiplier = (type === 'coin' || type === 'gem') ? 1.5 : 1.0;
      
      newFood.push({
        x,
        y,
        radius: randomRange(MIN_FOOD_RADIUS, MAX_FOOD_RADIUS) * sizeMultiplier,
        color: FOOD_COLORS[type],
        id: Math.random(),
        type,
      });
    }
    return newFood;
  };

  const spawnPowerUp = () => {
    const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
    const color = POWERUP_COLORS[type];
    powerUpsRef.current.push({
      x: randomRange(80, ARENA_SIZE - 80),
      y: randomRange(80, ARENA_SIZE - 80),
      radius: 14,
      color,
      id: Math.random(),
      type,
    });
  };

  const createParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomRange(1, 4);
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color,
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseDown = () => { wormRef.current.boosting = true; };
    const handleMouseUp = () => { wormRef.current.boosting = false; };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);

    const loop = () => {
      if (!isPlaying || gameOver) {
        // Draw one frame even if paused to show background
        if (!isPlaying && !gameOver) render(ctx, canvas); 
        if (isPlaying) animationFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      update();
      render(ctx, canvas);
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    const updateWormPos = (worm: WormEntity, targetAngle: number, turnSpeed: number, baseSpeed: number, boostSpeed: number) => {
      let diff = targetAngle - worm.angle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      worm.angle += diff * turnSpeed;

      const currentSpeed = worm.boosting ? boostSpeed : baseSpeed;
      worm.head.x += Math.cos(worm.angle) * currentSpeed;
      worm.head.y += Math.sin(worm.angle) * currentSpeed;

      worm.path.unshift({ ...worm.head });

      let currentPathDist = 0;
      let nextBodyDist = SEGMENT_DIST;
      let bodyIdx = 0;

      for (let i = 0; i < worm.path.length - 1; i++) {
        if (bodyIdx >= worm.body.length) break;

        const p1 = worm.path[i];
        const p2 = worm.path[i + 1];
        const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);

        while (currentPathDist + d > nextBodyDist) {
          if (bodyIdx >= worm.body.length) break;

          const remain = nextBodyDist - currentPathDist;
          const ratio = remain / d;
          const tx = p1.x + (p2.x - p1.x) * ratio;
          const ty = p1.y + (p2.y - p1.y) * ratio;

          worm.body[bodyIdx].x = tx;
          worm.body[bodyIdx].y = ty;

          bodyIdx++;
          nextBodyDist += SEGMENT_DIST;
        }
        currentPathDist += d;
      }

      const maxPathLen = Math.floor(worm.body.length * SEGMENT_DIST / 2) + 100;
      if (worm.path.length > maxPathLen) {
        worm.path.length = maxPathLen;
      }
      
      if (worm.boosting && worm.body.length > INITIAL_LENGTH) {
        worm.body.pop();
      }
    };

    const checkCollisions = (worm: WormEntity) => {
      if (
        worm.head.x < 0 || worm.head.x > ARENA_SIZE ||
        worm.head.y < 0 || worm.head.y > ARENA_SIZE
      ) {
        return true;
      }

      const allWorms = [wormRef.current, ...botsRef.current];
      for (const other of allWorms) {
        if (other === worm) continue;
        
        const dx = Math.abs(worm.head.x - other.head.x);
        if (dx > 2000) continue;

        for (const seg of other.body) {
           const dist = Math.hypot(worm.head.x - seg.x, worm.head.y - seg.y);
           if (dist < SEGMENT_DIST) {
             return true;
           }
        }
      }
      return false;
    };

    const turnBotToFood = (bot: WormEntity) => {
      const margin = 100;
      if (bot.head.x < margin) return 0;
      if (bot.head.x > ARENA_SIZE - margin) return Math.PI;
      if (bot.head.y < margin) return Math.PI / 2;
      if (bot.head.y > ARENA_SIZE - margin) return -Math.PI / 2;

      let nearest = null;
      let minDist = 1000;
      
      for (const f of foodRef.current) {
        const d = Math.hypot(bot.head.x - f.x, bot.head.y - f.y);
        if (d < minDist) {
          minDist = d;
          nearest = f;
        }
      }
      
      if (nearest) {
        return Math.atan2(nearest.y - bot.head.y, nearest.x - bot.head.x);
      }
      return bot.angle + (Math.random() - 0.5) * 0.2; // Wander
    };

    const update = () => {
      const player = wormRef.current;
      const activeMap: Partial<Record<PowerUpType, number>> = { ...activePowerUpsRef.current };
      const keys = Object.keys(activeMap) as PowerUpType[];
      for (const k of keys) {
        const remaining = (activeMap[k] || 0) - 1;
        if (remaining > 0) {
          activeMap[k] = remaining;
        } else {
          delete activeMap[k];
        }
      }
      activePowerUpsRef.current = activeMap;
      const magnetActive = (activeMap.magnet || 0) > 0;
      const foodMultiplierActive = (activeMap.foodMultiplier || 0) > 0;
      const speedTicks = activeMap.speed || 0;
      const maneuverTicks = activeMap.maneuver || 0;
      const speedMultiplier = speedTicks > 0 ? 1.4 : 1;
      const maneuverMultiplier = maneuverTicks > 0 ? 1.3 : 1;
      const baseSpeed = getSpeed(player.body.length) * speedMultiplier;
      const boostSpeed = (baseSpeed * BOOST_SPEED_MULTIPLIER);
      
      let targetAngle = player.angle;

      if (joystickActiveRef.current) {
        const v = joystickVectorRef.current;
        if (v.x !== 0 || v.y !== 0) {
          targetAngle = Math.atan2(v.y, v.x);
        }
      } else {
        const canvasEl = canvasRef.current;
        if (canvasEl) {
          const rect = canvasEl.getBoundingClientRect();
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const dx = mouseRef.current.x - centerX;
          const dy = mouseRef.current.y - centerY;
          if (dx !== 0 || dy !== 0) {
            targetAngle = Math.atan2(dy, dx);
          }
        }
      }

      updateWormPos(player, targetAngle, TURN_SPEED * maneuverMultiplier, baseSpeed, boostSpeed);

      if (checkCollisions(player)) {
        deathMarksRef.current.push({
          x: player.head.x,
          y: player.head.y,
          life: 1,
        });
        handleGameOver();
        return;
      }

      for (let i = botsRef.current.length - 1; i >= 0; i--) {
        const bot = botsRef.current[i];
        const botTarget = turnBotToFood(bot);
        const botBaseSpeed = getSpeed(bot.body.length);
        updateWormPos(bot, botTarget, BOT_TURN_SPEED, botBaseSpeed, botBaseSpeed * BOOST_SPEED_MULTIPLIER);
        
        if (checkCollisions(bot)) {
          for (let j = 0; j < bot.body.length; j += 2) {
             const seg = bot.body[j];
             foodRef.current.push({
               x: seg.x + randomRange(-5, 5),
               y: seg.y + randomRange(-5, 5),
               radius: randomRange(4, 8),
               color: bot.color,
               id: Math.random(),
               type: 'gem',
             });
          }
          createParticles(bot.head.x, bot.head.y, bot.color, 20);
          deathMarksRef.current.push({
            x: bot.head.x,
            y: bot.head.y,
            life: 1,
          });
          defeatedRef.current += 1; // Count as defeated
          botsRef.current.splice(i, 1);
          spawnBot();
        }
      }

      const allWorms = [player, ...botsRef.current];
      const captureRadius = magnetActive ? 30 : 25;

      for (let i = foodRef.current.length - 1; i >= 0; i--) {
        const f = foodRef.current[i];
        let eaten = false;
        if (magnetActive) {
          const dxMag = player.head.x - f.x;
          const dyMag = player.head.y - f.y;
          const distMag = Math.hypot(dxMag, dyMag);
          if (distMag < 220 && distMag > 1) {
            const pull = 3 * (1 - distMag / 220);
            f.x += (dxMag / distMag) * pull;
            f.y += (dyMag / distMag) * pull;
          }
        }
        
        for (const worm of allWorms) {
           const dist = Math.hypot(worm.head.x - f.x, worm.head.y - f.y);
           if (dist < captureRadius) {
             const tail = worm.body[worm.body.length - 1];
             if (tail) worm.body.push({ ...tail });
             
             if (worm === player) {
                createParticles(f.x, f.y, f.color, 5);
                const basePoints = 10;
                const multiplier = foodMultiplierActive ? POWERUP_SCORE_MULTIPLIER : 1;
                setScore(s => s + basePoints * multiplier);
                collectedRef.current += 1;
             }
             eaten = true;
             break;
           }
        }
        
        if (eaten) {
          foodRef.current.splice(i, 1);
          foodRef.current.push(...spawnFood(1));
        }
      }

      for (let i = powerUpsRef.current.length - 1; i >= 0; i--) {
        const p = powerUpsRef.current[i];
        const dist = Math.hypot(player.head.x - p.x, player.head.y - p.y);
        if (dist < 28) {
          const updated = { ...activePowerUpsRef.current };
          updated[p.type] = POWERUP_DURATION_TICKS;
          activePowerUpsRef.current = updated;
          powerUpsRef.current.splice(i, 1);
          spawnPowerUp();
          createParticles(p.x, p.y, p.color, 14);
        }
      }

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        if (p.life <= 0) particlesRef.current.splice(i, 1);
      }
      for (let i = deathMarksRef.current.length - 1; i >= 0; i--) {
        const m = deathMarksRef.current[i];
        m.life -= 0.02;
        if (m.life <= 0) {
          deathMarksRef.current.splice(i, 1);
        }
      }

      ticksRef.current += 1;
      const seconds = Math.floor(ticksRef.current / 60);
      if (seconds !== lastSecondRef.current) {
        lastSecondRef.current = seconds;
        if (mode === 'infinity') {
          setElapsedSeconds(seconds);
        } else {
          const total =
            mode === 'time' ? TIME_ATTACK_DURATION_SECONDS : TREASURE_HUNT_DURATION_SECONDS;
          const remaining = Math.max(total - seconds, 0);
          setElapsedSeconds(total - remaining);
          setRemainingSeconds(remaining);
          if (remaining <= 0) {
            handleGameOver();
            return;
          }
        }
        setChartRefreshKey((v) => v + 1);
      }
    };

    const render = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const player = wormRef.current;
      const extraLength = Math.max(0, player.body.length - INITIAL_LENGTH);
      const activeMap = activePowerUpsRef.current;
      const zoomActive = (activeMap.zoom || 0) > 0;
      const deathRadarActive = (activeMap.deathRadar || 0) > 0;
      const speedActive = (activeMap.speed || 0) > 0;
      const maneuverActive = (activeMap.maneuver || 0) > 0;
      let zoom = Math.max(MIN_ZOOM, MAX_ZOOM - extraLength * ZOOM_PER_SEGMENT);
      if (zoomActive && zoom > MIN_ZOOM) {
        zoom = Math.max(MIN_ZOOM, zoom * 0.8);
      }
      // Send multiplayer updates
      if (multiplayer && isPlaying && ticksRef.current % 3 === 0) {
        gameSocket.sendPlayerMove({
          playerId: wormRef.current.id,
          x: wormRef.current.head.x,
          y: wormRef.current.head.y,
          angle: wormRef.current.angle,
          body: wormRef.current.body,
          score: score
        });
      }

      const targetCamX = player.head.x - canvas.width / 2;
      const targetCamY = player.head.y - canvas.height / 2;
      
      cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.1;
      cameraRef.current.y += (targetCamY - cameraRef.current.y) * 0.1;

      const depthFactor = Math.min(extraLength / 80, 1);
      const baseBg = 15;
      const darkerBg = 4;
      const bgChannel = Math.round(baseBg + (darkerBg - baseBg) * depthFactor);

      ctx.save();
      
      ctx.fillStyle = `rgb(${bgChannel}, ${bgChannel + 4}, ${bgChannel + 16})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const modeTint =
        mode === 'time' ? 'rgba(129, 140, 248, 0.25)' :
        mode === 'treasure' ? 'rgba(245, 158, 11, 0.2)' :
        'rgba(56, 189, 248, 0.18)';
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 1.2
      );
      gradient.addColorStop(0, modeTint);
      gradient.addColorStop(1, 'rgba(15,23,42,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (showMouseRing) {
        ctx.save();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      ctx.translate(-cameraRef.current.x, -cameraRef.current.y);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 10;
      ctx.strokeRect(0, 0, ARENA_SIZE, ARENA_SIZE);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      const gridSize = 100;
      for (let x = 0; x <= ARENA_SIZE; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ARENA_SIZE); ctx.stroke();
      }
      for (let y = 0; y <= ARENA_SIZE; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ARENA_SIZE, y); ctx.stroke();
      }

      if (deathRadarActive) {
        deathMarksRef.current.forEach(m => {
          ctx.save();
          ctx.globalAlpha = m.life;
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(m.x, m.y, 40 + (1 - m.life) * 20, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        });
      }

      foodRef.current.forEach(f => {
        // Glow effect for food
        ctx.shadowBlur = 15;
        ctx.shadowColor = f.color;
        
        // Draw Emoji
        ctx.font = `${f.radius * 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Check if emoji exists, otherwise fallback to circle
        const emoji = FOOD_EMOJIS[f.type];
        
        if (emoji) {
          ctx.shadowBlur = 0; // Clear shadow for crisp emoji
          // Draw glow circle behind emoji for better visibility
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.radius * 0.8, 0, Math.PI * 2);
          
          ctx.globalAlpha = 0.25;
          ctx.fillStyle = f.color;
          ctx.fill();
          ctx.globalAlpha = 1.0;

          ctx.fillStyle = f.color;
          ctx.fillText(
            emoji,
            f.x,
            f.y + (f.radius * 0.1) // Slight vertical adjustment
          );
        } else {
          // Fallback to neon circle
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
          ctx.fillStyle = f.color;
          ctx.fill();
        }
        
        ctx.shadowBlur = 0;
      });

      particlesRef.current.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      const drawWorm = (w: WormEntity) => {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const isPlayer = w.id === 'player';
        const baseColor = isPlayer ? resolvedSkin.base : w.color;
        const boostColor = isPlayer ? resolvedSkin.boost : w.color;
        const shieldColor = isPlayer ? resolvedSkin.shield : w.color;
        const boostVisual = isPlayer && (speedActive || wormRef.current.boosting);
        const shieldVisual = isPlayer && (maneuverActive || deathRadarActive);

        ctx.shadowBlur = boostVisual ? 28 : 20;
        ctx.shadowColor = boostVisual ? boostColor : baseColor;
        
        for (let i = w.body.length - 1; i >= 0; i--) {
          const seg = w.body[i];
          const pulse =
            boostVisual ? 1 + 0.12 * Math.sin((ticksRef.current + i * 3) * 0.15) : 1;
          const size = (12 + (i / w.body.length) * 4) * pulse; 
          
          ctx.beginPath();
          ctx.arc(seg.x, seg.y, size, 0, Math.PI * 2);
          
          if (i % 3 === 0) {
             ctx.fillStyle = boostVisual ? boostColor : baseColor;
          } else {
             ctx.fillStyle = adjustColor(boostVisual ? boostColor : baseColor, -10); 
          }
          
          ctx.fill();
        }
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(w.head.x, w.head.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        if (shieldVisual) {
          ctx.save();
          ctx.strokeStyle = shieldColor;
          ctx.lineWidth = 3;
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.arc(w.head.x, w.head.y, 22 + 2 * Math.sin(ticksRef.current * 0.2), 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        const eyeOffset = 8;
        const eyeX = w.head.x + Math.cos(w.angle - 0.5) * eyeOffset;
        const eyeY = w.head.y + Math.sin(w.angle - 0.5) * eyeOffset;
        const eyeX2 = w.head.x + Math.cos(w.angle + 0.5) * eyeOffset;
        const eyeY2 = w.head.y + Math.sin(w.angle + 0.5) * eyeOffset;

        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(eyeX, eyeY, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(eyeX2, eyeY2, 4, 0, Math.PI * 2); ctx.fill();

        // Name Tag
        ctx.fillStyle = '#e5e7eb';
        ctx.font = 'bold 14px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(w.name, w.head.x, w.head.y - 24);
      };

      // Draw remote players
    if (multiplayer) {
      remotePlayersRef.current.forEach((remotePlayer) => {
        if (!remotePlayer || !remotePlayer.playerId || !remotePlayer.body) return;
        
        // Use a consistent skin color based on player ID hash or metadata
        // For now, let's pick a random skin from our presets based on ID char
        const skinKeys = Object.keys(SKINS) as SkinId[];
        const charCode = remotePlayer.playerId.charCodeAt(0) || 0;
        const skinIndex = charCode % skinKeys.length;
        const skin = SKINS[skinKeys[skinIndex]];
        
        // Draw Body
          ctx.shadowBlur = 15;
          ctx.shadowColor = skin.base;
          
          // Draw segments from tail to head
          for (let i = remotePlayer.body.length - 1; i >= 0; i--) {
            const segment = remotePlayer.body[i];
            const size = 10; // Base size
            
            ctx.fillStyle = i % 2 === 0 ? skin.base : adjustColor(skin.base, -10);
            ctx.beginPath();
            ctx.arc(
              (segment.x - cameraRef.current.x) * zoom,
              (segment.y - cameraRef.current.y) * zoom,
              size * zoom,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }

          // Draw Head
          const headX = (remotePlayer.x - cameraRef.current.x) * zoom;
          const headY = (remotePlayer.y - cameraRef.current.y) * zoom;
          const headSize = 12 * zoom;

          // Head glow
          ctx.shadowBlur = 20;
          ctx.shadowColor = skin.boost;
          
          ctx.fillStyle = skin.base;
          ctx.beginPath();
          ctx.arc(headX, headY, headSize, 0, Math.PI * 2);
          ctx.fill();

          // Eyes
          const eyeOffset = 4 * zoom;
          const eyeSize = 3 * zoom;
          const angle = remotePlayer.angle;

          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 0;
          
          // Left Eye
          ctx.beginPath();
          ctx.arc(
            headX + Math.cos(angle - 0.5) * eyeOffset,
            headY + Math.sin(angle - 0.5) * eyeOffset,
            eyeSize,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Right Eye
          ctx.beginPath();
          ctx.arc(
            headX + Math.cos(angle + 0.5) * eyeOffset,
            headY + Math.sin(angle + 0.5) * eyeOffset,
            eyeSize,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Name Tag
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'black';
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${12 * zoom}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(
            remotePlayer.playerId.slice(0, 6),
            headX,
            headY - 20 * zoom
          );
          
          // Reset shadow
          ctx.shadowBlur = 0;
        });
      }

      botsRef.current.forEach(bot => drawWorm(bot));

      drawWorm(player);

      powerUpsRef.current.forEach(p => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - p.radius);
        for (let i = 1; i < 6; i++) {
          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
          ctx.lineTo(p.x + Math.cos(angle) * p.radius, p.y + Math.sin(angle) * p.radius);
        }
        ctx.closePath();
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      });

      const miniSize = 170;
      const miniPadding = 18;
      const miniX = canvas.width - miniSize - miniPadding;
      const miniY = canvas.height - miniSize - miniPadding;
      const scale = miniSize / ARENA_SIZE;

      ctx.save();
      ctx.translate(miniX, miniY);
      ctx.fillStyle = 'rgba(15,23,42,0.92)';
      ctx.fillRect(0, 0, miniSize, miniSize);
      ctx.strokeStyle = 'rgba(148,163,184,0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, miniSize, miniSize);

      ctx.fillStyle = 'rgba(51,65,85,0.9)';
      ctx.fillRect(6, 6, miniSize - 12, miniSize - 12);

      ctx.fillStyle = 'rgba(148,163,184,0.35)';
      const miniGrid = 400;
      for (let x = 0; x <= ARENA_SIZE; x += miniGrid) {
        const gx = (x / ARENA_SIZE) * (miniSize - 12) + 6;
        ctx.fillRect(gx, 6, 1, miniSize - 12);
      }
      for (let y = 0; y <= ARENA_SIZE; y += miniGrid) {
        const gy = (y / ARENA_SIZE) * (miniSize - 12) + 6;
        ctx.fillRect(6, gy, miniSize - 12, 1);
      }

      const drawDot = (x: number, y: number, radius: number, color: string) => {
        const sx = x * scale;
        const sy = y * scale;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      };

      botsRef.current.forEach(bot => {
        drawDot(bot.head.x, bot.head.y, 2.2, 'rgba(148,163,184,0.8)');
      });

      drawDot(player.head.x, player.head.y, 3.6, resolvedSkin.base);

      ctx.restore();

      ctx.restore();
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPlaying, gameOver, showMouseRing]);

  const handleGameOver = () => {
    setGameOver(true);
    setIsPlaying(false);
    if (score > highScore) setHighScore(score);
    
    // Pass detailed stats to parent
    if (onGameOverProp) {
      const stats: GameStats = {
        score,
        collected: collectedRef.current,
        defeated: defeatedRef.current,
        experience: Math.floor(score / 5), // Simple XP formula
        lifetime: Math.floor(ticksRef.current / 60), // Assuming 60fps
      };
      onGameOverProp(stats);
    }
    if (onProgress) onProgress(score);
  };

  const activePowerUpsList = Object.keys(activePowerUpsRef.current) as PowerUpType[];
  const modeLabel = MODE_LABELS[mode];
  const timerLabel =
    mode === 'infinity'
      ? `TIME • ${formatTime(elapsedSeconds)}`
      : `REMAIN • ${formatTime(remainingSeconds ?? 0)}`;

  const chartEntries: {
    id: string;
    name: string;
    isPlayer: boolean;
    length: number;
    consumption: number;
  }[] = [];

  const playerEntity = wormRef.current;
  const playerLength = playerEntity.body.length || INITIAL_LENGTH;

  chartEntries.push({
    id: playerEntity.id,
    name: playerName,
    isPlayer: true,
    length: playerLength,
    consumption: Math.max(0, playerLength - INITIAL_LENGTH),
  });

  botsRef.current.forEach((bot) => {
    const length = bot.body.length || INITIAL_LENGTH;
    chartEntries.push({
      id: bot.id,
      name: bot.name,
      isPlayer: false,
      length,
      consumption: Math.max(0, length - INITIAL_LENGTH),
    });
  });

  chartEntries.sort((a, b) => b.consumption - a.consumption);
  const chartWorms = chartEntries.slice(0, 4);
  const maxConsumption = chartWorms.reduce(
    (max, item) => (item.consumption > max ? item.consumption : max),
    0
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[480px] rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-700"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair block"
      />

      <div className="absolute top-4 left-4 flex gap-4">
        <div className="px-4 py-2 bg-black/50 backdrop-blur rounded-lg border border-white/10 text-white font-bold">
          Score: {score}
        </div>
        <div className="px-4 py-2 bg-yellow-500/20 backdrop-blur rounded-lg border border-yellow-500/50 text-yellow-200 font-bold">
          High Score: {highScore}
        </div>
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <div
          className={[
            'inline-flex items-center gap-3 px-4 py-2 rounded-full border backdrop-blur-md text-xs sm:text-sm font-semibold shadow-lg',
            MODE_COLORS[mode].panel,
            MODE_COLORS[mode].border,
          ].join(' ')}
        >
          <span className="inline-flex items-center gap-1 font-mono uppercase tracking-[0.25em] text-[10px] sm:text-[11px]">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/40 border border-white/30 text-[10px]">
              {modeLabel.short}
            </span>
            {modeLabel.full}
          </span>
          <span className="flex items-center gap-1 text-white/80">
            <Timer className="w-4 h-4 text-emerald-300" />
            <span className="font-mono text-[11px] sm:text-xs">{timerLabel}</span>
          </span>
        </div>
      </div>

      <div className="absolute top-4 right-4 px-4 py-3 bg-black/55 backdrop-blur rounded-2xl border border-white/10 text-white text-xs sm:text-sm w-80 max-w-[85vw]">
        <div className="font-semibold mb-1">Leaderboard</div>
        <div className="flex justify-between gap-4">
          <span>{playerName}</span>
          <span className="font-mono">{score}</span>
        </div>
        <div className="flex justify-between gap-4 text-white/60 mt-1">
          <span>Best Run</span>
          <span className="font-mono">{highScore}</span>
        </div>
        {activePowerUpsList.length > 0 && (
          <div className="mt-2 text-xs text-amber-300 space-y-1">
            {activePowerUpsList.map((type) => (
              <div key={type} className="flex items-center justify-between gap-2">
                <span>{POWERUP_LABELS[type]}</span>
                <span className="font-mono text-[10px]">
                  {Math.ceil(((activePowerUpsRef.current[type] || 0) / 60))}s
                </span>
              </div>
            ))}
          </div>
        )}
        {chartWorms.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-slate-300">
                Size Ladder
              </span>
              <span className="text-[10px] text-slate-500">
                Mass by food
              </span>
            </div>
            <div className="space-y-1.5">
              {chartWorms.map((entry, index) => {
                const ratio = maxConsumption > 0 ? entry.consumption / maxConsumption : 0;
                const width = 35 + ratio * 65;
                const thickness = 12 + ratio * 18;
                const isPlayer = entry.isPlayer;
                const barColor = isPlayer ? resolvedSkin.base : 'rgba(148,163,184,1)';
                const label = isPlayer ? 'You' : entry.name;

                return (
                  <div key={entry.id} className="flex items-center gap-2">
                    <div className="w-4 text-[10px] text-slate-500 font-mono text-right">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div
                        className="relative rounded-full bg-slate-900/70 border border-slate-700/80 overflow-hidden"
                        style={{ height: thickness }}
                      >
                        <div
                          className="absolute inset-y-[2px] left-[2px] rounded-full shadow-[0_0_18px_rgba(52,211,153,0.6)]"
                          style={{
                            width: `${width}%`,
                            background: barColor,
                            opacity: isPlayer ? 1 : 0.9,
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-20 text-[10px] text-right text-slate-200 truncate">
                      {label}
                    </div>
                    <div className="w-12 text-[10px] font-mono text-right text-emerald-300">
                      {entry.consumption}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-4 text-white/50 text-sm pointer-events-none hidden md:block">
        <div className="flex items-center gap-2">
          <MousePointer2 className="w-4 h-4" /> Move Mouse to Steer
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Zap className="w-4 h-4" /> Click & Hold to Boost
        </div>
      </div>

      <div className="absolute bottom-4 left-4 md:hidden">
        <div
          className="w-24 h-24 rounded-full border border-white/20 bg-black/40 flex items-center justify-center touch-none"
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
        >
          <div className="w-10 h-10 rounded-full bg-white/30" />
        </div>
      </div>

      <div className="absolute bottom-4 right-4 md:hidden">
        <button
          className="w-20 h-20 rounded-full bg-green-500/80 text-black font-bold text-lg border border-white/40 active:scale-95"
          onMouseDown={handleBoostPress}
          onMouseUp={handleBoostRelease}
          onMouseLeave={handleBoostRelease}
          onTouchStart={handleBoostPress}
          onTouchEnd={handleBoostRelease}
        >
          Boost
        </button>
      </div>

      {!isPlaying && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm relative">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-2 filter drop-shadow-lg">
            Block 21 Arena
          </h1>
          <p className="text-white/60 mb-8 text-lg">Eat. Grow. Conquer.</p>
          
          <div className="flex flex-col gap-4 w-64">
            <button
              onClick={initGame}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              {gameOver ? <RefreshCw className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              {gameOver ? 'Try Again' : 'Play Now'}
            </button>
            
            {gameOver && (
              <div className="text-center mt-4">
                <p className="text-white text-xl">Game Over!</p>
                <p className="text-white/60">Final Score: {score}</p>
              </div>
            )}
          </div>

          <button
            type="button"
            className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-slate-900/80 border border-slate-500/70 flex items-center justify-center text-white shadow-xl hover:bg-slate-800/90 hover:border-slate-300/80 transition-colors"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="w-7 h-7" />
          </button>
        </div>
      )}

      {showSettings && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-80 max-w-full rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Settings</h2>
              <button
                type="button"
                className="p-1 rounded-full hover:bg-slate-800 text-slate-300"
                onClick={() => setShowSettings(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mouse indicator</p>
                  <p className="text-xs text-slate-400">Show ring around cursor while aiming</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMouseRing((v) => !v)}
                  className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors ${
                    showMouseRing ? "bg-emerald-400" : "bg-slate-600"
                  }`}
                >
                  <span
                    className={`h-4 w-4 rounded-full bg-white transform transition-transform ${
                      showMouseRing ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-400">
                Use this panel to adjust how your arena feels. More options
                like audio, graphics, and controls can plug in here later.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
