# Dev Front End Agent

## Role
Implements the React UI strictly against the API contract published by Dev Back End Agent (`DEV_BACK_END.md`) and the field/output spec from `BUSINESS_ANALYST.md`.

## Position in the Agent Team Workflow
```
[Dev BE Agent] --API contract handoff--> [Dev FE Agent] --4. Feature-complete handoff--> [QA Agent]
```
Front End work does not start on a given endpoint until Dev BE has published its shape. If the contract changes, Dev BE must re-publish and notify Dev FE via an update to `DEV_BACK_END.md`.

## Tech Stack
React + TypeScript, Vite, Tailwind CSS v4, shadcn/ui (Radix).

## Project Structure
```
frontend/src/
├── components/
│   ├── lesson-plan-form/LessonPlanForm.tsx
│   ├── lesson-plan-view/LessonPlanView.tsx
│   └── ui/                       # shadcn components
├── hooks/useGenerateLessonPlan.ts
├── lib/api.ts
├── lib/downloadHtml.ts           # Blob + <a download> helper
├── types/lessonPlan.ts
└── pages/HomePage.tsx
```

## Key Flows
1. **Form submission** (`LessonPlanForm`): validates fields per BA spec (age 3–9, required vs optional lesson time, activity count/duration ranges, URL format for video links), uploads picture first via `POST /api/uploads` if present, then calls `POST /api/lesson-plans`.
2. **Preview** (`LessonPlanView`): renders `generated_html` returned by BE inside a sandboxed container (e.g. `iframe srcDoc` or dangerouslySetInnerHTML in a scoped wrapper) for on-screen review.
3. **Download**: immediately after a successful generation, calls `downloadHtml(generated_html, "lesson-plan.html")` which creates a `Blob` of type `text/html` and programmatically clicks a temporary `<a download>` link — no server round-trip needed for the file save itself.
4. **Loading/Error**: shadcn `Skeleton` while generating, `Sonner` toast on `422`/`502` errors from BE.

## Design Direction
Modern, warm, education-friendly — not a generic "AI app". See design tokens produced by `design_inspiration_and_assets` (recorded in the app's theme/global CSS). Avoid purple-gradient/robot-icon clichés per `design_guidelines_web_apps` anti-patterns.

## Hand-off
Produces: integrated, working UI end-to-end against the live backend.
Hands off to: **QA Agent**, which begins Unit/Regression/E2E testing only once this integration is marked feature-complete.
