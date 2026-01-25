I will investigate the server-side state mutation logic to identify where `MapSchema` or objects might be replaced incorrectly.

### Analysis
The user points out "Replacing a Map / Array instead of mutating it" as a fatal error.
In `server/src/State.ts`, we initialize:
```typescript
@type({ map: Player }) players = new MapSchema<Player>();
```
In `server/src/index.ts` (Room), we do:
```typescript
this.setState(new GameState());
```
And then:
```typescript
this.state.players.set(client.sessionId, player); // Adding new player
this.state.players.delete(client.sessionId); // Removing player
```
These look correct (mutation, not replacement).

However, I should check if I ever do `this.state.players = ...`.
I'll search the codebase for assignments to `.players` or `.food`.

Also, "Mutating state BEFORE snapshot is fully acknowledged".
We added `setTimeout(..., 0)` in `onCreate`.
Is there any other mutation?
`onJoin` happens when a client joins.
If `onJoin` mutates state (adds player), and the client is just joining...
When client joins, they get the *current* state.
If `onJoin` adds a player immediately, that player is part of the initial state for *that* client? Or a patch?
Colyseus sends the full state as of the tick the client joins.
So `onJoin` mutations are safe *for that client*?
Wait, if `onJoin` happens, `this.state.players.set(...)` happens.
If `onJoin` runs *before* the client has fully established the room connection on their side?
No, `onJoin` is server-side.

**Potential Issue:**
In `killSnake`:
```typescript
this.state.food.set(id, food); // Mutation
```
Is `killSnake` called in a way that replaces something?
No.

**Let's check `snake.player.segments` usage.**
In `Snake.ts` (logic):
```typescript
this.player.segments.push(seg);
```
`segments` is an `ArraySchema`. `push` is a mutation. That's fine.
But wait, `SnakeLogic` constructor takes `player: Player`.
And `SnakeLogic` is created in `onJoin`.
Does `SnakeLogic` replace `this.player.segments`?
No, it does `this.player.segments.push(...)`.

**What about `updateSegments` in `Snake.ts`?**
It modifies properties of segments: `segment.x = ...`. Safe.

**Hypothesis from User:** "Replacing a Map / Array instead of mutating it".
I will grep for assignments to `players` or `food`.

**Plan:**
1.  Search for `= new MapSchema` or `= new ArraySchema` or `= ...` (assignments) in `server/src`.
2.  Verify `State.ts` initialization.
3.  Verify `onJoin` logic.

**Wait!**
In `server/src/index.ts`, `onCreate`:
```typescript
this.setState(new GameState());
```
This REPLACES the root state. This is correct in `onCreate`.
But if `onCreate` is called... only once.

**User says:** "Even with delays, one mutation still leaks too early."
Maybe `spawnFood` loop in `onCreate` (inside timeout)?
That's fine.

**Maybe the issue is in `SnakeLogic`?**
Let's read `server/src/Snake.ts` again carefully.
Does it do `this.player = ...`? No.
Does it do `this.player.segments = ...`?

**Let's Grep.**