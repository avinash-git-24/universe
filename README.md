# UniVerse

> **Skip the Stairs. Get It Delivered.**

UniVerse is a verified student micro-delivery platform for hostel students. Request snacks or drinks from the vending machine — a verified student picks them up, delivers to your room, and earns a reward.

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10

### Installation

```bash
# Clone the repo
git clone https://github.com/universe-app/universe.git
cd universe

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# → Fill in the required values in .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15+ (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| UI Primitives | Radix UI |
| Animation | Framer Motion |
| Icons | Lucide React |
| Fonts | Plus Jakarta Sans + Inter (via next/font) |
| PWA | Web App Manifest + service worker ready |

---

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

---

## Project Structure

```
src/
├── app/             # Next.js App Router
│   ├── layout.tsx   # Root layout
│   ├── page.tsx     # Root page
│   └── globals.css  # Global styles + CSS tokens
├── components/
│   ├── ui/          # Core UI components (Button, Input, Card, etc.)
│   └── shared/      # Shared app components (Typography, Spinners, etc.)
├── constants/       # Routes, config, animation variants
├── hooks/           # Custom React hooks
├── lib/             # Utilities, fonts, metadata
├── providers/       # React context providers
├── styles/          # Design token definitions
└── types/           # TypeScript type definitions
```

---

## Design System

See [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) for the full token reference.

**Primary:** Emerald Green `#10B981`
**Accent:** Amber Orange `#F59E0B`
**Background:** Warm White `#FAFAF8`
**Text:** Rich Black `#0A0A0A`

---

## Contributing

See [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md).

---

## Version

**v1.0.0** — Foundation release
