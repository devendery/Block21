I will fix the server-side schema initialization order to eliminate "refId not found" errors by ensuring segments are created only after the player is attached to the state.

### Implementation Steps
1.  **Modify `server/src/Snake.ts`:**
    *   Remove the segment initialization logic from the `constructor`.
    *   Create a new method `initSegments()` containing that logic.
    *   Use the correct logic (with direction handling) that I previously fixed.

2.  **Modify `server/src/index.ts`:**
    *   In `onJoin`, move the logic:
        1.  Create `Player`.
        2.  Attach `Player` to `this.state.players`.
        3.  Create `SnakeLogic`.
        4.  Call `snakeLogic.initSegments()`.

3.  **Verification:**
    *   Restart Server (Terminal 4).
    *   Refresh Browser.
    *   Confirm no "refId not found" errors in console.

### Code Changes
**`Snake.ts`:**
```typescript
constructor(player: Player) {
    this.player = player;
    this.player.speed = PhysicsConfig.BASE_SPEED;
    this.dirX = Math.cos(player.angle);
    this.dirY = Math.sin(player.angle);
    // REMOVED segment init
}

initSegments() {
    if (this.player.segments.length > 0) return;
    for (let i = 0; i < 20; i++) {
        // ... logic ...
        this.player.segments.push(seg);
    }
}
```

**`index.ts`:**
```typescript
this.state.players.set(client.sessionId, player); // Attach FIRST
const snakeLogic = new SnakeLogic(player);
snakeLogic.initSegments(); // Init AFTER attach
this.snakes.set(client.sessionId, snakeLogic);
```

This adheres to the "Top-Down Schema Graph Construction" rule.