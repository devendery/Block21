# Phase 2 Completion: Final Lifecycle Fixes

We have successfully resolved the `refId` protocol issues and the schema API mismatch. The only remaining task is to silence the harmless but noisy `WebSocket is already in CLOSING or CLOSED state` error caused by React/Next.js HMR and Phaser's persistent loop.

## The Fix
I will implement two connection guards in `lib/game/client/MainScene.ts`:

1.  **Update Loop Guard**:
    -   In `update()`, check `if (!this.room || this.room.connection.isOpen !== true) return;` before sending any data.
    -   This prevents the client from trying to send input to a dead socket during scene teardown or reload.

2.  **Shutdown Handler**:
    -   In `create()`, listen for `Phaser.Scenes.Events.SHUTDOWN`.
    -   On shutdown, force a clean `this.room.leave()`.
    -   This ensures the socket is closed gracefully when the scene is destroyed (e.g., during navigation or hot reload).

## Plan
1.  **Modify `MainScene.ts`**: Add the shutdown handler in `create()` and the guard in `update()`.
2.  **Restart Client**: Apply the JS changes (no server restart needed).
3.  **Final Verification**: Confirm the console is clean of WebSocket errors and the game remains playable.

This marks the official completion of Phase 2.
