// Database persistence for game rooms using Redis
import { getRedis } from './redisClient';
import type { GameRoom, Player } from './multiplayer';

const ROOM_PREFIX = 'game:room:';
const ROOM_LIST_KEY = 'game:rooms:list';
const ROOM_TTL = 3600; // 1 hour

export async function saveRoom(room: GameRoom): Promise<boolean> {
  const redis = await getRedis();
  if (!redis) return false;

  try {
    const key = `${ROOM_PREFIX}${room.id}`;
    await redis.setEx(key, ROOM_TTL, JSON.stringify(room));
    
    // Add to room list for quick lookup
    await redis.zAdd(ROOM_LIST_KEY, {
      score: room.createdAt,
      value: room.id,
    });
    
    return true;
  } catch (error) {
    console.error('Failed to save room:', error);
    return false;
  }
}

export async function getRoom(roomId: string): Promise<GameRoom | null> {
  const redis = await getRedis();
  if (!redis) return null;

  try {
    const key = `${ROOM_PREFIX}${roomId}`;
    const raw = await redis.get(key);
    if (raw) {
      return JSON.parse(raw) as GameRoom;
    }
  } catch (error) {
    console.error('Failed to get room:', error);
  }
  return null;
}

export async function getRoomByInviteCode(code: string): Promise<GameRoom | null> {
  const redis = await getRedis();
  if (!redis) return null;

  try {
    // Scan for room with matching invite code
    let cursor = 0;
    do {
      const result = await redis.scan(cursor, {
        MATCH: `${ROOM_PREFIX}*`,
        COUNT: 100,
      });
      cursor = result.cursor;

      for (const key of result.keys) {
        const raw = await redis.get(key);
        if (raw) {
          const room = JSON.parse(raw) as GameRoom;
          if (room.inviteCode === code) {
            return room;
          }
        }
      }
    } while (cursor !== 0);
  } catch (error) {
    console.error('Failed to find room by code:', error);
  }
  return null;
}

export async function deleteRoom(roomId: string): Promise<boolean> {
  const redis = await getRedis();
  if (!redis) return false;

  try {
    const key = `${ROOM_PREFIX}${roomId}`;
    await redis.del(key);
    await redis.zRem(ROOM_LIST_KEY, roomId);
    return true;
  } catch (error) {
    console.error('Failed to delete room:', error);
    return false;
  }
}

export async function listWaitingRooms(limit = 50): Promise<GameRoom[]> {
  const redis = await getRedis();
  if (!redis) return [];

  try {
    const roomIds = await redis.zRange(ROOM_LIST_KEY, 0, limit - 1, {
      REV: true,
    });

    const rooms: GameRoom[] = [];
    for (const roomId of roomIds) {
      const room = await getRoom(roomId);
      if (room && room.status === 'waiting') {
        rooms.push(room);
      }
    }
    return rooms;
  } catch (error) {
    console.error('Failed to list rooms:', error);
    return [];
  }
}

export async function updateRoom(roomId: string, updates: Partial<GameRoom>): Promise<boolean> {
  const existing = await getRoom(roomId);
  if (!existing) return false;

  const updated = { ...existing, ...updates };
  return await saveRoom(updated);
}

export async function addPlayerToRoom(roomId: string, player: Player): Promise<boolean> {
  const room = await getRoom(roomId);
  if (!room) return false;

  if (room.players.length >= room.maxPlayers) {
    return false;
  }

  room.players.push(player);
  return await saveRoom(room);
}

export async function removePlayerFromRoom(roomId: string, playerAddress: string): Promise<boolean> {
  const room = await getRoom(roomId);
  if (!room) return false;

  room.players = room.players.filter(p => p.address !== playerAddress);
  
  if (room.players.length === 0) {
    return await deleteRoom(roomId);
  }

  // Transfer host if needed
  if (room.host === playerAddress && room.players.length > 0) {
    room.host = room.players[0].address;
  }

  return await saveRoom(room);
}
