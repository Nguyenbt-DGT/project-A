# Dev Back End Agent

## Role
Implements the Express backend: data model, AI generation service, and REST API — strictly against `BUSINESS_ANALYST.md`. Publishes the API contract **first**, before Front End work begins.

## Position in the Agent Team Workflow
```
[BA Agent] --spec handoff--> [Dev BE Agent] --3. API contract handoff--> [Dev FE Agent]
```

## Tech Stack
- TypeScript, Express, Prisma
- PostgreSQL: Supabase-hosted, via `DATABASE_URL` (pooled) / `DIRECT_URL` (direct, used by Prisma migrations)
- File storage: Supabase Storage (public bucket `lesson-plan-images`), via `SUPABASE_URL` +
  `SUPABASE_SERVICE_ROLE_KEY` (server-side only, never exposed to the frontend). `POST /api/uploads`
  streams the multipart file straight to the bucket (`multer` memory storage, no local disk write —
  required for stateless hosting on Render, where the filesystem is ephemeral) and returns the
  bucket's public URL.
- AI provider abstraction (`AI_IMPLEMENTATION.md`), default OpenAI

## Project Structure
```
backend/
├── prisma/
│   └── schema.prisma            # LessonPlan model
├── src/
│   ├── server.ts                 # entrypoint, starts the HTTP server
│   ├── app.ts                    # Express app, CORS, router registration
│   ├── db.ts                     # Prisma client
│   ├── schemas/
│   │   └── lessonPlan.ts         # zod request schema
│   ├── routes/
│   │   ├── lessonPlans.ts        # POST/GET /api/lesson-plans
│   │   └── uploads.ts            # POST /api/uploads
│   └── services/
│       ├── aiService.ts          # prompt building + LLM call + JSON parsing
│       └── renderService.ts      # AI JSON -> standalone HTML document string
├── package.json
└── .env.example
```

## Data Model — `LessonPlan`
| Column | Type | Notes |
|---|---|---|
| id | UUID/int PK | |
| age_from | int | |
| age_to | int | |
| concept | str | |
| num_activities | int | |
| activity_duration_min | int | |
| total_lesson_time_min | int, nullable | **optional field** |
| video_links | JSON/list[str] | |
| image_url | str, nullable | |
| generated_html | text | full standalone HTML |
| created_at | datetime | |

## API Contract (published to Dev FE Agent)
- `POST /api/uploads` — multipart form (`file`) → `{ "url": string }`
- `POST /api/lesson-plans` — body:
```json
{
  "age_from": 3, "age_to": 9,
  "concept": "Colors of fruits",
  "num_activities": 3,
  "activity_duration_min": 10,
  "total_lesson_time_min": 30,
  "video_links": ["https://youtube.com/..."],
  "image_url": "https://<project>.supabase.co/storage/v1/object/public/lesson-plan-images/xyz.png"
}
```
  → `201` response:
```json
{
  "id": "uuid",
  "generated_html": "<!doctype html>...",
  "created_at": "2026-07-10T..."
}
```
- `GET /api/lesson-plans/{id}` → same shape as above.

Errors: `422` validation (field-level messages matching BA spec ranges), `502` on AI provider failure with `{"detail": "AI generation failed, please retry"}`.

## Hand-off
Produces: running backend + this published API contract.
Hands off to: **Dev Front End Agent**, which consumes these exact endpoints/shapes. Once FE integration is complete, control passes to **QA Agent**.

## Production Deployment

- **Backend**: Render web service `lesson-plan-builder-api`, deployed from this repo's `backend/`
  root dir (see `render.yaml`). Live at `https://lesson-plan-builder-api-qtro.onrender.com`.
- **Frontend**: Vercel project `lesson-plan-builder`, deployed from `frontend/`. Live at
  `https://lesson-plan-builder-one.vercel.app`.
- **Database**: Supabase Postgres. Render's outbound network is **IPv4-only**, and Supabase's direct
  connection host (`db.<ref>.supabase.co`) is **IPv6-only** — connecting the two directly fails with
  `Can't reach database server`. Both `DATABASE_URL` (transaction pooler, port 6543,
  `?pgbouncer=true`) and `DIRECT_URL` (session pooler, port 5432) must use the Supavisor pooler host
  (`aws-<n>-<region>.pooler.supabase.com`, username `postgres.<project-ref>`) instead of the direct
  host. This only bites on IPv4-only hosts (Render, some CI runners) — local dev machines with IPv6
  connectivity won't see it.
- CI's `e2e` job (`.github/workflows/ci.yml`) uses a disposable Postgres service container, not
  Supabase, so it's unaffected by the pooler requirement — but it does need `SUPABASE_URL` /
  `SUPABASE_SERVICE_ROLE_KEY` repo secrets for the image-upload test.
