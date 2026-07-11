# project-A
Build an application using agents team. The application need to have CI/CD flow &amp; database.

## AI Lesson Plan Builder

Lets an English teacher describe a teaching concept and get a ready-to-use lesson plan for
learners aged 3-9, downloadable as a standalone `.html` file. See `document/` for the full
agent-team spec (Product Owner -> Business Analyst -> Dev Back End -> Dev Front End -> QA).

- `backend/` — Express + TypeScript + Prisma + Postgres, AI generation service (mock provider by
  default, OpenAI-backed when configured).
- `frontend/` — React + TypeScript + Vite + Tailwind v4 + shadcn/ui.
- `testing/` — vitest (backend unit + regression, frontend unit), Playwright (e2e). See
  `testing/README.md`.
- `.github/workflows/ci.yml` — runs backend tests + build, frontend lint/test/build, and the e2e
  suite against a native Postgres service on every push/PR to `main`.

### Quick start

Requires a running Postgres instance (locally installed, or any reachable `DATABASE_URL`) —
there is no Docker setup in this project.

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env             # defaults to postgresql://postgres:postgres@localhost:5432/lesson_plan_builder
npx prisma db push               # creates the lesson_plans table
npm run dev                      # http://localhost:8000 (AI_PROVIDER=mock by default)

# 2. Frontend
cd frontend
npm install
cp .env.example .env             # VITE_API_BASE_URL=http://localhost:8000
npm run dev                      # http://localhost:5173
```

To use real AI generation instead of the mock provider, set `AI_PROVIDER=openai` and
`OPENAI_API_KEY=...` before starting the backend (see `backend/.env.example`).
