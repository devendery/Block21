"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Play, RefreshCw, Zap, MousePointer2 } from 'lucide-react';

// --- Types ---
type Vector = { x: number; y: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string };
type Food = { x: number; y: number; radius: number; color: string; id: number };

// --- Constants ---
const ARENA_SIZE = 2000; // Larger arena
const INITIAL_LENGTH = 20;
const SEGMENT_DIST = 8;
const BASE_SPEED = 3;
const BOOST_SPEED = 6;
const TURN_SPEED = 0.08;
const FOOD_COUNT = 100;

// Random Helper
const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;
const randomColor = () => `hsl(${Math.random() * 360}, 70%, 60%)`;
// Helper to darken/lighten HSL
const adjustColor = (hsl: string, amount: number) => {
    // Basic parsing for "hsl(h, s%, l%)"
    const parts = hsl.match(/hsl\((\d+(?:\.\d+)?),\s*(\d+)%,\s*(\d+)%\)/);
    if (!parts) return hsl;
    let h = parseFloat(parts[1]);
    let s = parseInt(parts[2]);
    let l = parseInt(parts[3]);
    l = Math.max(0, Math.min(100, l + amount));
    return `hsl(${h}, ${s}%, ${l}%)`;
};

export default function WormsGame({ onGameOver: onGameOverProp }: { onGameOver?: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game State
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  
  // Mutable Game State (Refs for performance)
  const wormRef = useRef<{
    head: Vector;
    body: Vector[];
    angle: number;
    speed: number;
    color: string;
    boosting: boolean;
  }>({
    head: { x: ARENA_SIZE / 2, y: ARENA_SIZE / 2 },
    body: [],
    angle: 0,
    speed: BASE_SPEED,
    color: '#00ff88',
    boosting: false,
  });

  const foodRef = useRef<Food[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<Vector>({ x: 0, y: 0 });
  const cameraRef = useRef<Vector>({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);

  // Initialize Game
  const initGame = () => {
    // Reset Worm
    const startX = ARENA_SIZE / 2;
    const startY = ARENA_SIZE / 2;
    wormRef.current = {
      head: { x: startX, y: startY },
      body: [],
      angle: Math.random() * Math.PI * 2,
      speed: BASE_SPEED,
      color: randomColor(),
      boosting: false,
    };

    // Create initial segments
    for (let i = 0; i < INITIAL_LENGTH; i++) {
      wormRef.current.body.push({
        x: startX - Math.cos(wormRef.current.angle) * i * SEGMENT_DIST,
        y: startY - Math.sin(wormRef.current.angle) * i * SEGMENT_DIST,
      });
    }

    // Spawn Food
    foodRef.current = [];
    for (let i = 0; i < FOOD_COUNT; i++) {
      spawnFood();
    }

    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const spawnFood = () => {
    foodRef.current.push({
      x: randomRange(50, ARENA_SIZE - 50),
      y: randomRange(50, ARENA_SIZE - 50),
      radius: randomRange(4, 8),
      color: randomColor(),
      id: Math.random(),
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

  // Main Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle Input
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

    const update = () => {
      const worm = wormRef.current;
      
      // 1. Calculate Angle to Mouse
      // Convert mouse screen pos to world pos
      const worldMouse = {
        x: mouseRef.current.x + cameraRef.current.x,
        y: mouseRef.current.y + cameraRef.current.y,
      };

      const dx = worldMouse.x - worm.head.x;
      const dy = worldMouse.y - worm.head.y;
      const targetAngle = Math.atan2(dy, dx);

      // Smooth turning
      let diff = targetAngle - worm.angle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      worm.angle += diff * TURN_SPEED;

      // 2. Move Head
      const currentSpeed = worm.boosting ? BOOST_SPEED : BASE_SPEED;
      worm.head.x += Math.cos(worm.angle) * currentSpeed;
      worm.head.y += Math.sin(worm.angle) * currentSpeed;

      // 3. Move Body (Constraint Relaxation)
      // The first segment follows head
      let prev = worm.head;
      for (let i = 0; i < worm.body.length; i++) {
        const segment = worm.body[i];
        const dx = segment.x - prev.x;
        const dy = segment.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Drag segment towards previous
        const angle = Math.atan2(dy, dx);
        const targetX = prev.x + Math.cos(angle) * SEGMENT_DIST;
        const targetY = prev.y + Math.sin(angle) * SEGMENT_DIST;

        segment.x = targetX;
        segment.y = targetY;
        
        prev = segment;
      }

      // 4. Wall Collision
      if (
        worm.head.x < 0 || worm.head.x > ARENA_SIZE ||
        worm.head.y < 0 || worm.head.y > ARENA_SIZE
      ) {
        handleGameOver();
        return;
      }

      // 5. Self Collision (DISABLED for casual mode)
      /*
      for (let i = 10; i < worm.body.length; i++) {
        const seg = worm.body[i];
        const dist = Math.hypot(worm.head.x - seg.x, worm.head.y - seg.y);
        if (dist < 10) { // Collision radius
          handleGameOver();
          return;
        }
      }
      */

      // 6. Eat Food
      for (let i = foodRef.current.length - 1; i >= 0; i--) {
        const f = foodRef.current[i];
        const dist = Math.hypot(worm.head.x - f.x, worm.head.y - f.y);
        if (dist < 25) { // Eat radius
          // Grow
          const tail = worm.body[worm.body.length - 1];
          worm.body.push({ ...tail });
          
          // Particles
          createParticles(f.x, f.y, f.color, 5);
          
          // Remove & Respawn
          foodRef.current.splice(i, 1);
          spawnFood();
          
          setScore(s => s + 10);
        }
      }

      // 7. Update Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        if (p.life <= 0) particlesRef.current.splice(i, 1);
      }
    };

    const render = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      // Camera Logic
      const worm = wormRef.current;
      const targetCamX = worm.head.x - canvas.width / 2;
      const targetCamY = worm.head.y - canvas.height / 2;
      
      // Smooth camera
      cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.1;
      cameraRef.current.y += (targetCamY - cameraRef.current.y) * 0.1;

      // Clamp camera to arena bounds (optional, but good for polish)
      // cameraRef.current.x = Math.max(0, Math.min(cameraRef.current.x, ARENA_SIZE - canvas.width));
      // cameraRef.current.y = Math.max(0, Math.min(cameraRef.current.y, ARENA_SIZE - canvas.height));

      ctx.save();
      
      // Background
      ctx.fillStyle = '#0f172a'; // Dark Blue Slate
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply Camera Transform
      ctx.translate(-cameraRef.current.x, -cameraRef.current.y);

      // Draw Arena Borders
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 10;
      ctx.strokeRect(0, 0, ARENA_SIZE, ARENA_SIZE);

      // Draw Grid (World Space)
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      const gridSize = 100;
      for (let x = 0; x <= ARENA_SIZE; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ARENA_SIZE); ctx.stroke();
      }
      for (let y = 0; y <= ARENA_SIZE; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ARENA_SIZE, y); ctx.stroke();
      }

      // Draw Food
      foodRef.current.forEach(f => {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = f.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Particles
      particlesRef.current.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Draw Worm Body
      // Draw from tail to head
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Outer Glow
      ctx.shadowBlur = 20;
      ctx.shadowColor = worm.color;
      
      // Body is a series of circles for "organic" look (or thick line)
      // Using circles allows for overlapping segments
      for (let i = worm.body.length - 1; i >= 0; i--) {
        const seg = worm.body[i];
        const size = 12 + (i / worm.body.length) * 4; // Taper tail slightly
        
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, size, 0, Math.PI * 2);
        
        // Pattern: Alternate colors for stripes
        if (i % 3 === 0) {
           ctx.fillStyle = worm.color;
        } else {
           // Slightly darker/different shade for stripe effect
           ctx.fillStyle = adjustColor(worm.color, -20); 
        }
        
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Head
      ctx.beginPath();
      ctx.arc(worm.head.x, worm.head.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#fff'; // White face
      ctx.fill();

      // Eyes
      const eyeOffset = 8;
      const eyeX = worm.head.x + Math.cos(worm.angle - 0.5) * eyeOffset;
      const eyeY = worm.head.y + Math.sin(worm.angle - 0.5) * eyeOffset;
      const eyeX2 = worm.head.x + Math.cos(worm.angle + 0.5) * eyeOffset;
      const eyeY2 = worm.head.y + Math.sin(worm.angle + 0.5) * eyeOffset;

      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(eyeX, eyeY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeX2, eyeY2, 4, 0, Math.PI * 2); ctx.fill();

      ctx.restore();
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPlaying, gameOver]);

  const handleGameOver = () => {
    setGameOver(true);
    setIsPlaying(false);
    if (score > highScore) setHighScore(score);
    if (onGameOverProp) onGameOverProp(score);
  };

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-700">
      <canvas
        ref={canvasRef}
        width={1000}
        height={600}
        className="w-full h-full cursor-none"
      />

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 flex gap-4">
        <div className="px-4 py-2 bg-black/50 backdrop-blur rounded-lg border border-white/10 text-white font-bold">
          Score: {score}
        </div>
        <div className="px-4 py-2 bg-yellow-500/20 backdrop-blur rounded-lg border border-yellow-500/50 text-yellow-200 font-bold">
          High Score: {highScore}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 text-white/50 text-sm pointer-events-none">
        <div className="flex items-center gap-2">
          <MousePointer2 className="w-4 h-4" /> Move Mouse to Steer
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Zap className="w-4 h-4" /> Click & Hold to Boost
        </div>
      </div>

      {/* Menu Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
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
        </div>
      )}
    </div>
  );
}
