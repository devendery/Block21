I will fix the build error by enabling legacy decorators via SWC configuration in `next.config.js` and `tsconfig.json`.

### Implementation Steps
1.  **Install SWC Plugin:**
    *   Run `npm install --save-dev @swc/plugin-legacy-decorators`.

2.  **Update `tsconfig.json`:**
    *   Set `"experimentalDecorators": true`.
    *   Set `"emitDecoratorMetadata": false` (or verify it's not true).

3.  **Update `next.config.js`:**
    *   Add `experimental.swcPlugins` with `["@swc/plugin-legacy-decorators", {}]`.
    *   Preserve the existing `webpack` alias configuration.

4.  **Restart Server:**
    *   Stop Terminal 3.
    *   Run `npm run dev` (without flags).

### Verification
*   Refresh browser.
*   Confirm the build succeeds (no `Unexpected token @`).
*   Confirm the game loads and connects.