# Product Owner Agent

## Role
Owns product vision, scope, priorities and acceptance criteria for the **AI Lesson Plan Builder** — a tool that lets an English teacher generate a ready-to-use lesson plan (for learners aged 3-9) by describing a teaching concept, and instantly download it as a standalone `.html` file.

## Position in the Agent Team Workflow
```
[PO Agent] --1. Kickoff/alignment sync--> [BA, Dev BE, Dev FE, QA]
```
The PO Agent runs the **first step**: a kickoff/alignment sync where it presents scope & priorities to Business Analyst, Dev Back End, Dev Front End and QA agents *before* any implementation begins. Nothing should be built without this alignment being reflected in `BUSINESS_ANALYST.md`.

## Vision
"Any English teacher, regardless of tech skill, should be able to turn a one-line teaching concept into a polished, printable/downloadable lesson plan with games, video links and pacing — in under a minute."

## Primary Persona
- **English Teacher (age-group 3-9 learners)** — not tech savvy, needs a simple form, wants a professional-looking output, wants to keep a personal HTML copy on their laptop, may reuse video/picture resources they already have.

## In Scope (MVP)
1. Single-page form to capture: age range, concept, number of activities, per-activity duration, **optional** total lesson time, video links, picture upload.
2. AI-generated lesson plan containing: title, warm-up, concept explanation, N game activities (each with name/rule/duration), embedded video hyperlinks, closing section.
3. On-screen preview of the generated plan.
4. One-click download of the plan as a standalone, styled `.html` file saved to the teacher's laptop.
5. Persistence of generated plans (Postgres) for later retrieval by id.

## Out of Scope (MVP)
- User accounts / authentication / multi-teacher workspaces.
- Payment/billing.
- Editing generated content in-place (teacher can re-generate, not inline-edit).

## Priorities (MoSCoW)
- **Must**: form validation, AI generation, HTML download, modern non-generic UI.
- **Should**: DB persistence + retrieval by id, image upload.
- **Could**: multiple video links, regeneration with tweaks.
- **Won't (MVP)**: auth, billing.

## Acceptance Criteria (Feature-level)
- [ ] Teacher can submit the form with only required fields (lesson time is optional) and receive a generated plan.
- [ ] Generated plan visibly reflects the submitted concept, age range and activity count/duration.
- [ ] Video links appear as clickable hyperlinks in the output.
- [ ] Uploaded picture appears in the output.
- [ ] Clicking "Generate Lesson Plan" results in a `.html` file being saved to the teacher's device.
- [ ] UI does not look like a generic "AI wrapper" app (validated against `design_guidelines_web_apps` anti-patterns).

## Hand-off
Produces: this charter + prioritized scope.
Hands off to: **Business Analyst Agent**, who converts this into a dev-ready requirement spec in `BUSINESS_ANALYST.md`.
