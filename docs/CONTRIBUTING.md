# Contributing to UniVerse

## Code Style

- **TypeScript strict mode** — no `any`, no implicit returns
- **Named exports** — prefer named exports over default exports (except pages/layouts)
- **No inline styles** — use CSS custom properties via Tailwind or design tokens
- **Component files** — one component per file, named matching the file
- **JSDoc comments** — all exported functions and components must have JSDoc

## Component Guidelines

1. Use `cn()` from `@/lib/utils` for class merging — never string concatenation
2. Always `forwardRef` for leaf components that accept a `ref`
3. Use `cva` for multi-variant components
4. Prefix internal types with the component name (e.g., `ButtonProps`)
5. Add `displayName` to all forwardRef components

## File Naming

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `Button.tsx` |
| Hooks | camelCase with `use` prefix | `useDebounce.ts` |
| Utilities | camelCase | `utils.ts` |
| Types | camelCase with `.types` suffix | `user.types.ts` |
| Constants | camelCase | `routes.ts` |
| Pages | lowercase / kebab | `page.tsx` |

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add request expiry countdown timer
fix: resolve avatar image load error
chore: update dependencies
docs: add component prop documentation
refactor: extract status badge to shared component
style: fix spacing on card footer
```

## Branch Strategy

```
main          → production-ready
dev           → integration branch
feat/xxx      → feature branches
fix/xxx       → bug fixes
chore/xxx     → dependency updates, tooling
```
