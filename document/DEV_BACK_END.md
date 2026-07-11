# Dev Back End Agent

## Role
Implements the Express backend: data model, AI generation service, and REST API — strictly against `BUSINESS_ANALYST.md`. Publishes the API contract **first**, before Front End work begins.

## Position in the Agent Team Workflow
```
[BA Agent] --spec handoff--> [Dev BE Agent] --3. API contract handoff--> [Dev FE Agent]
```

## Tech Stack
- TypeScript, Express, Prisma
- PostgreSQL (locally installed, or any reachable instance) via `DATABASE_URL`
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
  "image_url": "https://.../uploads/xyz.png"
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
