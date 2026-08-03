# codecritic

Monorepo with a Next.js frontend and an Express + Prisma backend.

```
.
├── frontend/   # Next.js (App Router) + Tailwind CSS + Shadcn/UI + Zustand
└── backend/    # Node.js + Express + Prisma + TypeScript
```

## Prerequisites

- Node.js 20+
- npm
- A PostgreSQL database (for the backend) — local or hosted

## Frontend setup (`/frontend`)

```bash
cd frontend
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

Stack:
- **Next.js** (App Router, TypeScript, Turbopack)
- **Tailwind CSS** for styling
- **Shadcn/UI** for components (`npx shadcn@latest add <component>` to add more)
- **Zustand** for client state (see `src/store/useCounterStore.ts` for an example)
- **Clerk** for authentication (see below)

Other commands:
```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```

### Authentication (Clerk)

Sign-in/sign-up live at `/sign-in` and `/sign-up` (`src/app/sign-in`, `src/app/sign-up`). Route protection is handled in `src/proxy.ts` — Next.js 16 renamed `middleware.ts` to `proxy.ts` (same mechanism, new filename); it currently protects `/dashboard(.*)`. To protect more routes, add them to the `isProtectedRoute` matcher there.

`src/components/sync-user.tsx` calls the backend's `POST /users/sync` once per session after sign-in (mounted on the dashboard page) so a matching `User` row exists in Postgres.

Env vars go in `frontend/.env.local` (see `.env.local.example`):

| Variable | Description |
|----------|--------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key (server-side only) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Path to the sign-in/sign-up pages |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` / `..._SIGN_UP_FALLBACK_REDIRECT_URL` | Where to land after auth (`/dashboard`) |
| `NEXT_PUBLIC_BACKEND_URL` | Base URL of the Express API (used by `sync-user.tsx`) |

## Backend setup (`/backend`)

```bash
cd backend
npm install
cp .env.example .env   # then set DATABASE_URL to your Postgres instance
npx prisma generate
npm run dev
```

The API runs at [http://localhost:4000](http://localhost:4000). Verify it's up with:

```bash
curl http://localhost:4000/health
```

Stack:
- **Express** (TypeScript)
- **Prisma ORM v7** — models live in `prisma/schema.prisma`; the client is generated to `src/generated/prisma` (CommonJS output) and connects through the `@prisma/adapter-pg` driver adapter (see `src/lib/prisma.ts`) rather than a URL embedded in the schema. After changing models:
  ```bash
  npx prisma migrate dev   # create/apply a migration
  npx prisma generate      # regenerate the Prisma client
  ```
- **Clerk** (`@clerk/express`) for auth — `clerkMiddleware()` runs globally in `src/app.ts`; `POST /users/sync` (`src/routes/users.ts`) reads the verified `userId` via `getAuth(req)`, fetches the full profile from Clerk, and upserts a matching `User` row by `clerkId`. Requires an `Authorization: Bearer <session token>` header; returns `401` without one.

Other commands:
```bash
npm run build   # compile TypeScript to dist/
npm run start   # run the compiled server (dist/index.js)
```

### Environment variables (`backend/.env`)

| Variable       | Description                          |
|----------------|---------------------------------------|
| `PORT`         | Port the Express server listens on (default `4000`) |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |

## Notes

- `backend/prisma/schema.prisma` defines the CodeCritic domain models (`User`, `Submission`, `ReviewCriteria`, `Review`, `CriteriaRating`) — run `npx prisma migrate dev` against a real database to create the tables.
- `backend/prisma init` pulled in a set of official Prisma agent-skill files (`.claude/skills`, `.agents/skills`, `.windsurf/skills`, `skills-lock.json`) for AI coding assistants. They're safe to keep, update (`npx prisma skills update`), or delete if unwanted.
