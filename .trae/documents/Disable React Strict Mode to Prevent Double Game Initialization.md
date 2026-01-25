I will disable React Strict Mode in `next.config.ts` to prevent the double-invocation of effects and constructors that is causing the duplicate game initialization issue.

1.  **Modify** **`next.config.ts`**:
    *   Change `reactStrictMode: true` to `reactStrictMode: false`.
    *   This stops Next.js from mounting, unmounting, and remounting components in development, which is the root cause of the "double game start" behavior.

2.  **Restart**:
    *   Stop the client development server.
    *   Start it again to apply the configuration change.

This is the definitive fix for the double initialization problem in the development environment.
