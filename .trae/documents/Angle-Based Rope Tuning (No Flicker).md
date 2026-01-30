## Goal
Make the rope behavior react to **turning angle**: tight turns preserve curvature; gentle turns allow gradual straightening head→tail, without flicker.

## Constraints (Non‑Negotiable)
- Only **one** relaxation pass per frame (history only).
- **Never** relax while turning hard (`turnIntensity >= 0.3`).
- Segments **never** lerp; segments only **sample** from history.
- Relax deltas are clamped (`MAX_MOVE = 2.5`).
- Head is the only interpolated component.

## Current State (What’s Missing)
- The code already computes `turnIntensity`, but relaxation strength is currently not smoothly tied to it. This can make turns feel stiff/unnatural (straightening too early or not scaling with turn angle).

## Implementation Steps (Exact Order)
### 1) Head interpolation only
- Keep [SnakeRenderer.ts](file:///Users/ramanrai/Desktop/Deva/Block21/lib/game/client/SnakeRenderer.ts) head interpolation as the only smoothing.
- Use one consistent constant `MAX_TURN_RATE` (the same value used in `RotateTo`) so turn detection matches real head turning.

### 2) History buffer (no relaxation yet)
- Continue unshift/pop the head position into `history`.
- Keep teleport/respawn reset to rebuild history behind the head.

### 3) Fixed-distance sampling
- Keep distance-walk sampling (segments at `(i+1) * SEGMENT_DISTANCE` behind head), no lerp.

### 4) Turn detection (angle-based)
- Compute `turnIntensity = clamp(abs(angleDelta) / MAX_TURN_RATE, 0, 1)`.
- This makes `turnIntensity` directly proportional to how hard the head is turning.

### 5) Relaxation loop (angle-gated)
- Keep the hard gate: only run relaxation when `turnIntensity < 0.3`.
- Inside relaxation, scale strength by turn amount:
  - `turnFactor = clamp((0.3 - turnIntensity) / 0.3, 0, 1)`
  - `strength = BASE_STRENGTH * turnFactor * exp(-i * 0.05)`
- This makes relaxation gradually stronger as the snake straightens, and nearly zero right after a turn.

### 6) Decay
- Keep exponential decay `exp(-i * 0.05)` so straightening propagates head→tail.

### 7) Safety clamps
- Enforce `MAX_MOVE = 2.5` on dx/dy every point.

## Sync to Other Renderer
- Apply the same angle-based `turnFactor` scaling to [GameRuntime.ts](file:///Users/ramanrai/Desktop/Deva/Block21/game-client/GameRuntime.ts) so both renderers feel identical.

## Verification
- Test slow arcs vs sharp turns:
  - Sharp turn: body preserves curve, no straightening.
  - Stop turning: head straightens first, tail last.
  - Boost: curve stretches smoothly.
  - No flicker at varying FPS.
