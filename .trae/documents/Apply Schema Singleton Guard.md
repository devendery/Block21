I will strictly implement the HMR-safe schema pattern in `lib/game/schema/GameState.ts`.

### Implementation Steps
1.  **Rewrite `lib/game/schema/GameState.ts`:**
    *   Implement the mutable binding pattern with global cache.
    *   Define classes inside the `else` block using `...Def` suffix.
    *   Strictly preserve fields and decorators:
        *   `SnakeSegmentDef`: `@type` on `x`, `y`.
        *   `PlayerDef`: `@type` on `id`, `name`, `x`, `y`, `angle`, `alive`, `score`, `speed`, `segments`.
        *   **No `@type`** on `dirX`, `dirY`, `history`.
        *   `FoodDef`: `@type` on `x`, `y`, `value`.
        *   `GameStateDef`: `@type` on `mapSize`, `players`, `food`.
    *   Assign to `let` variables and update global cache.
    *   Export the variables.

2.  **Restart Client Server:**
    *   Stop Terminal 3.
    *   Run `npm run dev`.

### Verification
*   Refresh browser.
*   Confirm no "Duplicate definition" error.
*   Confirm game functionality.