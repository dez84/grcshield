# GRC Shield

GRC Shield is a cross-platform micro-learning progressive web app for Governance, Risk and Compliance. It teaches GRC, cybersecurity frameworks, IT auditing and risk management through short lessons, branching scenario simulations and hands-on capstone projects.

The app is a Next.js 15 App Router project with Tailwind CSS, an API layer, and a PostgreSQL schema. It runs from a responsive layout: five-tab bottom navigation on a phone, a centred shell on a laptop, dark and light themes, and add-to-home-screen support.

## What is built

The app ships all four core domain tracks and the Capstone Lab Hub.

Domain tracks, each with modules and lessons:

- Governance and information security strategy
- Risk management and assessment
- Compliance and regulatory frameworks
- IT audit and control testing

Interactive learning:

- Branching scenario simulator with instant scored feedback and a closing debrief
- Mini-quizzes with instant scoring, per-question explanations and a pass threshold
- AI regulatory explainer that turns a legal clause or framework term into plain English
- Capstone Lab with guided steps, copy-ready Docker and CLI commands, evidence capture and an auto-evaluated rubric

Capstone projects:

- ISO 27001:2022 ISMS and Statement of Applicability builder
- Enterprise risk register and quantitative vulnerability mapping
- NIST CSF 2.0 cloud compliance audit and gap analysis
- SOC 2 Type II evidence collection and vendor risk assessment

## Tech stack

- Next.js 15 with the App Router, React 19
- Tailwind CSS 3
- PostgreSQL for persistence, with an in-memory fallback when no database is reachable
- Node.js version 22 or newer to run the scripts and tests

## Quick start

Run these steps from the repository root.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
3. Start PostgreSQL with Docker:
   ```bash
   docker compose up -d
   ```
   The database applies `db/schema.sql` on first boot. If you already have a database, run `npm run db:migrate` instead.
4. Seed the curriculum content:
   ```bash
   npm run db:seed
   ```
   The seed script needs `DATABASE_URL` in the shell. Export it first, or load it from `.env`.
5. Start the app in development:
   ```bash
   npm run dev
   ```
6. Open http://localhost:3000.

You can skip Docker. Leave `DATABASE_URL` unset and the app stores progress in memory for the life of the server process. This is fine for a quick look at the UI.

## Environment variables

- `DATABASE_URL`: PostgreSQL connection string. When set, progress persists and syncs across devices. When unset, the app uses the in-memory store.
- `OPENAI_API_KEY`: optional. When set, the explainer calls a live model. When unset, the explainer answers from a curated offline glossary.
- `NEXT_PUBLIC_SITE_URL`: public site URL used for PWA metadata.

## Scripts

- `npm run dev`: start the development server on port 3000
- `npm run build`: build for production
- `npm run start`: serve the production build on port 3000
- `npm run lint`: run ESLint
- `npm run typecheck`: run the TypeScript compiler without emitting files
- `npm test`: run the content and rubric test suite
- `npm run db:migrate`: apply `db/schema.sql`
- `npm run db:seed`: seed tracks, lessons, scenarios, quizzes and capstone projects

## How progress and identity work

Accounts are optional, so the app is easy to run and review.

- On the first visit the app sets a device cookie and creates an anonymous account. Lessons, quiz attempts, capstone steps and evidence save against that account immediately.
- A learner can register or sign in at `/register` and `/login`. Passwords are hashed with scrypt from Node core, and sessions are revocable rows in the `sessions` table.
- When a learner signs in or registers, anonymous progress already on the device merges into the account instead of being lost. Lesson status, capstone steps, evidence, quiz attempts and scenario decisions all move across.
- Entering an email on the dashboard (or the account page) binds it to the account for sync without a password.
- Storage switches between PostgreSQL and memory automatically. The header shows Synced when the database is active and Local otherwise.

The account hub at `/account` shows the current identity and offers sign in, email sync and sign out.

## Authentication

The built-in provider has three endpoints and a hub page.

- `POST /api/auth/register`: creates an account, or claims an email-sync-only account by setting a password. Merges device progress.
- `POST /api/auth/login`: verifies the password, issues a session and merges device progress.
- `POST /api/auth/logout`: revokes the session and clears cookies.
- `GET /api/auth/session`: reports the signed-in account, role and storage backend.

Passwords use scrypt with a random salt, stored as `scrypt$<salt>$<key>`. The provider is small and self-contained in `lib/auth.ts`; swapping in an external identity provider means replacing `currentUserId` in `lib/api.ts` and the route handlers.

## Database schema

`db/schema.sql` defines the core tables:

- `users`, `tracks`, `modules`, `lessons`
- `user_lesson_progress`, `quiz_attempts`
- `scenarios`, `scenario_nodes`, `scenario_options`, `user_scenario_decisions`
- `capstone_projects`, `capstone_steps`, `capstone_rubric_criteria`, `capstone_submissions`

Curriculum content lives in `lib/content/*.ts` as typed data. The app reads it directly, and `scripts/seed.mjs` mirrors it into PostgreSQL so the data can be queried and joined.

## Project layout

```
app/            App Router pages and API routes
  api/          JSON endpoints for progress, quizzes, scenarios, capstones, explainer
  capstone/     Capstone Lab hub and project workspace
  tracks/       Domain tracks, modules and lessons
components/     UI shell, providers, scenario player, quiz runner
db/             schema.sql
lib/            Content data, database layer, evaluation and helpers
public/         PWA manifest, service worker and icons
scripts/        Migration and seed scripts
tests/          Node test files
```

## Deployment

The repository ships three deploy paths. All of them use the same `Dockerfile`, the health check at `/api/health`, and `scripts/migrate.mjs`.

### Docker (any host)

```bash
APP_PORT=3000 POSTGRES_PASSWORD=change-me docker compose -f docker-compose.prod.yml up --build -d
```

This starts Postgres, runs the migration and seed jobs once, then serves the app on `http://localhost:3000`. Check `GET /api/health` for `storage: "postgres"`.

### Railway

1. Create a project and add a PostgreSQL database.
2. Point the service at this repository. Railway reads `railway.json` and builds the `Dockerfile`.
3. Railway injects `DATABASE_URL` from the database plugin. Set `NEXT_PUBLIC_SITE_URL` to the public domain.
4. On deploy, `node scripts/migrate.mjs` runs as the pre-deploy command, then `node server.js` starts. The health check path is `/api/health`.

Run the seed once from a shell or a one-off command: `npm run db:seed`.

### Vercel

1. Import the repository. Vercel detects Next.js and applies `vercel.json`.
2. Add a managed Postgres, for example Neon or Supabase, and set `DATABASE_URL` in the project settings.
3. Set `NEXT_PUBLIC_SITE_URL` to the production URL.
4. Run `npm run db:migrate` and `npm run db:seed` once against the production database.

The app falls back to an in-memory store when `DATABASE_URL` is unset or unreachable, so a first deploy is always reachable. Set the database to keep progress and accounts across restarts.

### Environment variables

- `DATABASE_URL`: PostgreSQL connection string. Required for durable progress.
- `NEXT_PUBLIC_SITE_URL`: public site URL for PWA metadata.
- `OPENAI_API_KEY`: optional, enables the live explainer model.
- `PORT` and `HOSTNAME`: set by the container image. Default `3000` and `0.0.0.0`.

### Continuous integration

`.github/workflows/ci.yml` runs typecheck, lint, tests, a production build, and a container build with a health check on every push to `main` and on pull requests.

## Progressive web app

`public/manifest.json` and `public/sw.js` register the app as a PWA. On Chrome for Android, open the site and choose Add to home screen. The app then launches full screen with an app icon. The service worker caches the shell and serves it offline.
