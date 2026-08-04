# 🚀 UniVerse Deployment & Production Guide

This guide walks through deploying the **UniVerse** application to production on **Vercel** with a **Supabase** cloud backend.

---

## 1. Supabase Backend Setup

1. Log in to [Supabase Cloud](https://supabase.com) and create a new project.
2. Under **Project Settings -> API**, copy:
   - `Project URL` (`NEXT_PUBLIC_SUPABASE_URL`)
   - `anon public` key (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
3. Execute SQL migration scripts in the Supabase SQL Editor to initialize database tables (`profiles`, `delivery_requests`, `request_items`, `delivery_assignments`, `notifications`, `messages`, `wallets`, `transactions`).
4. Ensure **Row Level Security (RLS)** is enabled on all tables.
5. Enable **Realtime** on `delivery_requests`, `delivery_assignments`, `notifications`, and `messages`.

---

## 2. Vercel Deployment Setup

1. Push your code repository to GitHub/GitLab.
2. Log in to [Vercel](https://vercel.com) and click **Add New -> Project**.
3. Import the `universe` repository.
4. Set Framework Preset: **Next.js**.

### Environment Variables
Configure the following environment variables in Vercel Project Settings:

| Environment Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Anon Key | `eyJhbG...` |
| `NEXT_PUBLIC_APP_URL` | Production App URL | `https://universe-app.vercel.app` |

5. Click **Deploy**.

---

## 3. Post-Deployment Verification Checklist

- [ ] **Auth Verification**: Register a new student account, verify email redirection, and test sign in / sign out.
- [ ] **Request Workflow**: Create a new delivery request, log in as a runner, accept the request, and advance status to `Delivered`.
- [ ] **Realtime Chat**: Send a message between student and runner and verify realtime delivery.
- [ ] **Admin Control**: Access `/admin`, verify statistics cards, run CSV/JSON export, and test date filters.
- [ ] **Build Check**: Confirm zero ESLint or TypeScript errors in Vercel deployment build logs.
