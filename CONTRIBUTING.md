# Contributing to UniVerse

Thank you for your interest in contributing to **UniVerse**! To maintain code quality, security, and consistent architecture across the platform, please follow these guidelines.

---

## 🌿 Branch Naming Conventions

All branch names should follow standard prefix conventions:

- `feature/feature-name`: New features or enhancements (e.g. `feature/export-csv`)
- `fix/bug-name`: Bug fixes (e.g. `fix/chat-scroll-issue`)
- `perf/optimization-name`: Performance improvements (e.g. `perf/memoize-card`)
- `docs/topic`: Documentation updates (e.g. `docs/update-deployment-guide`)
- `refactor/scope`: Code cleanup or refactoring without behavior changes

---

## 📝 Commit Message Format

Commit messages must be clear, concise, and written in the imperative mood:

### Examples
- `feat: add CSV and JSON export toolbar to analytics dashboard`
- `fix: resolve keyboard enter key handling on StudentRequestCard`
- `perf: wrap list items in React.memo to prevent re-renders`
- `docs: add production release checklist and deployment guide`

---

## 🔄 Pull Request (PR) Workflow

1. **Fork & Branch**: Create a feature/fix branch off `main`.
2. **Implement**: Write clean, strongly-typed TypeScript code adhering to existing project abstractions.
3. **Verify**:
   ```bash
   npm run lint
   npm test
   npm run build
   ```
4. **Submit PR**: Open a Pull Request against `main` detailing what changes were made, why, and verification steps.

---

## 📐 Coding Conventions

- **Framework Rules**: Next.js 16 App Router conventions (server components by default, `'use client'` only when interactive).
- **TypeScript**: Enforce strict typing. Avoid `any` types unless using typed generic fallbacks.
- **Styling**: Use Tailwind CSS utility classes alongside existing CSS variable tokens (`var(--color-primary)`).
- **Accessibility**: Enforce ARIA roles, `focus-visible` outline rings, and keyboard navigation (`onKeyDown` Enter/Space triggers).
- **Security**: Always sanitize user input (`sanitizeString`) and validate redirect paths (`isSafeRedirectUrl`).
