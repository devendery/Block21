# Phase 4: Organic Movement Implementation Plan

I will replace the arc-based movement model with a steering-impulse model on the server to make snake movement feel heavy, organic, and realistic.

## Technical Implementation Steps

### 1. Physics Constants & Helpers ([Physics.ts](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/Physics.ts))
- Add a `clamp(value, min, max)` helper to provide the same functionality as `Phaser.Math.Clamp` on the server.
- Ensure `angleDifference` is robust for calculating steering deltas.

### 2. Steering Model Implementation ([Snake.ts](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/Snake.ts))
- **Add Property**: Initialize `private angularVelocity: number = 0` in `SnakeLogic`.
- **Steering Parameters**: Implement the following per-tick logic in the `update` method:
    - **Mass Factor**: `1 / (1 + length * 0.015)` (Larger snakes have more inertia).
    - **Input Translation**: Convert the `input.vector` into a steering signal `inputTurn` (-1 to 1) by normalizing the angle difference between current heading and target direction.
    - **Impulse**: `angularVelocity += inputTurn * 0.0025 * massFactor`.
    - **Realism Noise**: Add `(Math.random() - 0.5) * 0.0001` to break mathematical perfection.
    - **Clamp**: Constrain `angularVelocity` between `±0.06 * massFactor`.
    - **Damping**: Apply `0.88` damping to ensure the snake straightens out when not turning.
- **Apply Heading**:
    - Update `player.angle` using the calculated `angularVelocity`.
    - Derive `dirX` and `dirY` from the new `player.angle`.
    - Update position using `Math.cos/sin` of the new angle.

### 3. Clean Up Legacy Logic
- Remove the old `currentTurnSpeed` and direct angle clamping logic.
- Ensure the server remains the sole source of truth for movement.

## Verification Checklist
- [ ] **No Perfect Circles**: Holding left/right produces a spiral or wide curve, never a static circle.
- [ ] **Natural Straightening**: Releasing the mouse makes the snake gradually return to a straight path.
- [ ] **Massive Weight**: A snake with 100+ segments feels noticeably "heavier" and turns much wider than a fresh snake.
- [ ] **No Jitter**: The small noise addition does not cause visual jitter but prevents robotic movement.

I will begin by adding the `clamp` helper and then refactor the `SnakeLogic.update` method. Proceed?