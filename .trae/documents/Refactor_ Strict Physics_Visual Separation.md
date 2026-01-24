# Phase 1: Physics & Visual Separation Refactor (Revised)

## 1. Comparison: Existing vs. New Architecture

| Feature | **Current State** (Existing) | **New Architecture** (Proposed) | **Why Change?** |
| :--- | :--- | :--- | :--- |
| **Constants Location** | Mixed in `PhysicsConfig` inside `Physics.ts` | Separated into `PhysicsConfig` and `VisualConfig` in `Physics.ts` | Decouples server truth from client lies. |
| **Collision Radius** | Implicitly uses `BODY_RADIUS` (18) | Explicit `PhysicsConfig.COLLISION_RADIUS` (18) | Clarifies intent: Physics != Visuals. |
| **Visual Radius** | Uses `BODY_RADIUS` (18) | `VisualConfig.RENDER_RADIUS` (21) | **Safety Buffer:** Visuals slightly larger than hitbox to prevent "invisible hit" complaints. |
| **Tapering Logic** | Hardcoded in `SnakeRenderer` (Starts at 30%) | Configurable `VisualConfig.TAIL_TAPER_START` (70%) | **Better Feel:** Tapering starts later (last 30%) to keep body mass dominant. |
| **Hitbox Consistency** | Hitbox might shrink if we reused render logic | **Guaranteed Constant:** Hitbox is a uniform tube (18px) | **Fairness:** Tail is visually small but physically standard. No "skinny tail" exploits. |

## 2. Implementation Plan

### Step 1: Update `Physics.ts`
We will replace the existing `PhysicsConfig` with the strictly separated configuration requested.

```typescript
// Proposed Physics.ts
export const PhysicsConfig = {
  // SERVER / PHYSICS (The Truth)
  BASE_SPEED: 220,
  TURN_SPEED: Math.PI * 1.8,
  SEGMENT_DISTANCE: 14,
  COLLISION_RADIUS: 18, // Constant hitbox
  INTERPOLATION_DELAY: 100,
};

export const VisualConfig = {
  // CLIENT / VISUAL (The Lie)
  RENDER_RADIUS: 21, // 1.15x safety buffer over collision
  TAIL_TAPER_START: 0.7, // Taper only last 30%
  TAIL_MIN_SCALE: 0.4,
  GLOW_ALPHA: 0.3,
  SHADOW_ALPHA: 0.4,
};
```

### Step 2: Update `Snake.ts` (Physics Engine)
- Update collision checks to use `PhysicsConfig.COLLISION_RADIUS`.
- Ensure **NO visual constants** (`RENDER_RADIUS`, `TAPER`) are imported or used here.
- The snake is physically a uniform tube of circles.

### Step 3: Update `SnakeRenderer.ts` (Visual Engine)
- Update drawing logic to use `VisualConfig`.
- Implement the new **Taper Logic**:
  - `if (index > total * TAIL_TAPER_START)` -> Apply scale down to `TAIL_MIN_SCALE`.
- Update drawing to use `RENDER_RADIUS` (21px) instead of the old `BODY_RADIUS`.

## 3. Verification
1.  **Physics Check:** Snake still moves/turns identical to before (physics params unchanged).
2.  **Visual Check:** Body looks thicker (21px vs 18px). Tail taper starts much later (looks "beefier").
3.  **Collision Check:** You can visually "graze" objects with the very edge of your skin (the extra 3px buffer) without dying, feeling "fair".

This plan strictly adheres to the **Server-Authoritative Architecture** and the specific refinements requested.
