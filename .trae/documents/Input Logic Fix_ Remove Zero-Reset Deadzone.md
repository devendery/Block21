# Phase 2 Final Debug: Input Deadzone Fix

The user reports: "snake is moving but not turning any direction while move mouse".

## Root Cause Analysis
In `lib/game/client/Input.ts`:
```typescript
if (Math.abs(dx) > deadZone || Math.abs(dy) > deadZone) {
   this.inputVector = normalize({ x: dx, y: dy });
} else {
    // If inside deadzone, keep previous vector (don't update) -> snake keeps moving straight
    // Wait, if we return (0,0), Snake.ts ignores it. 
    // So we just return (0,0).
    this.inputVector = { x: 0, y: 0 }; // <--- HERE IS THE BUG
}
```
If the mouse is inside the "deadzone" (40px from center), the input becomes `{x:0, y:0}`.
Since the camera follows the snake, the snake is **always** at the center of the screen.
If the user holds the mouse near the center (or doesn't move it wildly), `dx/dy` might be small, resetting the vector to `0,0`.

Even worse, if `inputVector` becomes `0,0`, the server might ignore it or (if logic is flawed) stop turning. But the comment says "snake keeps moving straight".

**Wait, actually:**
If I return `{0,0}`, the server code does:
`snake.lastInput ?? { vector: { x: snake.player.dirX, y: snake.player.dirY } ... }`

If I send `{x:0, y:0}`, the server receives it.
In `Snake.ts` (Server):
```typescript
if (input.vector.x !== 0 || input.vector.y !== 0) {
    // update target angle
}
```
If I send `0,0`, the target angle **does not update**.

**The Issue**: The deadzone logic is resetting the `this.inputVector` state to `0,0` aggressively.
If the user moves the mouse *slightly*, it might be ignored.
But the user says "not turning ANY direction". This implies the vector is ALWAYS 0,0 or the server is ignoring it.

**The Fix**:
1.  **Remove the `else { this.inputVector = {x:0,y:0} }` block**. We should **retain** the last valid input vector if the mouse is in the deadzone. This acts as "maintain heading".
2.  Also, `deadZone = 40` might be too large. Let's reduce it to `10` or `5`.

## Plan
1.  **Modify `lib/game/client/Input.ts`**:
    -   Reduce `deadZone` to `10`.
    -   Remove the `else` block that resets `this.inputVector` to zero.
2.  **Restart Client**: Apply changes.
3.  **Verify**: Mouse movement should now turn the snake.

I will apply this fix.
