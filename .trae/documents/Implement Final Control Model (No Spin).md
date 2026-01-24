# Phase 1: Perfect Control - Final Fix Plan

## 1. Input Manager Refactoring (`Input.ts`)
We will completely rewrite `Input.ts` to stop using absolute mouse positions (which jitter with camera movement) and switch to **relative mouse movement** (`movementX`, `movementY`).

### Key Changes:
- **Remove:** Logic calculating vector from `head` to `mouseWorldPos`.
- **Add:** State to track a stable `targetDirection` vector.
- **Add:** Logic to update `targetDirection` *only* when `pointer.movementX/Y` exceeds a threshold.
- **Output:** Returns a stable `targetDirection` vector that persists even when the mouse stops.

## 2. Snake Physics Update (`Snake.ts`)
We will simplify the snake's update loop to purely follow the `targetDirection` provided by the input manager.

### Key Changes:
- **Remove:** Any internal angle calculation based on raw input.
- **Update:** The `update(dt, inputVector)` method will treat `inputVector` as the **desired direction**.
- **Logic:**
  1. Calculate `currentAngle` from `dirX/dirY`.
  2. Calculate `targetAngle` from `inputVector`.
  3. Rotate `currentAngle` towards `targetAngle` by `TURN_SPEED * dt`.
  4. Update `dirX/dirY` based on new angle.
  5. Move forward by `speed * dt`.

## 3. Verification Steps
1. **Stationary Test:** Stop moving mouse -> Snake must fly straight.
2. **Camera Test:** Snake moves -> Camera follows -> Snake must NOT wobble/spin.
3. **Responsiveness:** Move mouse -> Snake turns smoothly.

This plan aligns 100% with the "Golden Snake Control Rule" provided.
