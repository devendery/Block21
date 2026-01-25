I will implement the "Final, Correct Fix — Server-Authoritative Respawn" exactly as requested to permanently eliminate the ghost snake artifact.

1. **Modify** **`server/src/index.ts`**:

   * Replace the existing `killSnake` implementation with the provided "FINAL FIX" logic:

     * **Retrieve** the snake and preserve the `playerName`.

     * **Fully remove** the player from `this.state.players` and `this.snakes`.

     * **Use** `this.clock.setTimeout` (200ms delay) to handle respawning.

     * **Create** a brand new `Player` instance with the preserved name and session ID.

     * **Initialize** the new player's position, angle, and alive status.

     * **Add** the new player to `this.state.players` (triggering client `onAdd`).

     * **Initialize** `SnakeLogic` and segments, then add to `this.snakes`.

   * This ensures the client executes `onRemove` (destroying the old renderer) followed by `onAdd` (creating a fresh renderer), guaranteeing no state contamination.

