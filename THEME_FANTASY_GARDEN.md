# Fantasy Garden — Theme Pack (Launch)

This theme is **mobile-first** and built around the rule:
- Background = muted
- Snakes = saturated
- Food / powerups = bright + readable fast
- UI = neutral + minimal

## Locked Color Palette

**Background**
- Garden Dark: `#1E2A22`
- Garden Mid: `#2C3F34`
- Garden Light: `#3E5A4A`

**Snakes (examples)**
- Leaf Green: `#3AFF9E`
- Sky Blue: `#4FC3F7`
- Royal Purple: `#9C6BFF`
- Sun Orange: `#FFA94D`

**Food / Powerups**
- Food Glow: `#FFE066`
- Rare Food: `#FF6B6B`
- Power Orb: `#5EEAD4`

**UI**
- UI Dark: `#0F172A`
- UI Panel: `#1E293B`
- UI Text: `#E5E7EB`
- UI Accent: `#22C55E`

## Golden Rules (Non‑Negotiable)
- No bright background.
- No low-contrast snakes.
- No heavy textures or animated tiles.
- No shader dependency for core visuals.
- Keep particles minimal and readable.
- Theme must not compete with gameplay.

## Food Visual Spec
- Shape: simple orb (size > detail).
- Animation:
  - Gentle pulse (scale ~1.00 → 1.08)
  - Gentle float (±2px)
- Readability target: recognizable in ~0.2s at speed.

## Snake Skin Spec (Procedural)
- Skin is data (base, accent, glow strength, pattern), not a stretched PNG.
- Lighting and glow strength must be consistent across skins.

### Default Skin Set (Theme-bound)
These are the display names for the currently shipped skin IDs:
- `classic` → Leaf Runner
- `neon` → Sky Glide
- `magma` → Sunvine
- `toxic` → Bloom Serpent
- `void` → Night Root
- `scales` → Garden Scales
- `custom` → Custom

## UI Style Rules
- Flat UI, rounded corners, max 2–3 colors.
- Soft shadow only; avoid blur-heavy effects on mobile.
- HUD must stay out of the snake’s path and auto-hide where possible.

## Build Order
1. Background palette + calm world
2. Food visuals + readability
3. Default snake skin + camera smoothing
4. Powerup overlays
5. UI polish (minimal, theme-consistent)

