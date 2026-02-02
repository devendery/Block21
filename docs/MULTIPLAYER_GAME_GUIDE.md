# Block21 Worms - Multiplayer & Tournament Guide

## 🎮 Overview

This enhanced version of Block21 Worms includes:
- **MetaMask-only authentication** (required to play)
- **Multiplayer Lobby System** with invite links
- **Tournament Mode** with crypto prizes
- **Real-time gameplay** (ready for WebSocket integration)
- **Enhanced UI** matching worms.zone style

## 🚀 Features

### 1. MetaMask Authentication
- Players must connect MetaMask wallet to play
- Secure wallet-based identity
- Crypto payment integration ready

### 2. Game Modes

#### Single Player
- Play against AI bots
- Practice mode
- Earn B21 tokens

#### Multiplayer Lobby
- Create or join lobbies
- Invite friends via link or code
- Real-time multiplayer (up to 4 players)
- Customizable settings

#### Tournament Mode
- Entry fee in B21 tokens
- Prize pool distribution
- Up to 8 players
- Winner takes 50%, 2nd gets 30%, 3rd gets 20%

### 3. Invite System
- **6-digit invite codes** (e.g., `ABC123`)
- **Shareable links** with room ID and code
- Copy to clipboard functionality
- Join by code or link

### 4. Enhanced Features
- Multiple worm skins (classic, neon, shadow, gold, cyber, toxin, crimson, void)
- Power-ups (Magnet, Food Multiplier, Death Radar, Speed, Maneuver, Zoom)
- Real-time leaderboard
- Tournament results with prize distribution

## 📁 File Structure

```
app/
  worms-enhanced/
    page.tsx              # Main game page with mode selection
  api/
    game/
      room/
        route.ts          # Room management API

components/
  game/
    MultiplayerLobby.tsx   # Lobby interface
    TournamentLeaderboard.tsx  # Tournament results
    WormsGame.tsx         # Enhanced game component

lib/
  multiplayer.ts          # Multiplayer utilities and types
```

## 🔧 API Endpoints

### Room Management (`/api/game/room`)

**POST** - Create/Join/Update rooms
```json
{
  "action": "create" | "join" | "leave" | "update" | "get" | "list",
  "roomId": "string",
  "player": { "address", "username", "skin", "ready" },
  "mode": "lobby" | "tournament",
  "settings": { ... }
}
```

**GET** - Get room by ID or invite code
- `?id=roomId` - Get by room ID
- `?code=ABC123` - Get by invite code
- No params - List all waiting rooms

## 🎯 Usage

### Creating a Room
```typescript
const response = await fetch('/api/game/room', {
  method: 'POST',
  body: JSON.stringify({
    action: 'create',
    mode: 'lobby', // or 'tournament'
    player: {
      address: walletAddress,
      username: 'PlayerName',
      skin: 'classic',
      ready: false,
    },
  }),
});
```

### Joining a Room
```typescript
// By invite code
const response = await fetch('/api/game/room?code=ABC123');

// By room ID
const response = await fetch('/api/game/room?id=roomId123');
```

### Sharing Invite Link
```
https://yoursite.com/worms-enhanced?room=roomId&code=ABC123
```

## 🎨 UI Features

- **Modern gradient design** matching worms.zone
- **Responsive layout** for mobile and desktop
- **Real-time player status** (ready/waiting)
- **Host controls** (start game, settings)
- **Tournament prize display**
- **Copy-to-clipboard** for invites

## 🔮 Future Enhancements

1. **WebSocket Integration** - Real-time game state sync
2. **Spectator Mode** - Watch ongoing games
3. **Chat System** - In-game communication
4. **Replay System** - Watch past games
5. **Achievement System** - Unlock rewards
6. **Seasonal Tournaments** - Scheduled events
7. **Custom Arenas** - Different map layouts

## 💰 Crypto Integration

### Tournament Entry
- Players pay entry fee in B21 tokens
- Prize pool accumulates
- Smart contract integration ready

### Prize Distribution
- Winner: 50% of pool
- 2nd Place: 30% of pool
- 3rd Place: 20% of pool

## 🛠️ Development Notes

- Currently uses in-memory storage (replace with Redis/DB for production)
- Room state persists during session
- Ready for WebSocket upgrade for real-time sync
- MetaMask connection required for all game modes

## 📝 Next Steps

1. Add WebSocket server for real-time gameplay
2. Integrate smart contract for tournament payments
3. Add database persistence for rooms
4. Implement spectator mode
5. Add game replays
6. Create admin dashboard for tournaments
