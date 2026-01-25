I will implement the client-side state race condition fix with the double-binding protection in `MainScene.ts`.

### Implementation Steps
1.  **Refactor `MainScene.ts`:**
    *   **State Flag:** Add `private handlersInitialized = false;`.
    *   **Helper Methods:** Implement `handlePlayerAdd(player, sessionId)` and `handlePlayerRemove(player, sessionId)`.
    *   **Update `setupRoomHandlers()`:**
        *   Add check: `if (this.handlersInitialized) return;`.
        *   Set `this.handlersInitialized = true;`.
        *   Guard against undefined `this.room.state.players`.
        *   Iterate over existing players (`forEach`) calling `handlePlayerAdd`.
        *   Attach `onAdd` and `onRemove` listeners.
    *   **Update `create()`:** Wrap `setupRoomHandlers()` in `this.room.onStateChange.once(...)`.
    *   **Update `update()`:** Add safety guards for `this.room?.state?.players`.

### Verification
*   Restart client.
*   Confirm zero console errors on join.
*   Confirm immediate visibility of self and others.
*   Confirm no duplicate event bindings on hot reload.