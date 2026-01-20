## What “Properly Started” Means
- You have 2 processes: Next.js on :3000 and the Phase‑1 Colyseus server on :2567.
- “Missing SUPABASE_URL…” is not a server-start issue; it only means Supabase env isn’t configured (DB viewer won’t load real data).

## Quick Diagnosis Checks
- Confirm Next is reachable: open http://localhost:3000
- Confirm Colyseus is reachable: open http://localhost:2567/health and expect `{ "ok": true }`.
- If the game is stuck “Connecting…”, check the WS URL:
  - Client uses `NEXT_PUBLIC_COLYSEUS_URL` or defaults to `ws://localhost:2567`.
  - If you’re opening the site from another device or via a non-local hostname, `localhost` will fail—set `NEXT_PUBLIC_COLYSEUS_URL=ws://<your-machine-ip>:2567`.

## Planned Fixes (Code)
- Add clearer runtime logging to the Phase‑1 server:
  - Log `listening` host/port, handle `server.on("error")`, and log `unhandledRejection/uncaughtException`.
- Add a `/api/phase1/server-health` proxy endpoint in Next that checks the Colyseus health URL server-side.
- Show a “Server: Online/Offline” badge on `/play` using the proxy endpoint (so users immediately know if :2567 is reachable).
- If necessary, make the Colyseus port/host explicit and align it with `NEXT_PUBLIC_COLYSEUS_URL`.

## Planned Fixes (Config)
- Ensure `.env.local` supports both local and LAN usage:
  - `NEXT_PUBLIC_COLYSEUS_URL=ws://localhost:2567` (local)
  - `PHASE1_SERVER_PORT=2567` (optional)
  - `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (only needed for DB viewer)

## Verification
- Load `/play` and verify:
  - Health badge shows “Online”.
  - WS connects and snakes render.
- Hit `/api/phase1/server-health` and ensure it returns OK when :2567 is up.
- Confirm both processes keep running without immediate exit.

If you confirm, I’ll implement the logging + health-probe UI so you can see exactly what’s failing when it “doesn’t start properly.”