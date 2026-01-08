"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RefreshCw, Users, Trophy } from 'lucide-react';

type Position = { x: number; y: number };
type Player = {
  id: number;
  name: string;
  color: string;
  head: Position;
  body: Position[];
  direction: Position;
  nextDirection: Position;
  score: number;
  isDead: boolean;
};

const GRID_SIZE = 20;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const INITIAL_SPEED = 100; // ms per frame

const INITIAL_PLAYERS: Player[] = [
  {
    id: 1,
    name: "Player 1 (Arrows)",
    color: "#00ff88", // Neon Green
    head: { x: 5, y: 5 },
    body: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    score: 0,
    isDead: false,
  },
  {
    id: 2,
    name: "Player 2 (WASD)",
    color: "#ff00ff", // Neon Pink
    head: { x: 35, y: 25 },
    body: [{ x: 35, y: 25 }, { x: 36, y: 25 }, { x: 37, y: 25 }],
    direction: { x: -1, y: 0 },
    nextDirection: { x: -1, y: 0 },
    score: 0,
    isDead: false,
  },
];

export default function GameArena() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  
  // Game loop refs to avoid closure staleness
  const playersRef = useRef(players);
  const foodRef = useRef(food);
  const isPlayingRef = useRef(isPlaying);
  const lastUpdateRef = useRef(0);

  // Update refs when state changes
  useEffect(() => { playersRef.current = players; }, [players]);
  useEffect(() => { foodRef.current = food; }, [food]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const spawnFood = () => {
    const x = Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE));
    const y = Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE));
    setFood({ x, y });
  };

  const resetGame = () => {
    setPlayers(JSON.parse(JSON.stringify(INITIAL_PLAYERS)));
    setGameOver(false);
    setWinner(null);
    spawnFood();
    setIsPlaying(true);
  };

  const checkCollision = (head: Position, player: Player) => {
    // Wall collision
    if (
      head.x < 0 ||
      head.x >= CANVAS_WIDTH / GRID_SIZE ||
      head.y < 0 ||
      head.y >= CANVAS_HEIGHT / GRID_SIZE
    ) {
      return true;
    }

    // Self collision
    for (let i = 1; i < player.body.length; i++) {
      if (head.x === player.body[i].x && head.y === player.body[i].y) {
        return true;
      }
    }

    // Other player collision
    const otherPlayer = playersRef.current.find(p => p.id !== player.id);
    if (otherPlayer && !otherPlayer.isDead) {
      for (const segment of otherPlayer.body) {
        if (head.x === segment.x && head.y === segment.y) {
          return true;
        }
      }
    }

    return false;
  };

  const updateGame = (timestamp: number) => {
    if (!isPlayingRef.current || gameOver) return;

    if (timestamp - lastUpdateRef.current < INITIAL_SPEED) {
      requestAnimationFrame(updateGame);
      return;
    }

    lastUpdateRef.current = timestamp;

    const currentPlayers = [...playersRef.current];
    const currentFood = foodRef.current;
    let someoneDied = false;

    currentPlayers.forEach(player => {
      if (player.isDead) return;

      // Update direction
      player.direction = player.nextDirection;

      // Move head
      const newHead = {
        x: player.head.x + player.direction.x,
        y: player.head.y + player.direction.y
      };

      // Check collisions
      if (checkCollision(newHead, player)) {
        player.isDead = true;
        someoneDied = true;
        return;
      }

      // Move body
      player.body.unshift(newHead);
      player.head = newHead;

      // Check food
      if (newHead.x === currentFood.x && newHead.y === currentFood.y) {
        player.score += 10;
        spawnFood();
      } else {
        player.body.pop();
      }
    });

    if (someoneDied) {
      const alivePlayers = currentPlayers.filter(p => !p.isDead);
      if (alivePlayers.length === 1) {
        setWinner(alivePlayers[0]);
        setGameOver(true);
        setIsPlaying(false);
      } else if (alivePlayers.length === 0) {
        setGameOver(true); // Draw
        setIsPlaying(false);
      }
    }

    setPlayers(currentPlayers);
    requestAnimationFrame(updateGame);
  };

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlayingRef.current) return;

      const p1 = playersRef.current[0];
      const p2 = playersRef.current[1];

      // Player 1 (Arrows)
      if (e.key === 'ArrowUp' && p1.direction.y === 0) p1.nextDirection = { x: 0, y: -1 };
      if (e.key === 'ArrowDown' && p1.direction.y === 0) p1.nextDirection = { x: 0, y: 1 };
      if (e.key === 'ArrowLeft' && p1.direction.x === 0) p1.nextDirection = { x: -1, y: 0 };
      if (e.key === 'ArrowRight' && p1.direction.x === 0) p1.nextDirection = { x: 1, y: 0 };

      // Player 2 (WASD)
      if (e.key === 'w' && p2.direction.y === 0) p2.nextDirection = { x: 0, y: -1 };
      if (e.key === 's' && p2.direction.y === 0) p2.nextDirection = { x: 0, y: 1 };
      if (e.key === 'a' && p2.direction.x === 0) p2.nextDirection = { x: -1, y: 0 };
      if (e.key === 'd' && p2.direction.x === 0) p2.nextDirection = { x: 1, y: 0 };
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Grid (Optional, faint)
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_WIDTH; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i <= CANVAS_HEIGHT; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_WIDTH, i);
      ctx.stroke();
    }

    // Draw Food
    ctx.fillStyle = '#fbbf24'; // Gold
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#fbbf24';
    ctx.fillRect(
      food.x * GRID_SIZE + 2,
      food.y * GRID_SIZE + 2,
      GRID_SIZE - 4,
      GRID_SIZE - 4
    );
    ctx.shadowBlur = 0;

    // Draw Players
    players.forEach(player => {
      if (player.isDead) return;

      ctx.fillStyle = player.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = player.color;

      player.body.forEach((segment, index) => {
        const isHead = index === 0;
        ctx.fillRect(
          segment.x * GRID_SIZE + 1,
          segment.y * GRID_SIZE + 1,
          GRID_SIZE - 2,
          GRID_SIZE - 2
        );
        
        if (isHead) {
          // Draw eyes
          ctx.fillStyle = '#000';
          const eyeSize = 4;
          const eyeOffset = 4;
          ctx.fillRect(
            segment.x * GRID_SIZE + eyeOffset,
            segment.y * GRID_SIZE + eyeOffset,
            eyeSize,
            eyeSize
          );
          ctx.fillRect(
            segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize,
            segment.y * GRID_SIZE + eyeOffset,
            eyeSize,
            eyeSize
          );
          ctx.fillStyle = player.color; // Reset for next segment
        }
      });
      ctx.shadowBlur = 0;
    });

  }, [players, food]);

  // Start loop
  useEffect(() => {
    if (isPlaying) {
      requestAnimationFrame(updateGame);
    }
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="flex items-center justify-between w-full max-w-[800px] mb-4">
        {players.map(p => (
          <div 
            key={p.id} 
            className={`flex items-center gap-3 p-4 rounded-xl border ${
              winner?.id === p.id ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/10 bg-white/5'
            }`}
          >
            <div className="w-4 h-4 rounded-full" style={{ background: p.color }} />
            <div>
              <p className="font-bold text-white">{p.name}</p>
              <p className="text-2xl font-mono text-white/80">{p.score}</p>
            </div>
            {winner?.id === p.id && <Trophy className="w-6 h-6 text-yellow-500" />}
          </div>
        ))}
      </div>

      <div className="relative group">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-xl border border-white/10 shadow-2xl bg-black"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        
        {(!isPlaying && !gameOver) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
            <button
              onClick={() => setIsPlaying(true)}
              className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold text-xl hover:scale-105 transition-transform"
            >
              <Play className="w-6 h-6" />
              Start Game
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-xl backdrop-blur-sm">
            <h2 className="text-4xl font-bold text-white mb-4">
              {winner ? `${winner.name} Wins!` : "It's a Draw!"}
            </h2>
            <button
              onClick={resetGame}
              className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold text-xl hover:scale-105 transition-transform"
            >
              <RefreshCw className="w-6 h-6" />
              Play Again
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-8 text-white/50 text-sm">
        <div className="flex flex-col items-center gap-2">
          <span className="font-bold text-white">Player 1</span>
          <div className="flex gap-1">
            <kbd className="px-2 py-1 bg-white/10 rounded">▲</kbd>
            <kbd className="px-2 py-1 bg-white/10 rounded">▼</kbd>
            <kbd className="px-2 py-1 bg-white/10 rounded">◀</kbd>
            <kbd className="px-2 py-1 bg-white/10 rounded">▶</kbd>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="font-bold text-white">Player 2</span>
          <div className="flex gap-1">
            <kbd className="px-2 py-1 bg-white/10 rounded">W</kbd>
            <kbd className="px-2 py-1 bg-white/10 rounded">S</kbd>
            <kbd className="px-2 py-1 bg-white/10 rounded">A</kbd>
            <kbd className="px-2 py-1 bg-white/10 rounded">D</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
