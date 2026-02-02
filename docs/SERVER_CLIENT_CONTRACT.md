# Server ↔ Client Contract (Phase-1 / Phase-2 Lock)

Purpose: Stop networking bugs forever. No guessing. No new events without explicit approval.

## Client → Server

Event: `input`

Payload:
```json
{ "targetAngle": 0, "boost": false }
```

Rules:
- Client sends input only.
- Client never sends positions, collisions, death, or score.

## Server → Client

State shape (authoritative):
```json
{ "players": [], "foods": [], "status": "playing" }
```

Rules:
- Server is authoritative for position, collision, death, and score.
- Client renders/interpolates only.

## Server → Webhook (Lifecycle Only)

Purpose: Persist results, trigger rewards, analytics. Not used for real-time gameplay.

Event: `match_complete` (HTTP POST)

Endpoint (Next.js API): `POST /api/phase1/match/complete`

Security:
- Required header: `x-phase1-secret: <PHASE1_SERVER_SECRET>`

Payload shape (minimal):
```json
{
  "game": "Snake",
  "roomId": "string",
  "startedAt": 0,
  "endedAt": 0,
  "winnerAddress": "0x...",
  "players": [{ "sessionId": "string", "address": "0x...", "score": 0, "alive": true }]
}
```

Rules:
- Webhook is sent only on end-of-match (or other lifecycle events explicitly added later).
- No new webhook events without explicit approval.
