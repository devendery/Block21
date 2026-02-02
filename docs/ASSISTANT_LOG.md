# Assistant Logs (Readable Docview)

This file is here so you can read everything in one stable window (no auto-scroll/minimize).

## Servers

### Next.js

Command:

```bash
npm run dev
```

Output:

```text
▲ Next.js 16.1.1 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://0.0.0.0:3000
- Environments: .env.local

✓ Starting...
✓ Ready in 482ms
```

Quick check:

```bash
curl -I http://localhost:3000 | head -n 5
```

```text
HTTP/1.1 200 OK
```

### Phase-1 Colyseus

Command:

```bash
npm run phase1:server
```

Output:

```text
Phase-1 Colyseus server listening on 0.0.0.0:2567
Phase-1 result reporting: WEB_URL=unset PHASE1_SERVER_SECRET=unset
```

Health:

```bash
curl -s http://localhost:2567/health
```

```json
{"ok":true}
```

## Username Persistence

### Profile API test

```bash
curl -s -X POST http://localhost:3000/api/user/profile \
  -H 'Content-Type: application/json' \
  -d '{"address":"0xB8cC00000000000000000000000000000000abcd","data":{"username":"Xyz new name"}}'
```

```json
{"walletAddress":"0xb8cc00000000000000000000000000000000abcd","username":"Xyz new name","avatar":"default","level":1,"xp":0,"highScore":0,"gamesPlayed":0,"totalB21Earned":0,"unlockedSkins":["classic"],"activeSkin":"classic","settings":{"audio":true,"mouseRing":true},"createdAt":1768860174740,"updatedAt":1768860174741}
```

GET after save:

```bash
curl -s 'http://localhost:3000/api/user/profile?address=0xB8cC00000000000000000000000000000000abcd' | jq -r '.username'
```

```text
Xyz new name
```

### Local disk fallback (dev)

When Redis isn’t configured, profiles are persisted to:

- `game-profiles.json`

Example content:

```json
{"0xb8cc00000000000000000000000000000000abcd":{"walletAddress":"0xb8cc00000000000000000000000000000000abcd","username":"Xyz new name","avatar":"default","level":1,"xp":0,"highScore":0,"gamesPlayed":0,"totalB21Earned":0,"unlockedSkins":["classic"],"activeSkin":"classic","settings":{"audio":true,"mouseRing":true},"createdAt":1768860174740,"updatedAt":1768860174741}}
```

## Key Files Changed

- Supabase schema: `supabase/schema.sql`
- Profile API: `app/api/user/profile/route.ts`
- Profile persistence fallback: `lib/gameDb.ts`
- Navbar header username display + profile link: `components/WalletConnect.tsx`
- Leaderboard API uses `users.username`: `app/api/phase1/leaderboard/route.ts`
- Leaderboard UI shows name only: `app/leaderboard/page.tsx`, `components/phase1/LeaderboardPanel.tsx`
- Removed wallet-address display in lobby: `components/game/MultiplayerLobby.tsx`

