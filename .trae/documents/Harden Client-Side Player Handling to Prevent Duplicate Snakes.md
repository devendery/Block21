I will implement the hardening steps for `handlePlayerAdd` and verify `handlePlayerRemove` in `lib/game/client/MainScene.ts` to permanently prevent duplicate snakes.

1. **Modify** **`lib/game/client/MainScene.ts`**:

   * **Harden** **`handlePlayerAdd`**: Add a check at the beginning of the function to see if a renderer for the given `sessionId` already exists. If it does, log an error and return immediately. This acts as a safety net against any race conditions or logic errors that might trigger `onAdd` twice.

   * **Verify** **`handlePlayerRemove`**: Ensure that `handlePlayerRemove` correctly retrieves the renderer, calls `renderer.destroy()` to clean up Phaser graphics, and then deletes it from the `snakeRenderers` map. (This logic is already present but will be double-checked and preserved).

This client-side hardening, combined with the server-side respawn fix, ensures a robust solution where:

* Duplicate renderers are blocked.

* Old renderers are properly destroyed.

* The "two snakes" artifact is impossible.

