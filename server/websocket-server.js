// WebSocket server for real-time game synchronization
// Run this as a separate server: node server/websocket-server.js
const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for dev/preview environments
    methods: ["GET", "POST"],
  },
});

// Game state storage
const gameRooms = new Map();
const playerSockets = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', ({ roomId, playerId }) => {
    socket.join(roomId);
    playerSockets.set(playerId, socket.id);

    if (!gameRooms.has(roomId)) {
      gameRooms.set(roomId, {
        players: new Map(),
        food: [],
        powerUps: [],
        deaths: [],
        tick: 0,
      });
    }

    const room = gameRooms.get(roomId);
    room.players.set(playerId, {
      id: playerId,
      x: 0,
      y: 0,
      angle: 0,
      body: [],
      score: 0,
      lastUpdate: Date.now(),
    });

    // Notify others
    socket.to(roomId).emit('player-joined', { playerId });
    
    // Send current game state
    socket.emit('game-state', {
      players: Array.from(room.players.values()),
      food: room.food,
      powerUps: room.powerUps,
      deaths: room.deaths,
      tick: room.tick,
    });
  });

  socket.on('player-move', (move) => {
    const roomId = Array.from(socket.rooms).find(r => r !== socket.id);
    if (!roomId || !gameRooms.has(roomId)) return;

    const room = gameRooms.get(roomId);
    if (room.players.has(move.playerId)) {
      room.players.set(move.playerId, {
        ...move,
        lastUpdate: Date.now(),
      });

      // Broadcast to other players
      socket.to(roomId).emit('player-moved', move);
    }
  });

  socket.on('food-eaten', ({ foodId }) => {
    const roomId = Array.from(socket.rooms).find(r => r !== socket.id);
    if (!roomId || !gameRooms.has(roomId)) return;

    const room = gameRooms.get(roomId);
    room.food = room.food.filter(f => f.id !== foodId);
    
    // Broadcast
    io.to(roomId).emit('food-eaten', { foodId });
  });

  socket.on('powerup-collected', ({ powerUpId }) => {
    const roomId = Array.from(socket.rooms).find(r => r !== socket.id);
    if (!roomId || !gameRooms.has(roomId)) return;

    const room = gameRooms.get(roomId);
    room.powerUps = room.powerUps.filter(p => p.id !== powerUpId);
    
    // Broadcast
    io.to(roomId).emit('powerup-collected', { powerUpId });
  });

  socket.on('player-death', ({ playerId }) => {
    const roomId = Array.from(socket.rooms).find(r => r !== socket.id);
    if (!roomId || !gameRooms.has(roomId)) return;

    const room = gameRooms.get(roomId);
    if (room.players.has(playerId)) {
      const player = room.players.get(playerId);
      room.deaths.push({
        playerId,
        x: player.x,
        y: player.y,
        timestamp: Date.now(),
      });
      room.players.delete(playerId);
    }

    // Broadcast
    io.to(roomId).emit('player-died', { playerId });
  });

  socket.on('game-start', ({ roomId }) => {
    io.to(roomId).emit('game-started');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Clean up player from rooms
    for (const [playerId, socketId] of playerSockets.entries()) {
      if (socketId === socket.id) {
        playerSockets.delete(playerId);
        // Remove from all rooms
        for (const [roomId, room] of gameRooms.entries()) {
          if (room.players.has(playerId)) {
            room.players.delete(playerId);
            io.to(roomId).emit('player-left', { playerId });
          }
        }
        break;
      }
    }
  });

  // Game loop - broadcast state every 60ms (~16 FPS)
  setInterval(() => {
    for (const [roomId, room] of gameRooms.entries()) {
      if (room.players.size > 0) {
        room.tick++;
        io.to(roomId).emit('game-state', {
          players: Array.from(room.players.values()),
          food: room.food,
          powerUps: room.powerUps,
          deaths: room.deaths,
          tick: room.tick,
        });
      }
    }
  }, 60);
});

const PORT = process.env.WS_PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
