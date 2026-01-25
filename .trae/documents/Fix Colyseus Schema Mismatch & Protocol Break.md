I will fix the Schema Protocol Mismatch by creating a bit-for-bit identical shared schema and forcing a clean environment reset.

### Implementation Steps
1.  **Create Shared Schema:**
    *   Create `lib/game/schema/GameState.ts`.
    *   Copy the **exact** content of `server/src/State.ts` into this file.
    *   Ensure **zero** modifications (no reordering, no renaming, no cleanup, preserve all defaults).

2.  **Update Server Imports:**
    *   Keep `server/src/State.ts` as the file the server uses (to avoid build complexity).
    *   **Contract:** Treat `server/src/State.ts` and `lib/game/schema/GameState.ts` as a hard contract. They must remain identical.

3.  **Update Client Imports:**
    *   Modify `lib/game/client/MainScene.ts` to import `GameState`, `Player`, `SnakeSegment`, `Food` from `../../schema/GameState` (relative path).
    *   Modify `lib/game/client/SnakeRenderer.ts` to import `Player` from `../../schema/GameState`.
    *   **Trap Avoidance:** Ensure *all* nested schema classes (`SnakeSegment`, `Food`) are imported by the client if they are part of the state tree.

4.  **Verification Logs:**
    *   Add `console.log("SERVER GameState fields:", Object.keys(this.state));` to `server/src/index.ts` (in `onCreate`).
    *   Add `console.log("CLIENT GameState fields:", Object.keys(state));` to `lib/game/client/MainScene.ts` (in `onStateChange.once`).

5.  **Nuclear Reset (Mandatory):**
    *   Delete `node_modules` and `package-lock.json` in `root` and `server/`.
    *   Run `npm cache clean --force`.
    *   Run `npm install` in both locations.

### Verification
*   Restart Server and Client.
*   Check logs: Both must print matching keys (e.g., `["players", "food", "mapSize"]`).
*   Confirm `refId not found` errors are gone.
*   Confirm `handlePlayerAdd` fires and game renders.