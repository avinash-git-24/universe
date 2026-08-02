# UniVerse — Design System

## Fonts

| Role | Family | Weights |
|---|---|---|
| Headings / Brand | Plus Jakarta Sans | 400, 500, 600, 700, 800 |
| Body / UI | Inter | 400, 500, 600 |

---

## Color Tokens

### Semantic Tokens

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#FAFAF8` | Page background (Warm White) |
| `--color-bg-subtle` | `#F5F5F4` | Subtle section tints |
| `--color-surface` | `#FFFFFF` | Card / component surface |
| `--color-primary` | `#10B981` | Emerald Green — primary CTA |
| `--color-primary-hover` | `#059669` | Button hover |
| `--color-accent` | `#F59E0B` | Amber Orange — accents |
| `--color-text` | `#0A0A0A` | Rich Black — primary text |
| `--color-text-muted` | `#6B7280` | Secondary / helper text |
| `--color-border` | `#E5E7EB` | Light Gray — borders |
| `--color-success` | `#22C55E` | Success feedback |
| `--color-error` | `#F87171` | Soft Coral — errors |

---

## Typography Scale

| Name | Size | Usage |
|---|---|---|
| `h1` | 3rem (48px) | Hero/display headings |
| `h2` | 2.25rem (36px) | Section headings |
| `h3` | 1.875rem (30px) | Subsection headings |
| `h4` | 1.5rem (24px) | Card titles |
| `h5` | 1.25rem (20px) | Minor headings |
| `h6` | 1.125rem (18px) | Smallest heading |
| `lead` | 1.25rem (20px) | Intro paragraphs |
| `body` | 1rem (16px) | Default body text |
| `body-sm` | 0.875rem (14px) | Compact body |
| `caption` | 0.75rem (12px) | Timestamps, labels |

---

## Spacing Scale (Base-4)

`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96 / 128 px`

---

## Border Radius

| Name | Value | Usage |
|---|---|---|
| `xs` | 4px | Micro elements |
| `sm` | 6px | Small badges, chips |
| `md` | 10px | Buttons, inputs |
| `lg` | 16px | Cards |
| `xl` | 24px | Modals, large cards |
| `2xl` | 32px | Containers |
| `full` | 9999px | Pills, avatars |

---

## Shadows

| Name | Usage |
|---|---|
| `xs` | Flat surfaces, inactive states |
| `sm` | Default cards, buttons |
| `md` | Elevated cards |
| `lg` | Dropdowns, popovers |
| `xl` | Sticky headers |
| `2xl` | Modals, dialogs |
| `glow-primary` | Focus rings, active state |
| `glow-accent` | Accent highlights |

---

## Component Inventory

| Component | Location | Variants |
|---|---|---|
| `Button` | `ui/button` | primary, accent, secondary, ghost, destructive, link |
| `Input` | `ui/input` | default, error, success |
| `Card` | `ui/card` | default, elevated, interactive, glass, accent, error, success, ghost |
| `Badge` | `ui/badge` | primary, accent, success, error, warning, neutral, solid |
| `StatusBadge` | `ui/badge` | pending, accepted, purchasing, in-transit, delivered, cancelled, failed |
| `Avatar` | `ui/avatar` | xs, sm, md, lg, xl, 2xl |
| `AvatarGroup` | `ui/avatar` | — |
| `Modal` | `ui/modal` | sm, md, lg, xl, full |
| `Heading` | `shared/Typography` | h1–h6 |
| `Text` | `shared/Typography` | body, body-sm, caption, label, overline, muted, lead |
| `LoadingSpinner` | `shared/LoadingSpinner` | xs–xl, primary/accent/muted/white |
| `PageLoader` | `shared/LoadingSpinner` | — |
| `AnimatedWrapper` | `shared/AnimatedWrapper` | fadeIn, fadeInUp, slideIn*, scaleIn, stagger* |
| `StaggerGroup` | `shared/AnimatedWrapper` | — |

---

## Animation Variants

Defined in `src/constants/animation.ts`:

- `fadeIn` / `fadeInUp` / `fadeInDown`
- `scaleIn` / `scaleInCenter`
- `slideInLeft` / `slideInRight`
- `overlayVariants` / `modalVariants` / `drawerVariants`
- `staggerContainer` / `staggerItem`
- `cardHover` / `buttonTap` / `pulseDot`
- `pageVariants`
