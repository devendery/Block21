I will strictly implement the path alias fix and restart the environment to verify the solution.

### Implementation Steps
1.  **Update `tsconfig.json` (Root):**
    *   Add `"@game/*": ["lib/game/*"]` to `compilerOptions.paths`.
    *   Ensure `"baseUrl": "."` is set.

2.  **Update Imports (Client Only):**
    *   **MainScene.ts:** Change `import ... from '../../schema/GameState'` to `import ... from '@game/schema/GameState'`.
    *   **SnakeRenderer.ts:** Change `import ... from '../../schema/GameState'` to `import ... from '@game/schema/GameState'`.

3.  **Restart Environment:**
    *   Stop both Client (Terminal 3) and Server (Terminal 4).
    *   Restart both.

### Verification
*   Check browser logs for `CLIENT GameState class` and `CLIENT GameState fields`.

**Constraint:** I will NOT modify schema, refactor logic, add guards, or perform another reset. Only alias and imports.