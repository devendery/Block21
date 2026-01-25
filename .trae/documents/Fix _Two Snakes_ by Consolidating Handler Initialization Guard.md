I will fix the "two snakes" issue by consolidating the handler initialization guard into a single, reliable flag.

1.  **Modify** **`lib/game/client/MainScene.ts`**:
    *   **Remove** the `handlersInitialized` property (if it exists) to eliminate confusion.
    *   **Verify** `roomHandlersBound` is initialized to `false`.
    *   **Update** `setupRoomHandlers` to strictly use `if (this.roomHandlersBound) return;` as the guard.
    *   **Implement** the exact `setupRoomHandlers` logic provided by the user (Hydrate -> Listen -> Leave), ensuring no duplicate listeners are attached.

2.  **Restart**:
    *   Stop both servers.
    *   Start them again to ensure a clean state with no lingering duplicate handlers.

This addresses the root cause: multiple executions of `setupRoomHandlers` due to a broken/missing guard variable, which caused listeners to be bound multiple times.
