import { NextRequest, NextResponse } from 'next/server';
import { createRoom, joinRoom, leaveRoom, type GameRoom } from '@/lib/multiplayer';
import { saveRoom, getRoom, getRoomByInviteCode, deleteRoom, listWaitingRooms, updateRoom, addPlayerToRoom, removePlayerFromRoom } from '@/lib/gameRoomDb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, roomId, player, mode, settings } = body;

    switch (action) {
      case 'create': {
        const room = createRoom(
          player.address,
          player.username,
          mode || 'lobby',
          settings
        );
        await saveRoom(room);
        return NextResponse.json({ success: true, room });
      }

      case 'join': {
        const room = await getRoom(roomId);
        if (!room) {
          return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
        }
        try {
          const updatedRoom = joinRoom(room, player);
          await saveRoom(updatedRoom);
          return NextResponse.json({ success: true, room: updatedRoom });
        } catch (error: any) {
          return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }
      }

      case 'leave': {
        const room = await getRoom(roomId);
        if (!room) {
          return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
        }
        const updatedRoom = leaveRoom(room, player.address);
        if (updatedRoom.status === 'finished' || updatedRoom.players.length === 0) {
          await deleteRoom(roomId);
        } else {
          await saveRoom(updatedRoom);
        }
        return NextResponse.json({ success: true, room: updatedRoom });
      }

      case 'get': {
        const room = await getRoom(roomId);
        if (!room) {
          return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, room });
      }

      case 'list': {
        const roomList = await listWaitingRooms(50);
        const formatted = roomList.map(r => ({
          id: r.id,
          name: r.name,
          players: r.players.length,
          maxPlayers: r.maxPlayers,
          mode: r.mode,
          inviteCode: r.inviteCode,
        }));
        return NextResponse.json({ success: true, rooms: formatted });
      }

      case 'update': {
        const success = await updateRoom(roomId, body.updates);
        if (!success) {
          return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
        }
        const updatedRoom = await getRoom(roomId);
        return NextResponse.json({ success: true, room: updatedRoom });
      }

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Room API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const roomId = searchParams.get('id');
  const inviteCode = searchParams.get('code');

  if (roomId) {
    const room = await getRoom(roomId);
    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, room });
  }

  if (inviteCode) {
    const room = await getRoomByInviteCode(inviteCode);
    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, room });
  }

  // List all waiting rooms
  const roomList = await listWaitingRooms(50);
  const formatted = roomList.map(r => ({
    id: r.id,
    name: r.name,
    players: r.players.length,
    maxPlayers: r.maxPlayers,
    mode: r.mode,
    inviteCode: r.inviteCode,
  }));

  return NextResponse.json({ success: true, rooms: formatted });
}
