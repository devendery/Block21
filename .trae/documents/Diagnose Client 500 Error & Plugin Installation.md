I will investigate the "Internal Server Error" on `localhost:3000` by examining the Next.js server logs.

### Analysis
The user reports a 500 error on all pages. This confirms the issue is within the Next.js application (Client), not the Colyseus server.
Since we just enabled SWC plugins and legacy decorators, it's highly likely that:
1.  The SWC plugin crashed the build/runtime.
2.  The `next.config.js` has a syntax error or misconfiguration.
3.  The `tsconfig.json` changes conflict with something.

### Steps
1.  **Check Client Logs (Terminal 3):** Use `CheckCommandStatus` to see the *actual* error stack trace causing the 500.
2.  **Verify `next.config.js`:** Ensure the SWC plugin syntax is correct.
3.  **Verify `package.json`:** Ensure `@swc/plugin-legacy-decorators` is actually installed. (I ran the install command, but did it succeed? The log showed 404/auth error in one attempt, maybe it failed?).
    *   *Wait:* I saw `npm error 404` for `@swc/plugin-legacy-decorators`.
    *   **CRITICAL:** If the plugin failed to install, `next.config.js` referencing it will crash the server on startup or request.

### Action
1.  Check logs to confirm "module not found" or similar error.
2.  Re-try installing the plugin (check spelling, maybe it's `@swc/core` dependency issue?).
3.  Actually, the package name is `@swc/plugin-legacy-decorators`. Is that correct?
    *   Let me search for the correct package name.
    *   Actually, Next.js documentation mentions `experimental.swcPlugins`.
    *   The user provided the name.
    *   But my previous install failed with `404`.

**Hypothesis:** The plugin is missing because `npm install` failed. I need to fix the installation.

**Plan:**
1.  Check logs.
2.  Verify package installation.
3.  If missing, install it properly.
4.  If it doesn't exist on npm (404), find the correct one or use a different approach (babel?). Next.js 13+ usually recommends `experimentalDecorators: true` in tsconfig, but the user insists on the SWC plugin.
    *   Actually, `experimentalDecorators` in `tsconfig` should be enough if using `tsc`, but Next uses SWC.
    *   Maybe the package name is wrong? `npm search @swc/plugin-legacy-decorators`.

Let's look at the logs first.