"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RefreshCw, Users, Trophy, Wifi, WifiOff, Copy, Check } from 'lucide-react';
import Peer, { DataConnection } from 'peerjs';

// --- Types ---

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

type GameMode = 'menu' | 'local' | 'host' | 'join';

type GameState = {
  players: Player[];
  food: Position;
  gameOver: boolean;
  winnerId: number | null;
  isPlaying: boolean;
};

// --- Constants ---

const GRID_SIZE = 20;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const INITIAL_SPEED = 100; // ms per frame

const INITIAL_PLAYERS: Player[] = [
  {
    id: 1,
    name: "Player 1 (Host)",
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
    name: "Player 2 (Client)",
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
  
  // Game State
  const [mode, setMode] = useState<GameMode>('menu');
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);

  // Networking State
  const [peer, setPeer] = useState<Peer | null>(null);
  const [conn, setConn] = useState<DataConnection | null>(null);
  const [myPeerId, setMyPeerId] = useState<string>('');
  const [remotePeerId, setRemotePeerId] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [copied, setCopied] = useState(false);

  // Refs for Game Loop (avoid stale closures)
  const playersRef = useRef(players);
  const foodRef = useRef(food);
  const isPlayingRef = useRef(isPlaying);
  const lastUpdateRef = useRef(0);
  const modeRef = useRef(mode);
  
  // Update Refs
  useEffect(() => { playersRef.current = players; }, [players]);
  useEffect(() => { foodRef.current = food; }, [food]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // --- Network Logic ---

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      peer?.destroy();
    };
  }, []);

  const initializeHost = () => {
    const newPeer = new Peer();
    
    newPeer.on('open', (id) => {
      setMyPeerId(id);
      setConnectionStatus('connecting'); // Waiting for connection
    });

    newPeer.on('connection', (connection) => {
      setConn(connection);
      setConnectionStatus('connected');
      
      // Setup Host listeners
      connection.on('data', (data: any) => {
        if (data.type === 'input') {
          // Update P2 direction
          const p2 = playersRef.current[1];
          // Prevent 180 turn
          if (
            (data.direction.x !== 0 && p2.direction.x === 0) ||
            (data.direction.y !== 0 && p2.direction.y === 0)
          ) {
            p2.nextDirection = data.direction;
          }
        }
      });

      connection.on('close', () => {
        setConnectionStatus('disconnected');
        setConn(null);
        setIsPlaying(false);
        alert('Player 2 disconnected');
      });
    });

    setPeer(newPeer);
    setMode('host');
  };

  const joinGame = () => {
    if (!remotePeerId) return;
    const newPeer = new Peer();
    
    newPeer.on('open', () => {
      const connection = newPeer.connect(remotePeerId);
      
      connection.on('open', () => {
        setConn(connection);
        setConnectionStatus('connected');
        setMode('join');
      });

      connection.on('data', (data: any) => {
        if (data.type === 'gameState') {
          // Sync state from Host
          const state = data.state as GameState;
          setPlayers(state.players);
          setFood(state.food);
          setGameOver(state.gameOver);
          setIsPlaying(state.isPlaying);
          if (state.winnerId) {
            setWinner(state.players.find(p => p.id === state.winnerId) || null);
          } else {
            setWinner(null);
          }
        }
      });

      connection.on('close', () => {
        setConnectionStatus('disconnected');
        setConn(null);
        setMode('menu');
        alert('Host disconnected');
      });
      
      connection.on('error', (err) => {
        console.error(err);
        alert('Connection failed');
      });
    });

    setPeer(newPeer);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(myPeerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Game Logic ---

  const spawnFood = () => {
    const x = Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE));
    const y = Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE));
    setFood({ x, y });
  };

  const resetGame = () => {
    const newPlayers = JSON.parse(JSON.stringify(INITIAL_PLAYERS));
    setPlayers(newPlayers);
    setGameOver(false);
    setWinner(null);
    spawnFood();
    setIsPlaying(true);
    
    // Sync reset to client
    if (modeRef.current === 'host' && conn) {
      // Logic handled in updateGame loop or we can force a sync here if needed
    }
  };

  const checkCollision = (head: Position, player: Player) => {
    // Wall
    if (
      head.x < 0 || head.x >= CANVAS_WIDTH / GRID_SIZE ||
      head.y < 0 || head.y >= CANVAS_HEIGHT / GRID_SIZE
    ) return true;

    // Self
    for (let i = 1; i < player.body.length; i++) {
      if (head.x === player.body[i].x && head.y === player.body[i].y) return true;
    }

    // Other
    const otherPlayer = playersRef.current.find(p => p.id !== player.id);
    if (otherPlayer && !otherPlayer.isDead) {
      for (const segment of otherPlayer.body) {
        if (head.x === segment.x && head.y === segment.y) return true;
      }
    }

    return false;
  };

  // Main Game Loop (Runs on Host or Local only)
  const updateGame = (timestamp: number) => {
    // Client does NOT run logic, only renders
    if (modeRef.current === 'join') {
      requestAnimationFrame(updateGame);
      return;
    }

    if (!isPlayingRef.current || gameOver) {
      if (modeRef.current === 'host' && conn) {
         // Keep syncing even if paused/gameover so client sees the screen
         conn.send({
          type: 'gameState',
          state: {
            players: playersRef.current,
            food: foodRef.current,
            gameOver,
            winnerId: winner?.id || null,
            isPlaying: isPlayingRef.current
          }
        });
      }
      requestAnimationFrame(updateGame);
      return;
    }

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

      player.direction = player.nextDirection;

      const newHead = {
        x: player.head.x + player.direction.x,
        y: player.head.y + player.direction.y
      };

      if (checkCollision(newHead, player)) {
        player.isDead = true;
        someoneDied = true;
        return;
      }

      player.body.unshift(newHead);
      player.head = newHead;

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
        setGameOver(true);
        setIsPlaying(false);
      }
    }

    setPlayers(currentPlayers);

    // Sync to Client
    if (modeRef.current === 'host' && conn) {
      conn.send({
        type: 'gameState',
        state: {
          players: currentPlayers,
          food: foodRef.current,
          gameOver: someoneDied ? true : gameOver, // Use local var for immediate update
          winnerId: someoneDied ? (currentPlayers.filter(p => !p.isDead)[0]?.id || null) : null,
          isPlaying: someoneDied ? false : true
        }
      });
    }

    requestAnimationFrame(updateGame);
  };

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlayingRef.current && modeRef.current !== 'join') return;

      // LOCAL MODE
      if (modeRef.current === 'local') {
        const p1 = playersRef.current[0];
        const p2 = playersRef.current[1];
        
        // P1
        if (e.key === 'ArrowUp' && p1.direction.y === 0) p1.nextDirection = { x: 0, y: -1 };
        if (e.key === 'ArrowDown' && p1.direction.y === 0) p1.nextDirection = { x: 0, y: 1 };
        if (e.key === 'ArrowLeft' && p1.direction.x === 0) p1.nextDirection = { x: -1, y: 0 };
        if (e.key === 'ArrowRight' && p1.direction.x === 0) p1.nextDirection = { x: 1, y: 0 };

        // P2
        if (e.key === 'w' && p2.direction.y === 0) p2.nextDirection = { x: 0, y: -1 };
        if (e.key === 's' && p2.direction.y === 0) p2.nextDirection = { x: 0, y: 1 };
        if (e.key === 'a' && p2.direction.x === 0) p2.nextDirection = { x: -1, y: 0 };
        if (e.key === 'd' && p2.direction.x === 0) p2.nextDirection = { x: 1, y: 0 };
      }

      // HOST MODE (Controls P1)
      if (modeRef.current === 'host') {
        const p1 = playersRef.current[0];
        if (e.key === 'ArrowUp' && p1.direction.y === 0) p1.nextDirection = { x: 0, y: -1 };
        if (e.key === 'ArrowDown' && p1.direction.y === 0) p1.nextDirection = { x: 0, y: 1 };
        if (e.key === 'ArrowLeft' && p1.direction.x === 0) p1.nextDirection = { x: -1, y: 0 };
        if (e.key === 'ArrowRight' && p1.direction.x === 0) p1.nextDirection = { x: 1, y: 0 };
      }

      // CLIENT MODE (Controls P2 via Network)
      if (modeRef.current === 'join' && conn) {
        let direction = null;
        if (e.key === 'ArrowUp') direction = { x: 0, y: -1 };
        if (e.key === 'ArrowDown') direction = { x: 0, y: 1 };
        if (e.key === 'ArrowLeft') direction = { x: -1, y: 0 };
        if (e.key === 'ArrowRight') direction = { x: 1, y: 0 };

        if (direction) {
          conn.send({ type: 'input', direction });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [conn]); // Re-bind if connection changes

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_WIDTH; i += GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_HEIGHT); ctx.stroke();
    }
    for (let i = 0; i <= CANVAS_HEIGHT; i += GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(CANVAS_WIDTH, i); ctx.stroke();
    }

    // Food
    ctx.fillStyle = '#fbbf24';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#fbbf24';
    ctx.fillRect(food.x * GRID_SIZE + 2, food.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);
    ctx.shadowBlur = 0;

    // Players
    players.forEach(player => {
      if (player.isDead) return;
      ctx.fillStyle = player.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = player.color;

      player.body.forEach((segment, index) => {
        const isHead = index === 0;
        ctx.fillRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
        
        if (isHead) {
          ctx.fillStyle = '#000';
          const eyeSize = 4;
          const eyeOffset = 4;
          ctx.fillRect(segment.x * GRID_SIZE + eyeOffset, segment.y * GRID_SIZE + eyeOffset, eyeSize, eyeSize);
          ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, segment.y * GRID_SIZE + eyeOffset, eyeSize, eyeSize);
          ctx.fillStyle = player.color;
        }
      });
      ctx.shadowBlur = 0;
    });

  }, [players, food]);

  // Start Loop
  useEffect(() => {
    requestAnimationFrame(updateGame);
  }, []);

  // --- UI Renders ---

  if (mode === 'menu') {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-12 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md max-w-lg mx-auto">
        <h2 className="text-3xl font-bold text-white mb-4">Select Mode</h2>
        
        <button 
          onClick={() => { setMode('local'); setIsPlaying(true); }}
          className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xl transition-all"
        >
          <Users className="w-6 h-6" />
          Local Multiplayer
          <span className="text-sm font-normal opacity-60 ml-2">(Same Keyboard)</span>
        </button>

        <div className="w-full h-px bg-white/10 my-2" />

        <button 
          onClick={initializeHost}
          className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-xl transition-all"
        >
          <Wifi className="w-6 h-6" />
          Host Online Game
        </button>

        <div className="w-full flex gap-2">
          <input 
            type="text" 
            placeholder="Enter Host ID" 
            value={remotePeerId}
            onChange={(e) => setRemotePeerId(e.target.value)}
            className="flex-1 px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
          />
          <button 
            onClick={joinGame}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all"
          >
            Join
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* HUD */}
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

      {/* Online Status Bar */}
      {mode !== 'local' && (
        <div className="w-full max-w-[800px] flex items-center justify-between px-4 py-2 bg-blue-900/20 border border-blue-500/30 rounded-lg mb-2">
          <div className="flex items-center gap-2">
            {connectionStatus === 'connected' ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
            <span className="text-sm font-mono text-blue-200 uppercase">{mode} MODE</span>
            <span className="text-xs text-white/40">Status: {connectionStatus}</span>
          </div>
          
          {mode === 'host' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">Game ID:</span>
              <code className="bg-black/40 px-2 py-1 rounded text-green-400 font-mono select-all">
                {myPeerId}
              </code>
              <button onClick={copyToClipboard} className="hover:text-white text-white/60">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Game Canvas */}
      <div className="relative group">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-xl border border-white/10 shadow-2xl bg-black"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        
        {/* Overlays */}
        {(!isPlaying && !gameOver && mode === 'local') && (
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
        
        {(!isPlaying && !gameOver && mode === 'host' && connectionStatus === 'connected') && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
            <button
              onClick={() => setIsPlaying(true)}
              className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold text-xl hover:scale-105 transition-transform"
            >
              <Play className="w-6 h-6" />
              Start Online Match
            </button>
          </div>
        )}

        {(!isPlaying && !gameOver && mode === 'host' && connectionStatus !== 'connected') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-xl backdrop-blur-sm p-8 text-center">
            <div className="animate-spin mb-4">
               <RefreshCw className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Waiting for Opponent...</h3>
            <p className="text-white/60 mb-6">Share this Game ID with your friend:</p>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
              <code className="text-2xl font-mono text-green-400">{myPeerId || 'Generating...'}</code>
              <button onClick={copyToClipboard} className="hover:text-white text-white/60 ml-2">
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-xl backdrop-blur-sm">
            <h2 className="text-4xl font-bold text-white mb-4">
              {winner ? `${winner.name} Wins!` : "It's a Draw!"}
            </h2>
            {mode === 'host' || mode === 'local' ? (
              <button
                onClick={resetGame}
                className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold text-xl hover:scale-105 transition-transform"
              >
                <RefreshCw className="w-6 h-6" />
                Play Again
              </button>
            ) : (
               <p className="text-white/60">Waiting for Host to restart...</p>
            )}
          </div>
        )}
      </div>

      {/* Controls Guide */}
      <div className="flex gap-8 text-white/50 text-sm">
        <button onClick={() => {
           // Cleanup and back to menu
           setMode('menu');
           setConnectionStatus('disconnected');
           peer?.destroy();
           setIsPlaying(false);
           setPlayers(INITIAL_PLAYERS);
        }} className="text-red-400 hover:text-red-300 underline">
          Exit to Menu
        </button>
      </div>
    </div>
  );
}
