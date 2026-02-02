## Goal (Exactly As Directed)
Implement Worms Zone curvature relaxation using **distance-sampled headHistory** and **progressive per-segment LERP**, without lerping the head and without changing speed.

## Step 1 — PhysicsConfig (Server + Client)
- Edit [server/src/Physics.ts](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/Physics.ts): add
  - `SEGMENT_LERP_MIN: 0.08`
  - `SEGMENT_LERP_MAX: 0.25`
- Edit [lib/game/core/Physics.ts](file:///Users/ramanrai/Desktop/Deva/Block21/lib/game/core/Physics.ts): add the same keys/values.

## Step 2 — Add Fields To SnakeLogic (Server)
Edit [server/src/Snake.ts](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/Snake.ts) inside `class SnakeLogic`:
- Add:
  - `private headHistory: { x: number; y: number }[] = [];`
  - `private lastHistoryX: number = 0;`
  - `private lastHistoryY: number = 0;`

Also ensure `lastHistoryX/Y` are initialized to the current head position at spawn (either in `constructor` or at end of `initSegments`) so the first distance check is correct.

## Step 3 — Record headHistory (Distance-Sampled)
In [SnakeLogic.update](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/Snake.ts#L44-L98), **immediately after**:
- `this.player.x += this.dirX * moveDist;`
- `this.player.y += this.dirY * moveDist;`

Insert **this exact block**:
- Compute `dx/dy/dist` from `lastHistoryX/Y`
- If `dist >= 1 || headHistory empty`, `unshift` current head pos and update `lastHistoryX/Y`
- Trim:
  - `maxHistory = this.internalSegments.length * PhysicsConfig.SEGMENT_DISTANCE + 10`
  - clamp `headHistory.length = maxHistory`

## Step 4 — Replace updateSegments() (Final Version)
Replace the existing `private updateSegments()` in [server/src/Snake.ts](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/Snake.ts#L146-L189) with **your exact method**:
- Use `segmentDist`, `len`
- Loop segments → sample `historyIndex = floor((i+1)*segmentDist)`
- Apply progressive relax:
  - `SEGMENT_LERP_MIN + (i/len)*(SEGMENT_LERP_MAX-SEGMENT_LERP_MIN)`
- Lerp body segments only:
  - `cur.x += (target.x-cur.x)*relax`
  - `cur.y += (target.y-cur.y)*relax`
- Keep the existing schema sync block unchanged.

## Step 5 — Verify
- Build/run server and client.
- Validate:
  - Tight circle → bend forms; stop turning → bends relax from head to tail.
  - No teleport/snaps while circling.
  - Boost stays stable.

## Step 6 — Store In Project Memory
After implementing, store these invariants:
- distance-sampled `headHistory`
- progressive `SEGMENT_LERP_MIN/MAX` relaxation
- never LERP head; only segments