# Isolation Test: Separate Client Schema

We will perform the controlled isolation test as requested to prove the root cause is shared schema/duplicate runtime instances.

## 1. Create Client-Only Schema
Create a new file `lib/game/client/ClientState.ts` and paste the provided schema definitions. This file will be used **exclusively** by the client code.

## 2. Update Client Imports
Refactor the following files to import from `./ClientState` instead of the shared `lib/game/schema` or aliases:
- `lib/game/client/MainScene.ts`
- `lib/game/client/SnakeRenderer.ts`

## 3. Hard Reset & Restart
1. Stop the running client.
2. Delete the `.next` cache directory.
3. Restart the client using `npm run dev -- --webpack`.

## 4. Verification
Check the browser console for the "refId not found" error.
- **If GONE**: Confirms duplicate runtime instances issue.
- **If STILL THERE**: Indicates duplicate imports within client code.

I will report the result in the requested strict format.