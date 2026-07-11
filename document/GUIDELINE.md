# AI Lesson Plan Builder — User Guide

A simple tool for English teachers: describe what you want to teach, and get a
ready-to-use lesson plan for your class (ages 3–9) in under a minute — with
games, video links, and a picture if you'd like — saved as a file you can
open, print, or share anytime, even without internet.

No account, no login, no setup required.

## Step 1 — Open the app

- Open your web browser (Chrome, Edge, Safari, or Firefox).
- Go to <https://lesson-plan-builder-one.vercel.app>.
- The homepage loads with an empty form — you're ready to start.

## Step 2 — Fill in your class details

- **Learner age range** — enter the youngest and oldest age in your class
  (from 3 to 9). This tells the AI how simple or advanced to make the
  language and activities.
- **Concept to teach** — describe the lesson topic in plain words, e.g.
  *"Colors of fruits"*, *"Farm animals"*, or *"Saying good morning"*. One
  sentence is enough.

## Step 3 — Set your activities and timing

- **Number of activities** — choose how many games you want (1 to 10).
- **Time per activity** — choose how many minutes each game should take
  (1 to 60 minutes).
- **Total lesson time** *(optional)* — if your class period is a fixed
  length (e.g. 30 minutes), enter it so the plan is paced to fit. Leave it
  blank if you don't need this.
  - If the total time doesn't quite match your activities × duration, the
    plan is still generated — you'll just see a small pacing note, not an
    error.

## Step 4 — Add extras (optional)

- **Video clip links** — paste one or more video links (e.g. YouTube),
  separated by commas or one per line. They'll show up as clickable links in
  your finished plan.
- **Picture** — upload a photo or image (PNG, JPEG, or WEBP, up to 5MB) to
  appear in your plan.
- Skip either one if you don't need it — the plan simply leaves that section
  out.

## Step 5 — Create your lesson plan

- Click the **Generate Lesson Plan** button.
- Wait a few seconds while the AI builds your plan.
- Your finished plan appears on screen so you can look it over.
- A `.html` file automatically downloads to your computer (usually into your
  **Downloads** folder) — no extra click needed.

## Step 6 — Use your downloaded lesson plan

- **Reopen it anytime** — even without internet — by double-clicking the
  downloaded file; it opens right in your web browser.
- **Print it** — open the file and use your browser's print option
  (`Ctrl+P` on Windows, `Cmd+P` on Mac).
- **Share it** — send the file itself to a co-teacher by email or chat; they
  can open it the same way without needing the app.

## Step 7 — Make another plan

- To create a different plan, just fill in the form again (you can tweak the
  age, concept, number of activities, etc.) and click **Generate Lesson
  Plan** once more.
- Each plan you generate downloads as its own separate file, so you can
  build up a library of lesson plans on your computer.
- Plans can't be edited in place — generating a fresh one only takes a few
  seconds.

## For Developers — Running the App Locally

Use this section instead of Step 1 if you're running the app on your own
machine rather than opening a hosted link.

### Step 1 — Install prerequisites

- **Node.js 22+** and **npm** (runs both the backend and the frontend).
- **PostgreSQL**, running locally or reachable via a `DATABASE_URL` (e.g. a
  free-tier hosted instance).
- Optional: an **OpenAI API key**, only if you want real AI-generated plans
  instead of the built-in mock content.

### Step 2 — Get the code

- Clone the repository and open a terminal in its root folder.

### Step 3 — Start the backend

- In a terminal:
  ```bash
  cd backend
  npm install
  cp .env.example .env             # defaults to a local Postgres on :5432
  npx prisma db push               # creates the lesson_plans table
  npm run dev
  ```
- This starts the API on port `8000`.
- By default `AI_PROVIDER=mock`, so lesson plans generate instantly with no
  API key needed.
- To use real AI generation instead, before this step set `AI_PROVIDER=openai`
  and `OPENAI_API_KEY=...` in `.env` (see `backend/.env.example`).
- Check it's up: open `http://localhost:8000/health` in a browser — it
  should show `{"status": "ok"}`.

### Step 4 — Start the frontend

- In a new terminal:
  ```bash
  cd frontend
  npm install
  cp .env.example .env
  npm run dev
  ```
- Open `http://localhost:5173` in your browser — this is the app's homepage,
  same as Step 1 above for end users.

### Step 5 — Stop everything when you're done

- Stop the frontend with `Ctrl+C` in its terminal.
- Stop the backend with `Ctrl+C` in its terminal.

### Step 6 — Run the tests (optional)

- Backend: `cd backend && npm test`
- Frontend: `cd frontend && npm test`
- End-to-end: see `testing/README.md` for the full Playwright setup.

## Troubleshooting

- **A field turns red with a message** — the form is telling you what to
  fix (e.g. an age outside 3–9, or a video link that doesn't start with
  `http://` or `https://`). Correct that field and try again.
- **"We couldn't generate your lesson plan"** — the AI service had a
  temporary problem. Nothing was saved or downloaded; simply click
  **Generate Lesson Plan** again.
- **Nothing downloads** — check whether your browser blocked the download,
  or look in your browser's download history (`Ctrl+J` on Windows, `Cmd+J`
  on Mac) to find where it saved.
