# Phase 2 Diagnosis: Server Loop & Input Verification

We need to verify two critical server-side behaviors:
1.  **Input Reception**: Is the server receiving "input" messages?
2.  **Physics Loop**: Is `setSimulationInterval` actually firing?

## Plan
1.  **Modify `server/src/index.ts`**:
    -   **Input Handler**: Add `console.log("SERVER INPUT from", client.sessionId, input);` in `onMessage("input")`.
    -   **Simulation Loop**: Add `console.log("TICK", deltaTime);` in `setSimulationInterval` (or the `update` method it calls).
2.  **Restart Server**: Apply changes.
3.  **Verify**:
    -   Check for `SERVER INPUT ...` logs when moving the mouse.
    -   Check for `TICK 50` logs appearing continuously.

This will definitively prove if the server is "alive" and "listening".
