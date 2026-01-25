I will modify the client-side rendering logic to handle the player respawn "teleportation" correctly, preventing the "flying head" visual artifact that looks like a second snake.

1.  **Modify `lib/game/client/SnakeRenderer.ts`**:
    *   Update the `update()` method to check the distance between the current display position (`displayX`, `displayY`) and the target server position (`this.snake.x`, `this.snake.y`).
    *   If the distance exceeds a threshold (e.g., 500 pixels), assume a "teleport" or "respawn" event occurred.
    *   In this case, **snap** the display values directly to the target values instead of interpolating, ensuring the snake instantly appears at the new spawn location as a whole unit.
