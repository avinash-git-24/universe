# 🏛️ UniVerse Architecture Specification

This document provides a comprehensive overview of the system architecture, component organization, data flow, real-time layers, and security mechanisms powering **UniVerse**.

---

## 1. High-Level Architecture

UniVerse follows a modern **Jamstack / Serverless SaaS Architecture**:

```
[ Client Browser ]
      │
      ├── Next.js 16 (App Router / Turbopack / Tailwind CSS v4)
      │      ├── Server Components (Server Data Fetching & SSR)
      │      └── Client Components (Interactive Views & React State)
      │
      ├── Security & Resilience Layer (Error Boundaries, Input Sanitization, Retry Engine)
      │
      └── Supabase Cloud (PostgreSQL + Realtime Subscriptions + Storage)
             ├── Database Tables (profiles, delivery_requests, delivery_assignments, notifications, messages)
             ├── Row Level Security (RLS Policies)
             └── Realtime WebSocket Broadcast Channels
```

---

## 2. Component & Directory Architecture

```
src/
├── app/                    # Next.js App Router endpoints & page layouts
│   ├── (auth)/             # Auth pages (login, register, reset-password)
│   ├── admin/              # Admin control panel & analytics dashboard
│   ├── dashboard/          # Student & Runner dashboard views
│   └── api/                # API routes
├── components/             # Reusable UI component modules
│   ├── admin/              # Admin users & delivery management tables
│   ├── analytics/          # Analytics UI, charts, date filters & export toolbar
│   ├── chat/               # In-app peer-to-peer chat interface
│   ├── notifications/      # Realtime notification drawer & bell badge
│   ├── request/            # Delivery request cards, status badges & timelines
│   ├── shared/             # ErrorState, EmptyState, SkeletonLoaders, ErrorBoundary
│   └── ui/                 # Radix UI primitives & design tokens
├── lib/
│   ├── database/           # Supabase data access layer (analytics, requests, admin)
│   ├── security/           # Defensive security module (url, validation, env, error)
│   └── utils/              # Export engines, date formatters & async retry helpers
├── providers/              # RealtimeProvider (Supabase realtime, presence, unread counters)
└── types/                  # Database types, request enums, and analytics interfaces
```

---

## 3. Core Subsystems

### A. Delivery Request Status Machine
Every delivery request progresses through 6 deterministic states:
`Pending` ➔ `Accepted` ➔ `Picked Up` ➔ `In Transit` ➔ `Delivered` (or `Cancelled`).
- State transitions update both `delivery_requests` and `delivery_assignments` database records.

### B. Realtime Subscriptions & Presence
- **`RealtimeProvider`**: Subscribes to PostgreSQL database row changes on `notifications`, `delivery_requests`, and `messages`.
- **Presence Channel**: Tracks active online user presence for real-time status dots in chat.

### C. Analytics Engine & Export Subsystem
- **`src/lib/database/analytics.ts`**: Computes summary statistics, KPI ratios (Delivery Success Rate %, Cancellation Rate %, Active Deliveries), 30-day trend time series, runner performance rankings, and student requester rankings.
- **`src/lib/utils/export.ts`**: Converts `FullAdminAnalytics` into structured CSV reports and formatted JSON payloads.
- **`AnalyticsFilterBar`**: Provides instant client/server filtering across quick date range presets (`7d`, `30d`, `this_month`, `last_month`, `all_time`) and custom date ranges.

---

## 4. Security & Hardening Model

1. **Input Validation**: `sanitizeString` trims and bounds string lengths. `parseSafeNumber` protects against `NaN` injection.
2. **Open Redirect Defense**: `isSafeRedirectUrl` checks that redirect destinations start with `/` and reject `//` or script protocols.
3. **Error Sanitization**: `sanitizeErrorForProduction` hides internal stack traces in production builds.
4. **Error Boundary**: `<ErrorBoundary />` catches uncaught React exceptions and presents structured recovery options.
