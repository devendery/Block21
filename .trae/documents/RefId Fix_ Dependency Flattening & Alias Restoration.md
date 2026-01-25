# Phase 2: RefId Fix - Forced Deduping

The "RefId not found" error persists, and my investigation shows that while both `colyseus.js` and `colyseus` depend on `@colyseus/schema` `^3.0.0`, Webpack is still bundling multiple copies or resolving to different instances.

This is the **classic "multiple registry" problem** in Colyseus + Webpack.

## The Root Cause
1.  `colyseus.js` (client lib) imports `@colyseus/schema`.
2.  Our `ClientState.ts` imports `@colyseus/schema`.
3.  Webpack sees these as potentially different modules, especially if symlinks, hoisting, or version ranges slightly differ (even if both are ^3.0.0).

## The Fix: Force Resolution to a Single Instance

We must modify `next.config.js` to **force** all imports of `@colyseus/schema` to resolve to the exact same physical path on disk. This was what the alias *tried* to do, but it may have been pointing to the wrong one.

### Plan

1.  **Identify the "Correct" Schema Path**: We need the one that `colyseus.js` is using. Since `colyseus.js` is in `node_modules`, it likely uses the hoisted `@colyseus/schema` in `node_modules/@colyseus/schema`.
2.  **Update `next.config.js`**: Re-enable the alias but make it absolute and explicit.
3.  **Deduplicate Dependencies**: Ensure `package.json` explicitly lists `@colyseus/schema` as a dependency to force a top-level install.

### Steps

1.  **Add `@colyseus/schema` to `package.json`**: Explicitly add it to `dependencies` with the same version (`^3.0.0`) to ensure it's hoisted to the top level.
2.  **Update `next.config.js`**: Uncomment the alias and ensure it points to `path.resolve(__dirname, 'node_modules/@colyseus/schema')`.
3.  **Reinstall**: Run `npm install` to flatten dependencies.
4.  **Restart**: Run `npm run dev -- --webpack`.

This "force flat" approach is the standard solution for React/Colyseus singleton issues.
