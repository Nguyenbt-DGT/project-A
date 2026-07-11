# Business Analyst Agent

## Role
Translates the Product Owner's scope into precise, dev-ready specifications: user stories, input field contracts, output content/HTML spec, and edge cases.

## Position in the Agent Team Workflow
```
[PO Agent] --kickoff sync--> [BA Agent] --2. Requirements handoff--> [Dev BE Agent]
```
The BA Agent receives the aligned scope from the PO Agent (Section "Acceptance Criteria" in `PRODUCT_OWNER.md`) and must produce the artifacts below **before** Dev Back End starts building. Dev Back End is the next hand-off (it builds the API contract first, per Section 3a of the build plan).

## User Stories
1. As a teacher, I want to specify the age range of my learners so the AI adapts vocabulary/complexity.
2. As a teacher, I want to describe my teaching concept in plain language so the AI builds a lesson around it.
3. As a teacher, I want to control how many game activities are generated and how long each lasts, so the plan fits my class schedule.
4. As a teacher, I want to optionally set a total lesson time so the AI paces warm-up/activities/closing within that budget.
5. As a teacher, I want to attach video links so the AI weaves them into the plan as clickable resources.
6. As a teacher, I want to upload a picture so it appears in the printed/downloaded plan.
7. As a teacher, I want to click one button and get a `.html` file saved on my laptop that I can reopen/print/share without internet access.

## Input Field Spec

| Field | Type | Required | Validation |
|---|---|---|---|
| Target learner age (from) | number | Yes | 3–9, `from <= to` |
| Target learner age (to) | number | Yes | 3–9, `to >= from` |
| Concept to teach | text (free-form) | Yes | 1–300 chars |
| Number of game activities | number | Yes | 1–10 |
| Time per activity (minutes) | number | Yes | 1–60 |
| Total lesson time (minutes) | number | **No (optional)** | 5–180 if provided |
| Video clip link(s) | text (URL, comma/newline separated) | No | valid URL format if provided |
| Picture file | file upload (image) | No | image/png, image/jpeg, image/webp, max 5MB |

## Output Spec (Generated Lesson Plan)
A standalone HTML document (inline `<style>`, no external deps) containing, in order:
1. Title (derived from concept + age range)
2. Learner info banner (age range, total time if provided)
3. Warm-up section
4. Concept explanation (age-appropriate language)
5. N activity cards: name, rule/instructions, duration badge
6. Embedded picture (if uploaded)
7. Video resources list (clickable hyperlinks, open in new tab)
8. Closing/wrap-up section

## Edge Cases
- No video link provided → omit "Video Resources" section entirely (no empty section).
- No picture provided → omit image block.
- Total lesson time provided but inconsistent with `activities × duration` → AI should still generate; UI shows a subtle note, not a hard error.
- AI generation failure / timeout → user-facing error toast, no partial/broken download triggered.
- Very long concept text → truncate display in list views only; full text always sent to AI.

## Hand-off
Produces: this spec.
Hands off to: **Dev Back End Agent**, which implements the API contract and AI service against this spec, then hands the published contract to **Dev Front End Agent**.
