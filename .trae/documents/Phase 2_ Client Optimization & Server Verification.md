# Phase 2: Client Optimization & Server Loop Verification

We have confirmed that the **Server is ALREADY running the full physics loop** (updating position, segments, and history every tick). We do not need to implement the server loop, only verify it.

## 1. Client Optimizations (Immediate Fixes)
We will address the critical client-side issues identified:

### 1.1 Throttle Input Sending
- Modify `MainScene.ts` to implement a `lastInputSentAt` throttle (20Hz / 50ms).
- This ensures we don't spam the server with 60fps input updates.

### 1.2 Add Connection Guard
- Add `this.room.onLeave` handler in `MainScene.ts` to log disconnections and prevent errors if the connection drops.

### 1.3 Renaming for Clarity
- Rename `handlersInitialized` to `roomHandlersBound` in `MainScene.ts` as suggested.

## 2. Verification Steps
After applying the client fixes:
1.  **Restart Client**: Ensure changes take effect.
2.  **Verify Movement**: Connect and move. Confirm the snake moves smoothly.
3.  **Verify Throttling**: Check network tab (or add a log) to ensure input messages are sent at ~20Hz, not 60Hz.
4.  **Verify Server Authority**: Since the server loop is active, the smooth movement confirms the server is correctly updating positions and the client is correctly rendering the synced state via the proxy.

## Next Steps (Post-Plan)
Once these fixes are in and verified, we will be ready to move to **Phase 3** (Food, Growth, and Gameplay Loop Refinement).
