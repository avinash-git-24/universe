# UniVerse — Testing Infrastructure & Quality Assurance

This document details the testing architecture, tools, and conventions configured for the **UniVerse** platform.

---

## 🛠️ Testing Stack

- **Test Runner**: [Vitest](https://vitest.dev/)
- **Component Testing**: [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **DOM Environment**: `jsdom`
- **DOM Assertions**: `@testing-library/jest-dom`

---

## 🚀 Running Tests

### 1. Execute All Tests
```bash
npm test
```

### 2. Run Tests in Watch Mode
```bash
npx vitest
```

### 3. Generate Code Coverage Report
```bash
npm run test:coverage
```

---

## 📁 Test Directory Structure

- `vitest.config.ts`: Master Vitest configuration with path aliases and environment setup.
- `src/testing/`:
  - `setupTests.ts`: Global DOM setup and automatic cleanup.
  - `testUtils.tsx`: Custom `renderWithProviders()` render helper.
  - `mocks.ts`: Factory helpers for `mockUser()`, `mockRequest()`, and `mockSupabaseClient()`.
- `src/**/__tests__/`: Unit and component test suites placed adjacent to implementation modules.

---

## 📐 Conventions

1. **Unit & Utility Tests**: Target shared functions, data parsers, and custom hooks (`.test.ts`).
2. **Component Tests**: Target shared UI elements (`.test.tsx`).
3. **No Business Workflow Mutations**: Tests must remain decoupled from database state and external backend APIs.
