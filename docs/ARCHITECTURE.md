# UniVerse — Architecture

## Overview

UniVerse uses a **clean, layered architecture** built on Next.js App Router. Each layer has a single responsibility and clear boundaries.

---

## Layer Diagram

```
┌─────────────────────────────────────────────────────┐
│                    PRESENTATION                       │
│          (pages / layouts / route groups)             │
│              src/app/**/*.tsx                         │
├─────────────────────────────────────────────────────┤
│                    COMPONENTS                         │
│         UI primitives + shared components             │
│      src/components/ui/  src/components/shared/       │
├─────────────────────────────────────────────────────┤
│              HOOKS / STATE / PROVIDERS                │
│     src/hooks/  src/providers/  (future: stores)      │
├─────────────────────────────────────────────────────┤
│               BUSINESS LOGIC / LIB                    │
│          src/lib/  src/constants/  src/types/         │
├─────────────────────────────────────────────────────┤
│                  DATA / API LAYER                     │
│           src/app/api/**  (Route Handlers)            │
│          Future: services/, repositories/             │
└─────────────────────────────────────────────────────┘
```

---

## Directory Reference

| Directory | Purpose |
|---|---|
| `src/app/` | Next.js App Router — pages, layouts, route handlers |
| `src/components/ui/` | Low-level UI primitives (Button, Input, Card…) |
| `src/components/shared/` | Composed app-level components (Typography, Spinner…) |
| `src/hooks/` | Reusable React hooks |
| `src/lib/` | Pure utilities — formatters, validators, helpers |
| `src/providers/` | React context and global state providers |
| `src/styles/` | Typed design token exports |
| `src/types/` | Global TypeScript type definitions |
| `src/constants/` | Static config, routes, animation variants |
| `public/` | Static assets — icons, manifest, robots.txt |
| `docs/` | Project documentation |

---

## Routing Convention

```
src/app/
├── (auth)/            # Route group — unauthenticated pages
│   ├── login/
│   └── register/
├── (app)/             # Route group — authenticated pages
│   ├── requests/
│   └── deliver/
└── api/               # Route handlers
    └── v1/
```

---

## Data Flow

```
User Action
    ↓
Component (UI)
    ↓
Hook / Context
    ↓
API Route Handler (Next.js)
    ↓
Service Layer (business logic)
    ↓
Database (via ORM / query layer)
```

---

## Key Principles

1. **No business logic in components** — components render, hooks and services handle logic
2. **Single source of truth** — all constants, routes, and tokens in `src/constants/` and `src/styles/`
3. **Type everything** — no `any`, strict mode enabled
4. **Composable components** — small, focused, reusable
5. **PWA-first** — offline-capable, installable, fast

---

## Backend Placeholder

The API layer lives at `src/app/api/`. Planned structure:

```
src/app/api/v1/
├── requests/
│   ├── route.ts           # GET (list) + POST (create)
│   └── [id]/route.ts      # GET, PATCH, DELETE
├── deliver/
│   └── route.ts           # GET available requests
├── users/
│   └── [id]/route.ts
└── auth/
    ├── login/route.ts
    └── register/route.ts
```

Database: PostgreSQL (via Prisma or Drizzle ORM — TBD).
