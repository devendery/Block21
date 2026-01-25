# Phase 2 Final Fix: Schema v3 API Update

I will now apply the definitive fix for the `players.onAdd is not a function` error by migrating the Colyseus `MapSchema` callbacks to the v3 syntax.

## Plan
1.  **Modify `lib/game/client/MainScene.ts`**:
    -   Locate `setupRoomHandlers()`.
    -   Replace `players.onAdd(...)` with `players.onAdd = ...`.
    -   Replace `players.onRemove(...)` with `players.onRemove = ...`.
    -   Preserve `players.forEach(...)` for initial state handling.
2.  **Verify No v2 Syntax**: Ensure no instances of `.onAdd(` or `.onRemove(` remain.
3.  **Restart Client**: Run `npm run dev -- --webpack` to apply changes.
4.  **Confirm**: Check browser logs for successful player join and rendering.

I will proceed with the edit.
