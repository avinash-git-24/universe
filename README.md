# 🌌 UniVerse — On-Campus Peer-to-Peer Delivery Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.2.12-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database_%26_Auth-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Unit_%26_Component_Tests-6E9F18?style=flat-square&logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.style=flat-square)](LICENSE)

**UniVerse** is a modern, high-performance, full-stack peer-to-peer campus delivery platform connecting college students with student runners for instant campus deliveries. Designed with production SaaS aesthetics, real-time messaging, comprehensive analytics, and enterprise resilience.

---

## 🚀 Key Features

### 🎓 Student Experience
- **Request Creation**: Create delivery requests with item lists, quantities, price estimates, and pickup/drop-off locations.
- **Request Management**: Track request statuses in real-time (`Pending`, `Accepted`, `Picked Up`, `In Transit`, `Delivered`, `Cancelled`).
- **Interactive Details Modal**: Deep-dive into item specifications, runner details, and timelines.

### 🏃 Runner Experience
- **Available Requests Board**: Browse live unassigned delivery requests across campus.
- **Delivery Lifecycle Management**: Accept requests, update statuses sequentially, and manage active deliveries.
- **Runner Delivery History**: Track past completed deliveries and performance metrics.

### 🛡️ Admin Management Panel
- **User Management**: View, filter, search, and manage platform roles (`Student`, `Runner`, `Admin`) and account statuses (`Active`, `Suspended`).
- **Delivery Control**: Complete platform delivery overview with search, status filters, sorting, and manual runner assignments.
- **Comprehensive Analytics Engine**: Real-time KPI cards, success rate calculations, cancellation rates, and 30-day time-series trend data.
- **Export & Reporting System**: Download analytics data dynamically in formatted CSV reports and structured JSON payloads.
- **Multi-Range Date Filters**: Quick date range presets (`Today`, `Last 7 Days`, `Last 30 Days`, `This Month`, `Last Month`, `All Time`) and custom date pickers.

### 💬 Realtime Chat & Notifications
- **Direct Messaging**: In-app peer-to-peer chat between requesters and assigned runners.
- **Realtime Notifications**: Unread count badges, category filtering (`Delivery`, `Request`, `Runner`, `System`, `Admin`), and instant status change alerts.

### 🛡️ Security & Reliability
- **Enterprise Resilience**: Global React Error Boundaries, exponential backoff retry helpers (`retryAsync`), and crash-safe promise wrappers.
- **Network Awareness**: Reactive online/offline status detection (`useOnlineStatus`) with non-intrusive notification banners.
- **Security Hardening**: Open-redirect protection (`isSafeRedirectUrl`), string/numeric input validation, and production error sanitization.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4, Vanilla CSS Design System |
| **UI Components** | Radix UI Primitives, Lucide Icons, Framer Motion |
| **Backend & Auth** | Supabase (PostgreSQL, Realtime Subscriptions, Row Level Security) |
| **Testing** | Vitest, React Testing Library, jsdom, `@testing-library/jest-dom` |
| **State & Data** | React Hooks, Context API, `useMemo` calculation engine |

---

## 📂 Project Structure

```
universe/
├── src/
│   ├── app/                    # Next.js App Router routes & pages
│   │   ├── (auth)/             # Authentication routes (login, register, reset-password)
│   │   ├── admin/              # Admin control panel & analytics
│   │   ├── dashboard/          # Student & Runner dashboard views
│   │   └── api/                # API route handlers
│   ├── components/             # Reusable UI component modules
│   │   ├── admin/              # Admin dashboard components & tables
│   │   ├── analytics/          # Analytics engine UI, charts & export toolbar
│   │   ├── chat/               # Realtime chat list & message window
│   │   ├── dashboard/          # Common dashboard cards & stats
│   │   ├── home/               # Landing page & navigation
│   │   ├── notifications/      # Notification bell & drawer list
│   │   ├── request/            # Request list, cards, status badges & timelines
│   │   ├── shared/             # ErrorState, EmptyState, SkeletonLoaders, ErrorBoundary
│   │   └── ui/                 # Radix UI primitives & design system components
│   ├── constants/              # Navigation routes, status tokens, and animation variants
│   ├── hooks/                  # Custom hooks (useOnlineStatus, useDebounce, etc.)
│   ├── lib/                    # Core library modules
│   │   ├── database/           # Supabase database query functions (analytics, requests, chat)
│   │   ├── security/           # Security hardening, input validation, URL safety, env validation
│   │   ├── supabase/           # Supabase client/server connection factories
│   │   └── utils/              # Export utilities, formatting, async retry helpers
│   ├── providers/              # Context providers (RealtimeProvider, ToastProvider)
│   ├── testing/                # Vitest setup, renderWithProviders, and mock factories
│   └── types/                  # TypeScript database & analytics definitions
├── vitest.config.ts            # Master Vitest test runner configuration
├── TESTING.md                  # Test suite guide & conventions
├── ARCHITECTURE.md             # In-depth system architecture specification
├── DEPLOYMENT.md               # Step-by-step Vercel & Supabase deployment guide
├── CHANGELOG.md                # Release version history
└── RELEASE_CHECKLIST.md        # Production release verification checklist
```

---

## ⚡ Quick Start & Local Setup

### 1. Prerequisites
- Node.js `20.x` or higher
- npm `10.x` or higher
- Supabase project credentials

### 2. Clone & Install
```bash
git clone https://github.com/avinash-git-24/universe.git
cd universe
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local` and add your Supabase project keys:
```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Quality Assurance

Run the Vitest unit and component test suites:

```bash
# Run unit & component tests
npm test

# Generate code coverage report
npm run test:coverage

# Run ESLint validation
npm run lint

# Execute production build
npm run build
```

See [TESTING.md](TESTING.md) for testing guidelines and mock helpers.

---

## 📖 Documentation Guide

- 📄 [ARCHITECTURE.md](ARCHITECTURE.md) — System architecture, data flow, and real-time design.
- 📄 [DEPLOYMENT.md](DEPLOYMENT.md) — Vercel, Supabase, domain setup, and environment variables.
- 📄 [CONTRIBUTING.md](CONTRIBUTING.md) — Git workflow, branch naming, and pull request rules.
- 📄 [CHANGELOG.md](CHANGELOG.md) — Complete release version history.
- 📄 [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) — Final production deployment verification checklist.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
