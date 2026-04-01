# Design System: Atmospheric Precision

## Core Principles
- **Depth & Atmosphere**: Use glass panels, blurs, and gradients to create a sense of three-dimensional space.
- **Precision**: Clean typography, consistent spacing, and subtle interactive states.
- **No-Line Rule**: Avoid solid borders; use gradients, shadows, and "ghost borders" (10% opacity) instead.

## Color Palette
- **Background**: `#150330` (Deep Space)
- **Primary**: `#ff6a9f` (Electric Pink)
- **Primary Container**: `#ffade6` (Lavender/Soft Pink)
- **Secondary**: `#5bd5fc` (Cyan)
- **Surface Containers**:
  - Lowest: `#0a0218` (Inputs)
  - Low: `#1e0445`
  - Medium: `#2a0660`
  - High: `#35087a`

## Typography
- **Headings**: Space Grotesk (Display-lg, Display-sm)
- **Body**: Inter (Body-lg, Body-md, Label-md)

## UI Components
- **Glass Panel**: `bg-white/40`, `backdrop-blur-32px`, `border-white/10`. Hover: `border-white/30`.
- **Buttons**:
  - Primary: Gradient from Primary to Primary-Container, rounded-full.
  - Secondary (Glass): Glass panel with ghost border.
  - Tertiary: Text only with glow effect on hover.
- **Inputs**: Visualized as a "well" (Surface-container-lowest) with inner secondary glow on focus.

## Motion
- **Gradient Flow**: Slow, seamless animated background gradients using @keyframes.
- **Soft Hover**: Soft scaling and glow transitions.
