## Goal
- After you edit username once (e.g. `Player 0xb8cC…` → `Xyz new name`), the site should always show **only the new name**, even after refresh.

## Key Point
- We can’t store a username inside the wallet itself, but we can store it **mapped to the wallet address** (your wallet) in Supabase.

## Implementation Plan
- Add `username` column to `public.users` in Supabase schema.
- Update `/api/user/profile` to read/write `username` from Supabase `users` table (keyed by `wallet_address`).
- Update UI header components to display `username` (never `0x…`) and add a “Edit name” link/button to `/profile`.
- Update leaderboard/lobby to show `username` instead of wallet address.
- Add a local dev fallback (disk) if Supabase env is missing, so it still persists in dev.

## Verification
- Change username → refresh site → header + profile + leaderboard still show the new name.