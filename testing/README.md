# Testing

Owned by the QA Agent. Verifies backend + frontend against `document/BUSINESS_ANALYST.md` acceptance criteria.

## unit/backend (vitest)

Isolated tests for `aiService` prompt building, `renderService` HTML output, and the `lessonPlan` zod schema. No database or network required (the default `AI_PROVIDER=mock` is used).

```bash
cd backend
npm install
npm test
```

## unit/frontend (vitest)

Form validation rules, the `downloadHtml` helper, and the API client. Runs against the frontend's Vite/Vitest setup.

```bash
cd frontend
npm install
npm test
```

## regression/backend (vitest)

Curated suite re-run before every release, tracing directly to the BA "Edge Cases" list (age bounds, optional field handling, empty-video/empty-image omission, AI-failure error mapping). Runs with the same command as `unit/backend` (`backend/vitest.config.ts` picks up both directories).

## e2e (Playwright)

Full browser journey: fill form -> submit -> wait for generation -> verify preview content -> verify the `.html` download. Requires a running Postgres instance, the backend, and the frontend dev server.

```bash
cd testing/e2e
npm install
npx playwright install --with-deps chromium
# in separate terminals: `npm run dev` (backend/, against a running Postgres) and `npm run dev` (frontend/)
npm test
```
