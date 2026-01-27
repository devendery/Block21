## Bug Fix: Persistent Snake Body After Death

### Technical Changes:

#### 1. Client-Side Lifecycle Fixes (MainScene.ts)
- **Standardize Callbacks**: Switch from property assignment (`onAdd = ...`) to official Colyseus method calls (`players.onAdd(...)`) for better reliability.
- **Persistent Session ID**: Stop clearing `mySessionId` when a player is removed. This ensures the camera correctly re-attaches to the local player after they respawn.
- **Camera Re-targeting**: Ensure `startFollow` is called whenever the local player's renderer is (re)created.

#### 2. Rendering Guards (SnakeRenderer.ts)
- **Death Guard**: Add a check in the `update` loop. If `snake.alive` is false, the renderer will clear all graphics and skip drawing. This provides a fail-safe even if the object hasn't been destroyed yet.
- **Explicit Cleanup**: Verify that `destroy()` correctly removes all three graphics layers (head, body, shadow) from the Phaser scene.

#### 3. Server-Side Sync (index.ts)
- **State Flushing**: Ensure `player.alive = false` is set and synced before the player object is deleted from the map, preventing the client from missing the "death" transition.

## Verification:
- Test by intentionally hitting the world border.
- Verify that the camera follows the new snake after the 1-second respawn delay.
- Confirm that no "ghost" body segments remain at the death location.