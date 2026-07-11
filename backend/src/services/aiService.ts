import type { LessonPlanContent } from "./renderService.js"

const MAX_TOKENS_BASE = 300
const MAX_TOKENS_PER_ACTIVITY = 150

export const aiConfig = {
  provider: process.env.AI_PROVIDER ?? "mock",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
}

export class AIGenerationError extends Error {}

export interface GenerateLessonPlanArgs {
  ageFrom: number
  ageTo: number
  concept: string
  numActivities: number
  activityDurationMin: number
  totalLessonTimeMin: number | null | undefined
}

function systemPrompt({
  ageFrom,
  ageTo,
  numActivities,
  activityDurationMin,
  totalLessonTimeMin,
}: GenerateLessonPlanArgs): string {
  const pacingNote = totalLessonTimeMin
    ? ` Keep the warm-up, activities and closing roughly within a total of ` +
      `${totalLessonTimeMin} minutes, and mention the pacing in the closing section.`
    : ""
  return (
    `You are writing a lesson plan for learners aged ${ageFrom}-${ageTo} years old, ` +
    "English language class. Use simple vocabulary, short sentences and an encouraging, " +
    "warm tone appropriate for early-childhood education. " +
    `Produce exactly ${numActivities} activities, each a simple, safe, classroom-friendly game ` +
    `feasible within ${activityDurationMin} minutes.${pacingNote} ` +
    "Never include violent, scary, or inappropriate themes, never ask learners for personal " +
    "information, and describe any physical activity as low-risk and indoor-classroom-safe. " +
    "If the requested concept is nonsensical or unsafe, still return a best-effort generic, " +
    "safe lesson plan rather than refusing. " +
    "Do not invent or reference video links or images - those are added separately, not by you. " +
    "Respond with strict JSON only, matching this shape exactly: " +
    '{"title": string, "warm_up": string, "concept_explanation": string, ' +
    '"activities": [{"name": string, "rule": string, "duration_min": number}], "closing": string}. ' +
    `The 'activities' array must contain exactly ${numActivities} items.`
  )
}

function userPrompt(concept: string): string {
  return `Teaching concept: ${concept}`
}

function maxTokens(numActivities: number): number {
  return MAX_TOKENS_BASE + MAX_TOKENS_PER_ACTIVITY * numActivities
}

export async function generateLessonPlan(args: GenerateLessonPlanArgs): Promise<LessonPlanContent> {
  if (aiConfig.provider === "mock") {
    return mockGenerate(args)
  }
  if (aiConfig.provider === "openai") {
    return openaiGenerate(args)
  }
  throw new AIGenerationError(`Unsupported AI_PROVIDER '${aiConfig.provider}'`)
}

function mockGenerate({
  ageFrom,
  ageTo,
  concept,
  numActivities,
  activityDurationMin,
  totalLessonTimeMin,
}: GenerateLessonPlanArgs): LessonPlanContent {
  const activities = Array.from({ length: numActivities }, (_, i) => ({
    name: `Activity ${i + 1}: Explore ${concept}`,
    rule:
      `In small groups, learners take turns pointing to or naming something related to ` +
      `'${concept}'. Everyone claps to celebrate each correct turn.`,
    duration_min: activityDurationMin,
  }))
  const pacing = totalLessonTimeMin
    ? ` We kept everything within our ${totalLessonTimeMin}-minute lesson.`
    : ""
  const trimmedConcept = concept.trim()
  const capitalizedConcept = trimmedConcept.charAt(0).toUpperCase() + trimmedConcept.slice(1)
  return {
    title: `${capitalizedConcept} for Ages ${ageFrom}-${ageTo}`,
    warm_up:
      `Gather learners in a circle and greet each other. Ask a simple question about ` +
      `'${concept}' to get everyone excited and thinking.`,
    concept_explanation:
      `Explain '${concept}' using simple words, pictures and gestures so learners aged ` +
      `${ageFrom}-${ageTo} can easily follow along.`,
    activities,
    closing:
      `Recap what we learned about '${concept}' together, praise everyone's effort, ` +
      `and say goodbye with a friendly cheer.${pacing}`,
  }
}

async function openaiGenerate(args: GenerateLessonPlanArgs): Promise<LessonPlanContent> {
  const { OpenAI } = await import("openai")

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new AIGenerationError("OPENAI_API_KEY is not configured")
  }

  const client = new OpenAI({ apiKey })
  const messages: Array<{ role: "system" | "user"; content: string }> = [
    { role: "system", content: systemPrompt(args) },
    { role: "user", content: userPrompt(args.concept) },
  ]

  for (let attempt = 0; attempt < 2; attempt++) {
    let completion
    try {
      completion = await client.chat.completions.create({
        model: aiConfig.openaiModel,
        messages,
        response_format: { type: "json_object" },
        max_tokens: maxTokens(args.numActivities),
      })
    } catch (exc) {
      const err = exc as { status?: number; name?: string }
      if (err.status === 429) {
        throw new AIGenerationError("Rate limited by AI provider, please try again shortly")
      }
      if (err.name === "APIConnectionTimeoutError") {
        throw new AIGenerationError("AI provider timed out")
      }
      throw new AIGenerationError("AI provider request failed")
    }

    const raw = completion.choices[0]?.message?.content ?? ""
    try {
      const data = JSON.parse(raw)
      validateShape(data, args.numActivities)
      return data as LessonPlanContent
    } catch (exc) {
      messages.push({
        role: "system",
        content:
          "Your previous reply was invalid. Return valid JSON only, " +
          "matching the required shape exactly.",
      })
    }
  }

  throw new AIGenerationError("AI provider returned malformed JSON after retry")
}

export function validateShape(data: unknown, numActivities: number): void {
  if (typeof data !== "object" || data === null) {
    throw new Error("response must be a JSON object")
  }
  const record = data as Record<string, unknown>
  const requiredKeys = ["title", "warm_up", "concept_explanation", "activities", "closing"]
  const missing = requiredKeys.filter((key) => !(key in record))
  if (missing.length > 0) {
    throw new Error(`missing required keys: ${missing.join(", ")}`)
  }
  if (!Array.isArray(record.activities) || record.activities.length !== numActivities) {
    throw new Error("activities must be a list matching num_activities")
  }
  for (const activity of record.activities) {
    if (
      typeof activity !== "object" ||
      activity === null ||
      !("name" in activity) ||
      !("rule" in activity) ||
      !("duration_min" in activity)
    ) {
      throw new Error("each activity requires name, rule and duration_min")
    }
  }
}
