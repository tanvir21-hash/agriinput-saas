# AgriInput SaaS v2

A production-grade, multi-tenant SaaS platform for NGOs, DAE offices, and agricultural field organizations. Field officers generate farm-specific fertilizer plans during field visits — even without internet connectivity.

🌐 **Live Demo:** https://agriinput-saas-j5y1ig3wy-tanvir21-hashs-projects.vercel.app
📧 **Demo Login:** admin2@test.com / Demo@12345

---

## What This Solves

Field officers in Bangladesh visit remote farms daily. They need to:
- Generate fertilizer recommendations on the spot
- Work without reliable internet
- Report back to their organization with traceable data

AgriInput SaaS solves all three.

---

## Key Features

- **Multi-tenant architecture** — each organization sees only their own data
- **Offline-first PWA** — works without internet, syncs when reconnected
- **Fertilizer calculation engine** — pure TypeScript, fully tested
- **Bilingual UI** — English + Bangla (বাংলা)
- **Role-based access** — org_admin, field_officer, viewer
- **Row-Level Security** — enforced at database level via Supabase RLS

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | Next.js 16 + TypeScript | App Router, SSR, type safety |
| Database | Supabase (PostgreSQL) | RLS, Auth, realtime |
| Auth | Supabase Auth | JWT with org_id claims |
| Offline DB | Dexie.js (IndexedDB) | Typed, offline-first storage |
| PWA | @ducanh2912/next-pwa | Service worker, caching |
| Styling | Tailwind CSS | Mobile-first, fast |
| Testing | Vitest | Calculation engine unit tests |
| Deployment | Vercel | CI/CD from GitHub |

---

## Architecture
```
┌─────────────────────────────────────────┐
│           Field Officer (Mobile)         │
│                                          │
│  Next.js PWA  ──►  Dexie.js (IndexedDB) │
│       │                    │             │
│       │              Sync Queue          │
│       │                    │             │
└───────┼────────────────────┼─────────────┘
        │                    │
        ▼                    ▼ (on reconnect)
┌───────────────────────────────────────┐
│           Supabase Cloud              │
│                                       │
│  PostgreSQL + RLS + Auth              │
│                                       │
│  organizations                        │
│  profiles (org_id, role)              │
│  farms (org_id)                       │
│  fertilizer_plans (org_id)            │
└───────────────────────────────────────┘
```

---

## Multi-Tenancy Strategy

Every table has `org_id`. Supabase Row-Level Security policies enforce data isolation at the database level — no tenant can ever see another tenant's data, regardless of frontend code.
```sql
-- Example RLS policy
CREATE POLICY "org_isolation" ON farms
  FOR ALL USING (
    org_id = (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  );
```

---

## Offline-First Strategy

1. Field officer opens app → service worker caches app shell
2. Officer visits farm without internet → app works normally
3. New plan is saved to IndexedDB via Dexie.js
4. Plan is added to sync queue with `synced: false`
5. When internet returns → background sync uploads to Supabase
6. Plan marked as `synced: true`

---

## Calculation Engine

Pure TypeScript engine with no React dependency. Fully unit tested with Vitest.
```bash
pnpm test
```

---

## Local Development
```bash
# Clone the repo
git clone https://github.com/tanvir21-hash/agriinput-saas.git
cd agriinput-saas

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase URL and anon key

# Run development server
pnpm dev
```

---

## Project Structure
```
src/
├── app/                  # Next.js App Router pages
│   ├── auth/             # Login, signup
│   └── dashboard/        # Main dashboard, plan wizard
├── engine/               # Fertilizer calculation engine (pure TS)
│   ├── fertilizerEngine.ts
│   ├── fertilizerEngine.test.ts
│   ├── cropRules.ts
│   └── types.ts
├── offline/              # Offline-first layer
│   ├── db.ts             # Dexie.js IndexedDB schema
│   └── syncQueue.ts      # Background sync queue
├── lib/                  # Supabase clients
└── types/                # Shared TypeScript types
```

---

## 6-Week Build Journey

| Week | Focus |
|---|---|
| 1-2 | Next.js setup, Supabase, multi-tenancy, RLS |
| 3 | Fertilizer calculation engine + Vitest tests |
| 4 | 4-step plan wizard, Bangla support, PDF export |
| 5 | PWA conversion, Dexie.js, service worker, sync queue |
| 6 | Demo data, dashboard UI, Vercel deployment |

---

## Author

Built by **Tanvir** as a portfolio project demonstrating:
- Multi-tenant SaaS architecture
- Offline-first PWA design
- TypeScript engineering discipline
- Real-world agricultural domain logic
- B2B product thinking
