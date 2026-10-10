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

Identity is deliberately light so the app is easy to run and review.

- On the first visit the app sets a device cookie and creates an anonymous account. Lessons, quiz attempts, capstone steps and evidence save against that account immediately.
- Entering an email on the dashboard binds it to the account so progress follows the learner to another device. Anonymous progress already on the device merges into the email account instead of being lost.
- Storage switches between PostgreSQL and memory automatically. The header shows Synced when the database is active and Local otherwise.

This is a review-friendly stand-in for a full auth provider. The seam for a real provider is `resolveUser` and `currentUserId` in `lib/api.ts` and `lib/db/store.ts`.

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

The app deploys to Vercel or Railway as a standard Next.js project.

For Vercel:

1. Import the repository.
2. Set `DATABASE_URL` to a managed PostgreSQL instance, for example Neon or Supabase.
3. Set `NEXT_PUBLIC_SITE_URL` to the production URL.
4. Run `npm run db:migrate` and `npm run db:seed` once against the production database.

For Railway, add a PostgreSQL plugin, set the same variables, and deploy the repository. Railway injects `DATABASE_URL` for you.

## Progressive web app

`public/manifest.json` and `public/sw.js` register the app as a PWA. On Chrome for Android, open the site and choose Add to home screen. The app then launches full screen with an app icon. The service worker caches the shell and serves it offline.
