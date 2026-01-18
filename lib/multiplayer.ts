// Multiplayer game state management
export type GameRoom = {
  id: string;
  name: string;
  host: string;
  players: Player[];
  maxPlayers: number;
  mode: 'lobby' | 'tournament' | 'infinity' | 'time' | 'treasure';
  status: 'waiting' | 'starting' | 'playing' | 'finished';
  settings: GameSettings;
  createdAt: number;
  inviteCode: string;
};

export type Player = {
  address: string;
  username: string;
  skin: string;
  ready: boolean;
  score: number;
  position: number;
  connected: boolean;
};

export type GameSettings = {
  arenaSize: number;
  botCount: number;
  foodCount: number;
  powerUpCount: number;
  timeLimit?: number;
  entryFee?: number;
  prizePool?: number;
};

export type GameState = {
  roomId: string;
  players: Player[];
  food: Food[];
  powerUps: PowerUp[];
  deaths: DeathEvent[];
  tick: number;
};

export type Food = {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
};

export type PowerUp = {
  id: string;
  x: number;
  y: number;
  type: string;
  color: string;
};

export type DeathEvent = {
  playerId: string;
  x: number;
  y: number;
  timestamp: number;
};

// Generate unique room ID
export function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Generate invite code (6 characters)
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create game room
export function createRoom(
  host: string,
  username: string,
  mode: GameRoom['mode'],
  settings?: Partial<GameSettings>
): GameRoom {
  const defaultSettings: GameSettings = {
    arenaSize: 3000,
    botCount: 15,
    foodCount: 250,
    powerUpCount: 8,
  };

  return {
    id: generateRoomId(),
    name: `${username}'s Room`,
    host,
    players: [{
      address: host,
      username,
      skin: 'classic',
      ready: false,
      score: 0,
      position: 0,
      connected: true,
    }],
    maxPlayers: mode === 'tournament' ? 8 : 4,
    mode,
    status: 'waiting',
    settings: { ...defaultSettings, ...settings },
    createdAt: Date.now(),
    inviteCode: generateInviteCode(),
  };
}

// Join room
export function joinRoom(room: GameRoom, player: Omit<Player, 'score' | 'position'>): GameRoom {
  if (room.players.length >= room.maxPlayers) {
    throw new Error('Room is full');
  }
  if (room.status !== 'waiting') {
    throw new Error('Game already started');
  }

  return {
    ...room,
    players: [...room.players, {
      ...player,
      score: 0,
      position: room.players.length,
    }],
  };
}

// Leave room
export function leaveRoom(room: GameRoom, address: string): GameRoom {
  const newPlayers = room.players.filter(p => p.address !== address);
  
  // If host leaves, transfer host to next player
  let newHost = room.host;
  if (room.host === address && newPlayers.length > 0) {
    newHost = newPlayers[0].address;
  }

  return {
    ...room,
    host: newHost,
    players: newPlayers,
    status: newPlayers.length === 0 ? 'finished' : room.status,
  };
}
