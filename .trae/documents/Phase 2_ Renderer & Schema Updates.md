# Phase 2: Renderer Optimization & Server-Side Boost State

We need to add deterministic boost handling by adding `isBoosting` to the Player schema. This requires changes on both Server and Client.

## 1. Schema Update (Server & Client)
Add `@type("boolean") isBoosting: boolean = false;` to the `Player` class in:
- `server/src/State.ts` (Server source of truth)
- `lib/game/client/ClientState.ts` (Client isolated schema)

## 2. Server Logic Update (`Snake.ts`)
Update `server/src/Snake.ts` to set `this.player.isBoosting` based on the input.
- In `update()`, assign `this.player.isBoosting = input.boost;` (or derived from speed logic if preferred, but explicit input state is safer).

## 3. Client Renderer Update (`SnakeRenderer.ts`)
Update `lib/game/client/SnakeRenderer.ts`:
- Replace `const isBoosting = this.snake.speed > ...` with `const isBoosting = this.snake.isBoosting;`.
- Implement the shadow fade fix: `const shadowAlpha = VisualConfig.SHADOW_ALPHA * scale;`.

## 4. Verification
1.  **Restart Server**: To apply schema changes.
2.  **Restart Client**: To apply schema and renderer changes.
3.  **Verify**:
    - Boost visual (brighter core) triggers correctly when boosting.
    - Tail shadow fades out smoothly.

I will perform these updates in order.
