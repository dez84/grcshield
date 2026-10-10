# AGENTS.md

Repository notes for future agents working on GRC Shield.

## What this is

A Next.js 15 (App Router) + Tailwind PWA for GRC micro-learning. PostgreSQL for
persistence with an in-memory fallback when no `DATABASE_URL` is set.

## Commands

- `npm run dev` / `npm run build` / `npm run start` (port 3000)
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint flat config in `eslint.config.mjs`
- `npm test` — Node test runner over `tests/*.test.mjs`
- `npm run db:migrate` / `npm run db:seed` — need `DATABASE_URL` exported

## Conventions that matter

- Curriculum content lives in `lib/content/*.ts` as typed data and is the single
  source of truth. `scripts/seed.mjs` mirrors it into Postgres. Change the TS
  content, not the seed script, when editing curriculum.
- The Node test runner loads `.ts` content modules directly via Node 22+ type
  stripping. That is why tests import `../lib/*.ts` with the extension.
- Do not name a loop variable `module`; the `@next/next/no-assign-module-variable`
  rule fails the build.
- Identity is cookie-based and intentionally minimal. `resolveUser` and
  `currentUserId` (`lib/db/store.ts`, `lib/api.ts`) are the seam for a real auth
  provider. Anonymous device progress merges into an email account on bind.
- The service worker never caches `/api/` responses so progress stays fresh.

## Verification recipe

1. `npm run typecheck && npm run lint && npm test`
2. `npm run build`
3. Start Postgres (`docker compose up -d`), export `DATABASE_URL`, `npm run db:seed`
4. `npm run start` and smoke-test the routes listed in the README
