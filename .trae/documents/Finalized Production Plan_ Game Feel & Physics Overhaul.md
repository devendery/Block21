# 📌 Finalized Single Source of Truth — Game Feel, Physics & AOI Overhaul

This document serves as the absolute reference for the project overhaul. Architecture, constraints, and execution order are now **LOCKED**.

## 🔍 Baseline Analysis Summary
*   **Steering**: Static turn limit causing "stiffness" in large snakes.
*   **Growth**: Linear/sqrt-based growth tied to `score` (needs logarithmic mass model).
*   **Camera**: Zoom driven by length with linear clamping.
*   **AOI**: Death events can be culled at edges due to sequencing issues.
*   **Self-Collision**: Currently disabled, pending physics stabilization.

## 🔒 Non-Negotiable Constraints
1.  **Skins are Immutable**: Existing skins, palettes, and identity must not be altered. Improvements are additive only.
2.  **Core Math is Sacred**: Foundational movement and collision logic will be extended, not rewritten.
3.  **No Feature Subtraction**: Existing mechanics must continue to function.
4.  **Absolute Server Authority**: Server defines mass, radius, position, and collision.

## ✅ Phase-by-Phase Implementation Plan

### **Phase 1: Physics & Control Feel (Server-Authoritative)**
*   **Files**: [Snake.ts](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/Snake.ts), [State.ts](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/State.ts)
*   **Tasks**:
    *   Rename `score` → `mass`.
    *   Implement size-aware turning: `turnSpeed = 0.08 + Math.min(0.04, length * 0.00005)`.
    *   Add sharp-turn mass cost (angular diff > 0.25 rad).
    *   Logarithmic growth: `radius = min(6 + log2(mass + 1) * 1.8, 18)`.

### **Phase 2: Camera & Visual Polish (Client-Side)**
*   **File**: [GameRuntime.ts](file:///Users/ramanrai/Desktop/Deva/Block21/game-client/GameRuntime.ts)
*   **Tasks**:
    *   Mass-based logarithmic camera zoom.
    *   Camera follow smoothing (interpolation ~0.08).
    *   Dynamic visual interpolation scaled with length.
    *   Authoritative radius rendering with subtle tail taper.

### **Phase 3: AOI & Synchronization Integrity**
*   **File**: [index.ts](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/index.ts)
*   **Tasks**:
    *   Fix sequencing: `alive = false` syncs before AOI culling.
    *   Slight AOI expansion for food to prevent pop-in.

### **Phase 4: Self-Collision (Carefully Re-Enabled)**
*   **File**: [Snake.ts](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/Snake.ts)
*   **Tasks**:
    *   Enable for `length >= 12`.
    *   Ignore neck (first 6 segments).
    *   Distance-squared checks only.

## 🧭 Execution Order & Strategic Choice
1.  **Server Physics & Mass Model** (Phase 1) - **WE START HERE**
2.  **Client Camera & Visuals** (Phase 2)
3.  **AOI Sequencing Fixes** (Phase 3)
4.  **Self-Collision Re-enablement** (Phase 4)

I am ready to implement Phase 1. Shall we begin?