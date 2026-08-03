# UniVerse Deployment Guide

This document outlines the steps required to deploy the UniVerse application to production, specifically focusing on Vercel as the hosting provider.

## 1. Prerequisites

Before deploying, ensure you have the following:
- A [Vercel](https://vercel.com/) account.
- A [Supabase](https://supabase.com/) account and project.
- The project pushed to a Git repository (GitHub, GitLab, or Bitbucket).

## 2. Supabase Configuration

Your production Supabase instance must be configured correctly to handle production traffic:
1. **Site URL:** In the Supabase Dashboard, go to **Authentication > URL Configuration** and set the Site URL to your production domain (e.g., `https://universe.app`).
2. **Redirect URLs:** Add any additional wildcard or specific redirect URLs (e.g., `https://universe.app/*`) in the same section.
3. **Database Policies:** Ensure all Row Level Security (RLS) policies are active and properly restricted. **Never** allow anon read/write access to sensitive tables like `wallets` or `transactions`.

## 3. Environment Variables

In Vercel, you must configure the following environment variables under **Settings > Environment Variables**:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | The URL of your Supabase project | Yes |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | The anon public key for your Supabase project | Yes |
| `NEXT_PUBLIC_APP_URL` | The production URL of the application | Yes |

*Note: The application has built-in environment validation on startup. Deployment will fail if required variables are missing.*

## 4. Vercel Setup Steps

1. **Import Project:** Log in to Vercel and click **Add New... > Project**. Select the Git repository where UniVerse is hosted.
2. **Framework Preset:** Vercel should automatically detect **Next.js**. Leave it as the default.
3. **Root Directory:** If the app is in the root of the repository, leave this blank.
4. **Build Command:** `npm run build` (default).
5. **Install Command:** `npm install` (default).
6. **Environment Variables:** Paste the variables from Section 3.
7. **Deploy:** Click **Deploy**. Vercel will build the application.

## 5. Production Readiness Checklist

Before announcing the launch, verify the following:

### Core Functionality
- [ ] **Routing:** Ensure dynamic routes (e.g., `/dashboard/requests/[id]`) resolve correctly.
- [ ] **Middleware:** Ensure trying to access `/dashboard` without being logged in correctly redirects to `/login`.
- [ ] **Realtime:** Verify that Supabase realtime connections (WebSockets) function properly.

### Security
- [ ] **Content Security Policy:** Verify the strict CSP in `next.config.ts` allows necessary external scripts/styles (Supabase, Vercel) while blocking others.
- [ ] **Environment Variables:** Double-check that no sensitive service-role keys are exposed to the browser.
- [ ] **Row Level Security (RLS):** Test that authenticated users cannot access data belonging to other users.

### Performance
- [ ] **Image Optimization:** Ensure external images (e.g., avatars) are correctly optimized by `next/image` and external domains are listed in `next.config.ts`.
- [ ] **Caching:** Leverage Next.js App Router caching. Verify aggressive cache control hasn't broken dynamic pages.

### SEO & Accessibility
- [ ] **Metadata:** Verify `rootMetadata` properly injects titles and descriptions across all pages.
- [ ] **Sitemap & Robots:** Ensure `sitemap.xml` and `robots.txt` are reachable and accurate.
- [ ] **ARIA Labels:** Verify interactive elements have correct `aria-label` tags for screen readers.

## 6. Common Issues

### Issue: Realtime Subscriptions Dropping
**Fix:** Ensure you aren't doing complex state updates that trigger full page reloads. Supabase realtime over WebSockets is fully supported on Vercel, but clients must maintain the connection.

### Issue: Next.js Cache Causing Stale Data
**Fix:** The application removes aggressive static caching headers for `_next/static` in `next.config.ts` to prevent deployment staleness. Next.js App Router handles caching natively. Use `revalidatePath` when mutating data (e.g., after a payment or delivery update) via server actions or API routes.

### Issue: Missing Environment Variables
**Fix:** The build will intentionally crash with `Missing required environment variables:` if you forget to add the Supabase keys in Vercel. Add them and redeploy.
