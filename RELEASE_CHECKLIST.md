# 📋 UniVerse Production Release Checklist

Before releasing a new production deployment of **UniVerse**, verify that all steps on this checklist pass without errors.

---

## 1. Quality & Code Verification
- [ ] **TypeScript Check**: Run `npx tsc --noEmit` and confirm 0 compilation errors.
- [ ] **ESLint Audit**: Run `npm run lint` and confirm 0 errors and 0 warnings.
- [ ] **Unit & Component Test Suite**: Run `npm test` and confirm 100% test pass rate.
- [ ] **Production Build**: Run `npm run build` and verify clean Next.js Turbopack build output.

---

## 2. Security Hardening
- [ ] **Environment Validation**: Confirm all production keys are set (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- [ ] **Row Level Security (RLS)**: Verify RLS policies are enabled on all database tables in Supabase.
- [ ] **Open Redirect Defense**: Verify all client navigation uses `sanitizeRedirectUrl`.
- [ ] **Error Sanitization**: Verify stack traces are hidden in production environment builds.

---

## 3. Resilience & UX Verification
- [ ] **Error Boundary**: Verify unhandled React exceptions trigger fallback UI with reset capability.
- [ ] **Network Loss**: Test offline banner rendering when internet connection drops (`useOnlineStatus`).
- [ ] **Empty States**: Verify clean `<EmptyState />` rendering when lists or search queries return no records.
- [ ] **Accessibility**: Test keyboard navigation (`Tab`, `Enter`, `Space`) and focus rings on interactive elements.

---

## 4. Deployment Verification
- [ ] **Vercel Deploy**: Confirm Vercel deployment completes with green status.
- [ ] **Realtime Subscriptions**: Verify WebSocket connection status for live notifications and chat.
- [ ] **CSV / JSON Exports**: Test downloading CSV and JSON analytics reports from the Admin Dashboard.
