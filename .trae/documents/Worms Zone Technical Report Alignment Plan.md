## What The Technical Report Implies (Mapped to Our Code)
- **Movement core (report):** “Chained Distance Constraint / Segment Pursuit” (constant `segmentLength`) where each segment follows the previous with a distance constraint.
- **Networking (report):** Server-authoritative + **client-side prediction for local player**, plus **interpolation buffer (100–200ms)** for other snakes.
- **Scaling/AOI (report):** Grid-based interest management (already present) + bandwidth reduction (binary messages, minimal state).

Current implementation status in this repo:
- **Server movement:** Direction inertia + turn-rate clamp + forward integration in [SnakeLogic.update](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/Snake.ts#L41-L103).
- **Server body:** History-walk follower in [SnakeLogic.updateSegments](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/Snake.ts#L143-L175) (not the exact report algorithm).
- **Client smoothing:** Presentation-only head lerp + render-history rope model in [SnakeRenderer.update](file:///Users/ramanrai/Desktop/Deva/Block21/lib/game/client/SnakeRenderer.ts#L87-L342) (no true prediction, no interpolation buffer).
- **AOI grid:** Present in [SpatialGrid + AOI update](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/index.ts#L13-L56) and [update loop](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/index.ts#L242-L359).

## Step-by-Step Update Plan (No Missing Pieces)
### Step 1 — Align Server Body To “Chained Distance Constraint”
Goal: Make server segments follow exactly like the report pseudocode.
- Update [server/src/Snake.ts](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/Snake.ts): replace `updateSegments()` with the constraint solver:
  - For each segment `i`, set `prev = (i==0 ? head : segments[i-1])`.
  - Compute `dx,dy,dist`.
  - If `dist > segmentLength`, move the current segment toward `prev` by `(dist - segmentLength)/dist`.
  - (Optional but recommended) run 2 solver passes at high speed to keep spacing stable.
- Keep growth behavior the same (append at tail position) in [grow](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/Snake.ts#L105-L118).
- Keep collision logic server-authoritative (already in [server/src/index.ts](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/index.ts#L145-L199)).

### Step 2 — Make Client Render Use Interpolation Buffer (100–200ms)
Goal: Smooth other snakes exactly like the report: buffer snapshots and interpolate.
- Update [lib/game/client/MainScene.ts](file:///Users/ramanrai/Desktop/Deva/Block21/lib/game/client/MainScene.ts) and/or [SnakeRenderer.ts](file:///Users/ramanrai/Desktop/Deva/Block21/lib/game/client/SnakeRenderer.ts):
  - Maintain per-remote-player a ring buffer: `{tClient, x, y, angle}`.
  - Render remote snakes at `now - interpolationDelay` (start with 150ms).
  - Interpolate between surrounding buffered snapshots (linear for position, angle-lerp with wrap).
- Result: eliminates jitter from packet timing and removes “flicker” caused by direct lerp-to-latest.

### Step 3 — Add True Client-Side Prediction + Reconciliation (Local Player)
Goal: Match report: local player feels instant while server stays authoritative.
- Add input sequencing:
  - Client sends `inputSeq` with each input message.
  - Server stores last processed `inputSeq` on the Player schema (new field, e.g. `lastAckInputSeq`).
- Client prediction:
  - Client simulates head locally using the same rules as server (turn clamp, inertia, speed).
  - When authoritative snapshot arrives (player.x/y + `lastAckInputSeq`), client:
    1) snaps its predicted baseline to server state,
    2) replays pending inputs after `lastAckInputSeq`,
    3) applies a small error-correction smoothing to avoid visible pops.
- This replaces “lerp the local head to server” with a proven netcode model.

### Step 4 — Reduce Bandwidth: Stop Syncing Full Segments Every Tick (Optional, After Steps 1–3)
Goal: Move toward the report’s “minimal binary payload” approach.
- Today, segments are part of the Colyseus schema: [Player.segments](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/State.ts#L14-L35) (expensive at large lengths).
- Two safe options:
  - **Option A (lowest risk):** keep server segments for collision, but client renders using its own pursuit algorithm from buffered head snapshots; only sync `length`.
  - **Option B (hybrid):** sync only sparse “path points” (already exists as `pathPoints`) and reconstruct segments client-side.
- This step is the key to scaling player counts.

### Step 5 — AOI/Grid Improvements (Match Scaling Notes)
Goal: Keep interest management correct and cheaper.
- Keep current grid query model (already matches report concept).
- Optimize later:
  - incremental grid updates instead of clearing/rebuilding every tick,
  - AOI radius tied to camera zoom / view distance,
  - avoid sending entities outside AOI via schema view (already in use).

### Step 6 — Infrastructure Notes (Future)
Goal: Don’t miss the report’s infra section.
- Documented target: regional clusters + load balancers + high concurrency instances.
- Not implemented in code changes, but the code will be prepared via Steps 4–5 (bandwidth + AOI).

## What I Will Store In Project Memory (After You Confirm Plan)
- “Chained distance constraint” segment solver requirements + pseudocode mapping.
- “Server-authoritative + prediction(local) + interpolation(others, 100–200ms)” requirements.
- “Grid-based interest management” as scaling invariant for this repo.

If you confirm this plan, I will implement Step 1 → Step 3 first (core correctness + smooth feel), verify in dev, then do Step 4–5 as the scaling pass.