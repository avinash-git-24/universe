<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# UniVerse Project Agent Guidelines & System Context

## 🛡️ CRITICAL SAFETY RULES (NEVER VIOLATE)
1. **NO ARBITRARY CHANGES:** Do NOT make unrequested changes, refactorings, or modifications on your own. Only do what the user explicitly asks for.
2. **PRESERVE EXISTING CODE:** Never delete or rewrite existing working components, styling tokens, Supabase database queries, or providers unless specifically instructed.
3. **DO NOT BREAK BUILD OR TESTS:** Always ensure `npx tsc --noEmit` and `npm test` pass with 0 errors (currently 202 tests passing).
4. **COMMUNICATION STYLE:** Always communicate with the user in friendly, conversational Hinglish. Explain technical concepts simply and honestly without making false promises.

---

## 🏛️ What is UniVerse & What Has Been Built So Far?
UniVerse is a high-performance **Campus Super-App** built for university students (Marwadi University):
- **Core Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase (PostgreSQL, Realtime WebSockets, RLS, Auth), Framer Motion.
- **Production URL:** `https://universe-brown-seven.vercel.app`

### Completed & Active Modules:
1. **Authentication:** Student login, Marwadi University email verification, custom password reset with OTP flow (`/api/auth/*`).
2. **Campus Delivery & Food Requests:**
   - Users create requests (`/dashboard/requests/new`).
   - Requests are broadcasted to campus runners.
   - Live Radar tracking (`/dashboard/requests/[id]`) with real-time runner status updates (`pending`, `accepted`, `picked_up`, `in_transit`, `delivered`).
3. **P2P Student Marketplace (Resale):**
   - Student product listings with images, condition, and pricing.
   - Escrow protection with OTP-confirmed handover security.
   - Seller & buyer reviews with database RLS policies.
4. **Notification Center:**
   - Glassmorphic notification center with category filters (`All`, `Unread`, `Delivery`, `Request`, `Runner`).
   - Audio alert chimes with mute toggle.
   - Elevated server endpoint (`/api/notifications/create`) to bypass client RLS.
   - Auto-synchronization for in-flight requests on page refresh.
5. **Real-Time Chat:**
   - WebSockets live messaging between requester and runner (`RealtimeProvider.tsx`).
