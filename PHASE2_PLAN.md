# Phase-2: “Feel, Fairness & Visibility”

Goal: Improve player experience and visibility  
Non-Goal: New mechanics, authority changes, or economy changes

## 1) Phase-2 Entry Criteria (must all be true)

### Architecture
- `phase-1-locked-final` tag exists and is immutable
- No open PRs touching:
  - `game-client/GameRuntime.ts`
  - `components/phase1/snake/SnakeGame.tsx`
  - `SERVER_CLIENT_CONTRACT.md`
  - `GAME_RULES.md`

### Runtime Safety
- Single Phaser instance at all times
- No duplicate Colyseus rooms per client
- Clean teardown verified (join → leave → rejoin works repeatedly)

### Authority
- Server remains authoritative for:
  - Movement
  - Collision
  - Death
  - Score
  - Rewards

### Observability
- `onStats` reliably updates:
  - score
  - rank
  - aliveCount
  - playerCount
- `onGameOver` fires exactly once per match

If any of these fail → Phase-2 is blocked.

## 2) Phase-2 Allowed Changes (explicit)

Only the following are allowed in Phase-2.

### Feel & UX (client-side only)
- Adjust interpolation constants within documented bounds
- Camera smoothing polish (numbers only, no logic change)
- HUD polish (animations, clarity, timing)
- Input responsiveness tuning (mouse throttle ±10ms)

Any value change must be documented in `GAME_RULES.md`.

### Visibility
- Leaderboard UI
- Match summary screen
- Personal stats history (read-only)

### Rewards (display + persistence only)
- Show rewards
- Persist rewards
- Never compute rewards client-side

## 3) Phase-2 No-Go List (non-negotiable)

Any PR touching these is rejected.

### Gameplay & Authority
- Client-side prediction
- Client collision detection
- Client death logic
- Client score calculation
- Client reward calculation

### Architecture
- React imports in `GameRuntime.ts`
- Phaser imports in React
- Colyseus usage in React
- New runtime entry points

### Economy
- Client-side pot calculation
- Client reward multipliers
- Trusting wallet balance from client only

### Networking
- New socket events without updating `SERVER_CLIENT_CONTRACT.md`
- Webhooks used for real-time data

## 4) Safe Rewards Design (Phase-2 compliant)

Server-side only.

Rewards are calculated on server and persisted via webhook.

### Flow
1. Match ends
2. Server computes:
   - score
   - rank
   - reward
3. Server POSTs to:
   - `POST /api/phase1/match/complete`
4. Backend:
   - Stores result
   - Updates leaderboard
   - Triggers rewards (on-chain or off-chain)
5. Client:
   - Receives final rank + reward amount
   - Displays only
   - Never recalculates

## 5) Safe Leaderboard Design

### Data source
- Backend DB only
- Never client-computed

### Tables (example)
- matches
- players
- scores
- rewards

### Leaderboard types
- Daily
- Weekly
- All-time

### API (read-only)
- `GET /api/phase1/leaderboard`

Client:
- Fetches
- Displays
- Caches

## 6) Phase-2 Exit Criteria

Phase-2 is complete when:
- No runtime instability under 20+ players
- Leaderboard shows consistent rankings
- Rewards match server logs
- No authority violations detected
- Docs updated with all tuned constants

Only after this can Phase-3 begin.

## Owner Notes

Phase-2 is where most projects accidentally die because:
“It’s just a small improvement…”

Discipline rules:
- If a change affects feel → Phase-2
- If a change affects authority → reject
- If a change affects economy → server only
- If a change affects architecture → new phase

