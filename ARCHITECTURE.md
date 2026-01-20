# Architecture Lock (Phase-1) 

## Runtime Ownership 
- game-client/GameRuntime.ts 
  - Phaser.Game 
  - Phaser.Scene 
  - Colyseus client & room 
  - Input → room.send("input") 
  - Rendering & smoothing 

## React Ownership 
- UI 
- Wallet (Wagmi) 
- API calls 
- Overlays 
- Buttons 
- Cosmetics selection 

## Hard Rules 
- No Phaser imports in React 
- No Colyseus imports in React 
- No React imports in GameRuntime 
- GameRuntime exposes only startGame / stopGame / updateCosmetics 

Violation = PR rejected.
