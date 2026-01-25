I will fix the HMR schema duplication crash by isolating the Phaser/Colyseus logic into a dynamically imported component.

### Implementation Steps
1.  **Create `components/game/PhaserGameInner.tsx`:**
    *   Move the current content of `components/game/PhaserGame.tsx` into this new file.
    *   This component will contain the actual Phaser game initialization logic.

2.  **Update `components/game/PhaserGame.tsx`:**
    *   Replace its content with a dynamic import wrapper.
    *   Use `next/dynamic` with `{ ssr: false }`.
    *   This prevents Next.js Fast Refresh from aggressively re-evaluating the schema module during minor edits, and ensures it runs client-side only.

3.  **Restart Client:**
    *   Restart the Next.js dev server (Terminal 3) to apply the component structure changes cleanly.

### Rationale
Next.js HMR re-runs module evaluation. Colyseus Schema uses a global registry and throws an error if a class is registered twice. By isolating the game component, we reduce the frequency of HMR triggers and ensure better encapsulation.

### Verification
*   Refresh browser.
*   Confirm the "Duplicate 'undefined' definition" error is gone.
*   Confirm game loads and plays.