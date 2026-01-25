# Phase 2: RefId Fix - Isolating Client Schema

The `refId not found` error persists because `_colyseus_schema__WEBPACK_IMPORTED_MODULE_0__` indicates that `@colyseus/schema` is still being bundled/imported in a way that creates multiple registries, despite our isolation test.

The issue likely stems from:
1.  **Duplicate Package Versions**: `colyseus.js` (client) depends on `@colyseus/schema`. `colyseus` (server) also depends on it. If versions mismatch or are hoisted incorrectly, Webpack bundles two copies.
2.  **Explicit Webpack Alias**: Our `next.config.js` forces an alias to `node_modules/@colyseus/schema`. This might be pointing to the *server's* version or a hoisted version that conflicts with `colyseus.js`'s internal dependency.

## 1. Verify Dependencies
I will check the installed versions of `colyseus.js` and `@colyseus/schema` to ensure compatibility.
- `colyseus.js`: `^0.16.22`
- `colyseus`: `^0.16.5`

These should use compatible schema versions.

## 2. Refine Webpack Config
The current alias in `next.config.js` might be the culprit if it forces a specific resolution that conflicts with `colyseus.js`'s internal resolution.
- **Action**: Comment out the Webpack alias in `next.config.js`. Let standard node module resolution handle it.

## 3. Strict Client-Side Import
We already have `ClientState.ts`. We must ensure it's **strictly** using the schema class provided by `colyseus.js` (if exposed) or ensuring the `@colyseus/schema` import resolves to the *exact same instance* that `colyseus.js` uses.
- Actually, `colyseus.js` does NOT export `Schema`. We must import from `@colyseus/schema`.
- The key is ensuring ONLY ONE copy of `@colyseus/schema` exists in the client bundle.

## 4. Plan Execution
1.  **Modify `next.config.js`**: Remove/comment out the `@colyseus/schema` alias. This alias is often a fix for *server-side* builds or monorepos, but here it might be causing the "double include" by fighting against Webpack's default resolution for the client bundle.
2.  **Hard Reset**: Delete `.next` and `node_modules/.cache`.
3.  **Restart**: Run `npm run dev -- --webpack` again.

This is the most likely cause of "RefId not found" when the code itself is correct (which we proved with the isolation test).
