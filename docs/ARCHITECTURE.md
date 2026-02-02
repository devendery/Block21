# Architecture Lock (Phase-1)

Any dev reads this and understands the project quickly.

## Stack
- Next.js (UI + API)
- Phaser (game client)
- Colyseus (multiplayer server)

## Game Entry
- `/play` → mounts React [SnakeGame.tsx](file:///Users/ramanrai/Desktop/Deva/Block21/components/phase1/snake/SnakeGame.tsx) → starts [GameRuntime.ts](file:///Users/ramanrai/Desktop/Deva/Block21/game-client/GameRuntime.ts)

## Authority
- Server authoritative
- Client sends input only

## Runtime Ownership
- game-client/GameRuntime.ts
  - Phaser.Game
  - Phaser.Scene
  - Colyseus client & room
  - Input → room.send("input")
  - Rendering & smoothing

## React Ownership
- Wallet (Wagmi)
- UI
- API calls
- Buttons
- Overlays
- Cosmetics selection

## Forbidden
- No Phaser imports in React
- No Colyseus imports in React
- No React imports in GameRuntime

Violation = PR rejected.
