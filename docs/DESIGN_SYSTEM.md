# B21 Design System

## 1. Color Palette

### Premium Metallic Series
The core of the B21 visual identity relies on rich, natural metallic tones.

- **Gold (Primary)**
  - `gold-100`: `#FFF9C4` (Highlight)
  - `gold-300`: `#FDD835`
  - `gold-500`: `#FFD700` (Base Brand Color)
  - `gold-700`: `#FBC02D`
  - `gold-900`: `#F57F17` (Shadow)

- **Platinum (Secondary/Surface)**
  - `platinum-100`: `#F8F9FA`
  - `platinum-300`: `#E9ECEF`
  - `platinum-500`: `#E5E4E2` (Base)
  - `platinum-700`: `#CED4DA`

- **Silver (Accents)**
  - `silver-100`: `#F5F5F5`
  - `silver-500`: `#C0C0C0` (Base)
  - `silver-700`: `#9E9E9E`

- **Bronze (Tertiary/Warmth)**
  - `bronze-100`: `#EFEBE9`
  - `bronze-500`: `#CD7F32` (Base)
  - `bronze-900`: `#3E2723`

### UI Colors
- **Background**: `#0A0A0A` (Rich Black) to `#1A1A1A` (Charcoal)
- **Surface**: `rgba(255, 255, 255, 0.05)` (Glassmorphism)
- **Success**: `#4CAF50` (Emerald)
- **Error**: `#F44336` (Ruby)

## 2. Typography

### Font Family
- **Primary**: `Usha` (Custom/Premium Sans-Serif)
  - Fallback: `Inter`, `system-ui`, `sans-serif`
- **Headings**: `Usha` (Bold/Black weights)
- **Body**: `Usha` (Regular/Medium weights)

### Hierarchy
- **Display**: `text-6xl` / `font-black` / `tracking-tight`
- **H1**: `text-5xl` / `font-bold`
- **H2**: `text-4xl` / `font-bold`
- **H3**: `text-2xl` / `font-semibold`
- **Body**: `text-base` / `font-normal` / `leading-relaxed`
- **Caption**: `text-sm` / `font-medium` / `uppercase` / `tracking-wider`

## 3. Effects

### Reflections & Shine
- **Mirror Effect**: Linear gradient overlay with high contrast.
  - CSS: `bg-gradient-to-tr from-transparent via-white/20 to-transparent`
- **Metallic Gradient**:
  - Gold: `bg-gradient-to-b from-[#FFD700] via-[#FDB931] to-[#9E7C0C]`

### Shadows
- **Glow**: `drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]`
- **Depth**: `shadow-2xl`

## 4. Components

### Logo
- **B21**: 3D-style metallic finish, bold typography, integrated "21" symbol.
- **BTC**: Consistent style with B21 but using orange/gold gradients.

### Buttons
- **Primary**: Gold gradient background, black text, uppercase, reflective hover.
- **Secondary**: Glass panel, white text, gold border on hover.

