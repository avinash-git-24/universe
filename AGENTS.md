<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 🏛️ UniVerse Engineering Standards & Agent Operational Protocols
*Maintained by the Lead Architect & Engineering Team for UniVerse (Campus Super-App)*

---

## 🧭 Project Identity & Overview
**UniVerse** is a high-performance, real-time campus super-application built specifically for university students (Marwadi University):
- **Core Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase (PostgreSQL, Realtime WebSockets, RLS, Auth), Framer Motion, Vitest.
- **Production URL:** `https://universe-brown-seven.vercel.app`
- **Current Test Suite:** 19 test files, 202 tests — 100% PASSING.

### 📦 Key Production Modules:
1. **Authentication & Identity (`src/app/(auth)/`, `src/app/api/auth/*`):**
   - Student sign-in/up with Marwadi University email domain validation (`@marwadiuniversity.ac.in`).
   - Secure server-side password reset via custom 6-digit OTP verification flow.
2. **Campus Delivery & Food Requests (`src/app/dashboard/requests/`, `src/components/requests/`):**
   - Live order creation with pickup/destination tagging and delivery tip incentives.
   - Real-time campus runner broadcasting and instant order acceptance.
   - Interactive Live Radar Tracker (`/dashboard/requests/[id]`) with real-time status progression (`pending` ➔ `accepted` ➔ `picked_up` ➔ `in_transit` ➔ `delivered`).
3. **P2P Student Marketplace (`src/app/dashboard/marketplace/`, `src/components/resale/`):**
   - Student product listings, multi-angle image galleries, condition ratings, and price negotiations.
   - Anti-fraud Escrow security protocol requiring buyer 6-digit OTP verification to release handover.
   - Buyer and seller rating/review system guarded by strict Supabase RLS policies.
4. **Real-Time Notification Center (`src/components/notifications/`):**
   - Glassmorphic slide-out center with category filters (`All`, `Unread`, `Delivery`, `Request`, `Runner`).
   - Audio alert chimes with user mute toggle.
   - Elevated server endpoint (`/api/notifications/create`) using `createAdminClient` to guarantee delivery across client RLS boundaries.
   - Auto-synchronization on page load for active in-flight delivery requests.
5. **Real-Time WebSockets Chat (`src/components/chat/`, `src/providers/RealtimeProvider.tsx`):**
   - Sub-second peer messaging between students, delivery runners, and resale buyers.

---

## 🛡️ Senior Engineer Production Protocols (MANDATORY)

### 🔒 Protocol 1: Zero-Trust Security & Data Integrity
1. **Never Expose Service Role Keys:**
   - The `SUPABASE_SERVICE_ROLE_KEY` must NEVER be imported or used in client components (`'use client'`), public hooks, or browser bundles.
   - Elevated operations requiring bypass of client RLS must strictly live in server route handlers (`src/app/api/*`) utilizing `createAdminClient()`.
2. **RLS on All Tables:**
   - Every table in `public` schema MUST have Row Level Security enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).
   - Client queries must strictly resolve under `auth.uid()`.
3. **Financial & Handover Integrity:**
   - Resale orders and deliveries must never transition to terminal status (`completed` / `delivered`) without cryptographic OTP or server-validated confirmation.
4. **Sanitize Inputs:**
   - All external user inputs, URLs, and redirect targets must pass `sanitizeString()` and `isSafeRedirectUrl()` before storage or navigation.

---

### 🏗️ Protocol 2: Layered Architecture & Next.js 16 Discipline
1. **Server Components by Default:**
   - All route pages, layouts, and data containers must be Server Components unless client interactivity (`useState`, `useEffect`, `onClick`) is explicitly required.
   - Push `'use client'` directives to the lowest possible leaf components in the component tree.
2. **Strict Layer Separation:**
   - **Presentation Layer:** `src/app/` (pages, layouts, route handlers).
   - **Domain Components:** `src/components/<module>/` (composed feature widgets).
   - **Primitive UI Components:** `src/components/ui/` (stateless, reusable building blocks).
   - **Data Layer:** `src/lib/database/<module>.ts` (Supabase queries and mutations — never write raw Supabase calls directly inside presentation components).
   - **State Layer:** `src/providers/` (React context providers for global cross-cutting state).
3. **Zero Unapproved Dependencies:**
   - Do NOT run `npm install <package>` without explicit user consent. Always favor native Web APIs, standard React 19 primitives, and existing utility libraries (`date-fns`, `lucide-react`, `clsx`).

---

### 🧪 Protocol 3: Quality Gates (Pre-Flight Verification)
Before finalizing any code change, generating a pull request, or claiming completion of a task, you MUST execute and pass all three quality gates:
1. **TypeScript Static Analysis:**
   ```bash
   npx tsc --noEmit
   ```
   *Gate:* Must exit with **0 errors**.
2. **ESLint Code Standards:**
   ```bash
   npm run lint
   ```
   *Gate:* Must exit with **0 errors**.
3. **Automated Unit & Integration Test Suite:**
   ```bash
   npm test
   ```
   *Gate:* All **202+ tests must pass** with 0 failures.

---

### 🎨 Protocol 4: Design System & UX Standards
1. **Design Tokens Only:**
   - Never use arbitrary inline styles or hardcoded hex colors (`#1a2b3c`). Use defined CSS variables tokens (`var(--color-primary)`, `var(--glass-bg)`, `var(--radius-*)`).
2. **Glassmorphic Aesthetic:**
   - Preserve the premium dark-mode glassmorphic theme: subtle backdrop blurs (`backdrop-blur-md`), translucent border rings (`border-white/10`), and deep charcoal card backgrounds.
3. **Mobile-First Responsiveness:**
   - Every interface must be responsive and tested across mobile viewports (375px), tablets (768px), and desktops (1280px+).
4. **Optimistic UI & Loading States:**
   - Every user-initiated mutation button must exhibit loading indicators (`Spinner`), disabled states to prevent double-clicks, and immediate optimistic feedback where appropriate.

---

### 🌿 Protocol 5: Git Hygiene, Auto-Push & Profile Contribution Standards
1. **Conventional Commit Format:**
   - All commits must follow standard convention:
     - `feat(scope): brief description`
     - `fix(scope): brief description`
     - `docs(scope): brief description`
     - `refactor(scope): brief description`
     - `perf(scope): brief description`
2. **GitHub Push & Daily Contribution Integrity (MANDATORY):**
   - After completing any task, verified edits, or feature pass, **always commit with the user's verified identity (`Avinash Kumar <abhiavi619@gmail.com>`) and push to `origin main`**.
   - Ensure every approved change is pushed directly to the default `main` branch so that GitHub tracks daily activity and builds the user's green contribution squares (`🟩`).
3. **Zero Repository Pollution:**
   - Never commit `.env` files, temporary scratch scripts, test output artifacts, or machine-specific absolute paths (`C:/Users/...`).
4. **Branch Cleanup:**
   - Immediately delete temporary feature branches both locally and remotely upon successful PR merge.

---

### 🗣️ Protocol 6: Communication, Honesty & Ethical AI Behavior
1. **Friendly & Conversational Hinglish:**
   - Always communicate with the user in warm, respectful, conversational Hinglish. Explain complex software concepts simply and intuitively.
2. **100% Technical Honesty (No False Promises):**
   - Never make false or misleading claims about external systems (e.g., GitHub background sync queues, third-party APIs). If an operation takes time or has external dependencies, state the exact technical reality upfront.
3. **Consent on High-Impact Changes:**
   - Never delete production files, drop database tables, or rewrite working core modules without explicitly confirming with the user first.

---

### 🎯 Protocol 7: Strict Page Scope & Zero Unintended Modifications (USER'S GOLDEN RULE)
1. **Target-Only Execution (Single Page / Component Scope):**
   - **Aap jis specific page ya component par kaam karne ko kahenge, sirf aur sirf usi file me kaam hoga.**
   - **Baaki kisi bhi doosre page ya component ko haath bhi nahi lagaya jaayega. Zero untouched changes.**
2. **Never Touch Working Unrelated Features:**
   - Even if visual polish, contrast tuning, or refactoring seems beneficial, NEVER modify another screen, component, or flow without explicit user request.
3. **Explicit Consent for Shared Changes:**
   - If a change strictly requires touching a shared component, schema, or provider, STOP and ask the user for approval first before touching that file.
