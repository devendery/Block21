I will implement the final Client-Side State Hydration Fix by ensuring the client waits specifically for the `players` map before setting up handlers.

### Implementation Steps
1.  **Modify `lib/game/client/MainScene.ts`:**
    *   **In `create()` method:** Replace the `onStateChange.once` block with the `waitForPlayers` recursive pattern.
        ```typescript
        const waitForPlayers = () => {
            const state = this.room.state;
            if (state && state.players) {
                this.setupRoomHandlers();
            } else {
                this.room.onStateChange.once(waitForPlayers);
            }
        };
        waitForPlayers();
        ```
    *   **In `setupRoomHandlers()` method:** Downgrade the `if (!players)` log from `console.error` to `console.debug("Players map not ready yet (guard hit)");`.

2.  **Verification:**
    *   Refresh the browser.
    *   Confirm the "State not ready" error log is gone (or appears only as debug if hit).
    *   Confirm the game connects and renders the snake.

### Constraints & Guidelines
*   **DO NOT TOUCH:** Schema, Server state timing, Next.js config, Webpack, Decorators, Colyseus versions.
*   **Focus:** Only `MainScene.ts` lifecycle logic.

This aligns perfectly with the user's "Final Form" instructions.