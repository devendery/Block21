Phase-0 (Legacy) game code is frozen.

Legacy routes remain in the repo for reference but are disconnected from the main navigation:

- /game (legacy hub) now redirects to /play
- /worms, /arena, /css-snake are legacy pages

Legacy multiplayer/data systems:

- server/websocket-server.js
- lib/websocket.ts
- app/api/game/*
- lib/gameRoomDb.ts
- lib/gameDb.ts

New Phase-1 replaces this with:

- Phaser client (Snake)
- Colyseus rooms (authoritative server)
- Supabase for multi-game tables + leaderboard + rewards
- Backend-verified Polygon B21 rewards flow

