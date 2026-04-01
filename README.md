# AgriInput SaaS v2

A multi-tenant, offline-first B2B SaaS platform for agricultural field organizations.

## Who uses this
- **Field officers** — generate fertilizer plans during farm visits, even offline
- **Org admins** — manage officers, view analytics, export reports
- **Paying customers** — NGOs, DAE offices, agribusinesses (not the farmer)

## Tech stack
- Next.js 16 + TypeScript (strict)
- Supabase (PostgreSQL + Auth + RLS)
- Tailwind CSS
- Dexie.js (IndexedDB for offline storage)
- next-pwa (service worker)
- react-i18next (Bangla + English)
- Vitest (unit tests)

## Folder structure

| Folder | Purpose |
|--------|---------|
| src/app | Next.js App Router pages and layouts |
| src/features | Feature modules (auth, farms, plans, dashboard) |
| src/engine | Pure TypeScript calculation engine, zero React dependency |
| src/components/ui | Shared reusable UI components |
| src/lib | Supabase client, utility functions |
| src/types | Shared TypeScript types and interfaces |
| src/constants | Crop rules, soil types, app-wide constants |
| src/offline | Dexie.js schema, sync queue, IndexedDB logic |
| src/i18n | Translation files en and bn |
| src/db | Supabase auto-generated database types |

## Multi-tenancy
Every database table includes org_id. Row-Level Security is enforced
at the database level. Never rely on frontend filtering for data isolation.

## Offline-first
Plans created offline are stored in IndexedDB via Dexie.js and synced
to Supabase when connectivity is restored via a background sync queue.

## Development
pnpm dev        - start dev server
pnpm test       - run unit tests
pnpm typecheck  - TypeScript strict check
pnpm lint       - ESLint

## Environment variables
Copy .env.example to .env.local and fill in your Supabase credentials.
