'use client';

// WebSocket client for real-time game synchronization
// Use dynamic import to avoid SSR issues
import type { Socket } from 'socket.io-client';

export type GameEvent = 
  | 'player-join'
  | 'player-leave'
  | 'player-move'
  | 'player-death'
  | 'food-eaten'
  | 'powerup-collected'
  | 'game-start'
  | 'game-end'
  | 'score-update'
  | 'room-update';

export type PlayerMove = {
  playerId: string;
  x: number;
  y: number;
  angle: number;
  body: Array<{ x: number; y: number }>;
  score: number;
};

export type GameStateUpdate = {
  players: PlayerMove[];
  food: Array<{ id: string; x: number; y: number; type: string }>;
  powerUps: Array<{ id: string; x: number; y: number; type: string }>;
  deaths: Array<{ playerId: string; x: number; y: number }>;
  tick: number;
};

class GameSocket {
  private socket: Socket | null = null;
  private roomId: string | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  async connect(roomId: string, playerId: string) {
    if (typeof window === 'undefined') {
      console.warn('WebSocket not available (server-side)');
      return;
    }

    // Dynamic import only on client side
    const { io } = await import('socket.io-client');

    if (this.socket?.connected) {
      this.disconnect();
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    this.socket = io(wsUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.roomId = roomId;

    this.socket.on('connect', () => {
      this.socket?.emit('join-room', { roomId, playerId });
    });

    this.socket.on('game-state', (data: GameStateUpdate) => {
      this.emit('game-state', data);
    });

    this.socket.on('player-joined', (data: any) => {
      this.emit('player-joined', data);
    });

    this.socket.on('player-left', (data: any) => {
      this.emit('player-left', data);
    });

    this.socket.on('player-moved', (data: PlayerMove) => {
      this.emit('player-moved', data);
    });

    this.socket.on('food-eaten', (data: any) => {
      this.emit('food-eaten', data);
    });

    this.socket.on('powerup-collected', (data: any) => {
      this.emit('powerup-collected', data);
    });

    this.socket.on('player-died', (data: any) => {
      this.emit('player-died', data);
    });

    this.socket.on('game-started', () => {
      this.emit('game-started', {});
    });

    this.socket.on('game-ended', (data: any) => {
      this.emit('game-ended', data);
    });

    this.socket.on('disconnect', () => {
      this.emit('disconnected', {});
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
      this.emit('error', error);
    });
  }

  sendPlayerMove(move: PlayerMove) {
    if (this.socket?.connected) {
      this.socket.emit('player-move', move);
    }
  }

  sendFoodEaten(foodId: string) {
    if (this.socket?.connected) {
      this.socket.emit('food-eaten', { foodId });
    }
  }

  sendPowerUpCollected(powerUpId: string) {
    if (this.socket?.connected) {
      this.socket.emit('powerup-collected', { powerUpId });
    }
  }

  sendPlayerDeath() {
    if (this.socket?.connected) {
      this.socket.emit('player-death', {});
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.roomId = null;
    this.listeners.clear();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const gameSocket = new GameSocket();
