# Phase 1 Refinement: Organic Tail Tapering (Final Locked Plan)

## 1. Objective
Implement the strictly defined **Quadratic Ease-Out** taper formula in `SnakeRenderer.ts`. This is the final visual polish step for Phase 1.

## 2. Implementation Logic
We will apply the following authoritative code block to both `drawBody` and `drawShadows` in `SnakeRenderer.ts`:

```typescript
// Start of visual tapering (index-based)
const taperStartIndex = Math.floor(
  totalSegments * VisualConfig.TAIL_TAPER_START
);

// Normalized progress from 0 → 1
let t = (i - taperStartIndex) / (totalSegments - taperStartIndex);
t = Math.min(1, Math.max(0, t)); // safety clamp

// TRUE quadratic ease-out (organic tail)
// EaseOutQuad: 1 - (1 - t)^2
const smoothT = 1 - (1 - t) * (1 - t);

// Final visual scale
const scale = 
  1 - smoothT * (1 - VisualConfig.TAIL_MIN_SCALE);
```

## 3. Verification
*   **Visual:** Confirm seamless, organic tail transition in browser.
*   **Physics:** Confirm zero changes to `Snake.ts`.

This plan is **LOCKED** and ready for execution.
