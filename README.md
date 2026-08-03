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

Other commands:
```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```

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

## Notes

- `backend/prisma/schema.prisma` defines the CodeCritic domain models (`User`, `Submission`, `ReviewCriteria`, `Review`, `CriteriaRating`) — run `npx prisma migrate dev` against a real database to create the tables.
- `backend/prisma init` pulled in a set of official Prisma agent-skill files (`.claude/skills`, `.agents/skills`, `.windsurf/skills`, `skills-lock.json`) for AI coding assistants. They're safe to keep, update (`npx prisma skills update`), or delete if unwanted.
