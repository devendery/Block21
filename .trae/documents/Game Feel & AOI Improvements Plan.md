## Implement Game Feel, Physics, and AOI Improvements (Corrected & Final)

This phase focuses on a **server-authoritative**, **multiplayer-safe**, and **visually polished** implementation of game feel, physics, and AOI improvements.

### 1. Physics & Steering Enhancements (Server-side)
- **Responsive Rotation**: In [Snake.ts](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/Snake.ts), implement size-aware turning:
    - Big snakes rotate faster to feel powerful, while forward velocity remains unchanged.
    - Use a dynamic `turnSpeed = 0.08 + Math.min(0.04, length * 0.00005)`.
- **Sharp Turn Mass Cost**: Penalize sharp turns to punish zig-zag abuse and reward smooth movement.
    - In [Snake.ts](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/Snake.ts), if the turn angle exceeds 0.25 rad, consume mass proportional to the turn intensity.

### 2. Mass -> Thickness Growth (Authoritative)
- **Logarithmic Growth**: Implement a logarithmic model for thickness in [Snake.ts](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/Snake.ts):
    - `radius = Math.min(6 + Math.log2(mass + 1) * 1.8, 18)`.
    - This ensures early growth is rewarding but late growth slows down naturally.
- **Client Rendering**: Update [GameRuntime.ts](file:///Users/ramanrai/Desktop/Deva/Block21/game-client/GameRuntime.ts) to use the server-authoritative radius for rendering, including a slight taper for the tail.

### 3. Self-Collision (Re-enabled Safely)
- **Safe Rules**: Re-enable self-collision in [Snake.ts](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/Snake.ts) with strict rules:
    - Disabled for small snakes (length < 12).
    - Ignore the first 6 segments (neck).
    - Use distance-squared checks for performance.

### 4. Camera & Rendering Polish (Client-side)
- **Mass-based Camera Zoom**: drove camera zoom by **mass**, not length, in [GameRuntime.ts](file:///Users/ramanrai/Desktop/Deva/Block21/game-client/GameRuntime.ts).
- **Camera Follow Smoothing**: Implement `camera.scrollX/Y` interpolation to remove jitter.
- **Dynamic Interpolation**: Scale the visual interpolation factor `t` with snake length to keep turns looking intentional and tight.

### 5. AOI & Synchronization Fixes (Server-side)
- **Death State Sync**: In [index.ts](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/index.ts), ensure `alive = false` is synchronized to all clients *before* AOI filtering takes effect to prevent "ghost" bodies.
- **Food AOI Buffering**: Expand AOI slightly for food and ensure food dropped on death is immediately visible.

### 6. Technical Integrity
- **Filtering**: Use `StateView` for collection-level filtering in [index.ts](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/index.ts) as the most stable approach for Colyseus 0.16.5.
- **Renaming**: Rename `score` to `mass` in [State.ts](file:///Users/ramanrai/Desktop/Deva/Block21/server/src/State.ts) for architectural clarity.

I will now proceed with these changes as they are now fully vetted.