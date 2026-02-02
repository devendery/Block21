## Final Implementation Plan: Non-Negotiable Rope Physics

I will implement the "Rope Model" by strictly following your non-negotiable constraints and implementation order. This approach ensures a stable, flicker-free movement where the head leads and the body follows a sacred history path.

### 🛠️ The Non-Negotiable Rules
1.  **Single Relaxation Pass**: I will only perform one `relaxPath()` pass on the history buffer per frame.
2.  **Turn-Locked Relaxation**: Relaxation will be strictly disabled when `turnIntensity >= 0.3`.
3.  **Zero-Lerp Segments**: Segments will be mapped directly to history points (`segment = history[index]`). No independent smoothing or lerping will be applied to segments.
4.  **Movement Clamping**: Every relaxation adjustment will be clamped to `MAX_MOVE = 2.5` to prevent feedback explosions.
5.  **Head Authority**: Only the head will interpolate toward server positions; the rest of the body will follow the head's visual path.

### 📌 Implementation Order (Non-Negotiable)

#### Step 1: Head-Only Interpolation
- Modify the `update()` loop to only interpolate `displayX`, `displayY`, and `displayAngle`.
- Disable current segment lerping entirely.

#### Step 2: History Buffer (Raw)
- Implement the `history` unshift/pop logic to record the head's exact visual path.
- No relaxation logic will be added yet.

#### Step 3: Fixed-Distance Sampling
- Implement distance-based sampling to place segments along the raw history path.
- Use `14-unit` spacing (PhysicsConfig.SEGMENT_DISTANCE).

#### Step 4: Turn Detection
- Calculate `turnIntensity` (0 to 1) by measuring the delta between current and previous `displayAngle`.

#### Step 5: Relaxation Loop & Decay
- Add the `relaxPath()` loop inside the `turnIntensity < 0.3` guard.
- Apply the exponential decay `exp(-i * 0.05)` to the straightening force.

#### Step 6: Safety Clamps
- Apply the `MAX_MOVE = 2.5` clamp to the relaxation deltas.

#### Step 7: Visual Synchronization
- Re-bind the **Obsidian Sovereign** rendering methods to the new history-sampled segment positions.

I will apply this exact sequence to [SnakeRenderer.ts](file:///Users/ramanrai/Desktop/Deva/Block21/lib/game/client/SnakeRenderer.ts) first, then verify, and synchronize with [GameRuntime.ts](file:///Users/ramanrai/Desktop/Deva/Block21/game-client/GameRuntime.ts).

Please confirm to begin this strict implementation.