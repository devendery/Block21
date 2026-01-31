# Phase 4: Gameplay Expansion - Step 1 & 2 (Final)

I will lock the base and implement dynamic scaling with professional-grade initialization and camera polish.

## Implementation Steps

### Step 1: Lock the Base (Git)
I will execute the following sequence to preserve the current stable state:
1. `git commit -am "Fix ghost snake, respawn, and state sync (stable base)"`
2. `git tag v0.1-multiplayer-stable`
3. `git push origin main --tags`
4. `git checkout -b feature-gameplay`

### Step 2: Fix Game Feel (Implementation)

#### 1. Server-Side ([State.ts](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/State.ts), [Snake.ts](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/Snake.ts), [index.ts](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/index.ts))
- **Schema Update**: Add `@type("number") radius` to `Player` in `State.ts`.
- **Professional Initialization**: Initialize `player.radius = PhysicsConfig.BASE_RADIUS` explicitly in `index.ts` during player creation to avoid "undefined" frames.
- **Dynamic Logic**: In `Snake.ts`, compute `radius` and `turnSpeed` per-tick using the approved formulas based on `length`.
- **Collision Math**: Update `checkSelfCollision` and `checkWorldBoundary` to use the dynamic `this.player.radius`.

#### 2. Client-Side ([SnakeRenderer.ts](file:///Users/ramanrai/Desktop/Deva/Block21/lib/game/client/SnakeRenderer.ts), [MainScene.ts](file:///Users/ramanrai/Desktop/Deva/Block21/lib/game/client/MainScene.ts))
- **Direct Rendering**: `SnakeRenderer.ts` will draw using `this.snake.radius` with no local recalculation.
- **Lerped Look-Ahead**: Implement camera target interpolation in `MainScene.ts` using `Math.cos/sin(head.angle) * lookAhead`.
- **Biased Zoom**: Apply the direction-dependent zoom lerp (faster zoom-out, slower zoom-in).

## Verification Checklist
- [x] **Git**: Tagged `v0.1-multiplayer-stable` and on `feature-gameplay` branch
- [ ] **Sync**: Radius is identical on server + all clients (log check)
- [ ] **Visual**: Big snake visibly thicker
- [ ] **Feel**: Turning feels slower at high length
- [ ] **Camera**: Anticipates movement with lerp
- [ ] **Stability**: No jitter on respawn or remote joins

Proceeding with Step 1 now.