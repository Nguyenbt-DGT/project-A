// Regression suite guarding the edge cases listed in document/BUSINESS_ANALYST.md.
// Re-run this suite before every release alongside the unit suite.

import type { AddressInfo } from "node:net"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("../../../backend/src/db.js", () => ({
  prisma: {
    lessonPlan: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

vi.mock("../../../backend/src/services/aiService.js", async () => {
  const actual = await vi.importActual<typeof import("../../../backend/src/services/aiService.js")>(
    "../../../backend/src/services/aiService.js"
  )
  return {
    ...actual,
    generateLessonPlan: vi.fn(actual.generateLessonPlan),
  }
})

const { aiConfig, generateLessonPlan, AIGenerationError } = await import(
  "../../../backend/src/services/aiService.js"
)
const { renderLessonPlanHtml } = await import("../../../backend/src/services/renderService.js")
const { lessonPlanCreateSchema } = await import("../../../backend/src/schemas/lessonPlan.js")
const { createApp } = await import("../../../backend/src/app.js")
const { prisma } = await import("../../../backend/src/db.js")
const actualAiService = await vi.importActual<typeof import("../../../backend/src/services/aiService.js")>(
  "../../../backend/src/services/aiService.js"
)

const PLAN = {
  title: "Fruit Colors",
  warm_up: "Say hello",
  concept_explanation: "Fruits have colors",
  activities: [{ name: "Match Game", rule: "Match fruit to color", duration_min: 10 }],
  closing: "Great job everyone",
}

const originalProvider = aiConfig.provider

afterEach(() => {
  aiConfig.provider = originalProvider
  vi.mocked(generateLessonPlan).mockReset()
  vi.mocked(generateLessonPlan).mockImplementation(actualAiService.generateLessonPlan)
  vi.mocked(prisma.lessonPlan.create).mockReset()
})

describe("BA edge cases", () => {
  it("omits the Video Resources section when there is no video link", () => {
    const html = renderLessonPlanHtml({
      plan: PLAN,
      ageFrom: 3,
      ageTo: 9,
      totalLessonTimeMin: null,
      videoLinks: [],
      imageUrl: null,
    })
    expect(html).not.toContain("Video Resources")
  })

  it("omits the image block when there is no picture", () => {
    const html = renderLessonPlanHtml({
      plan: PLAN,
      ageFrom: 3,
      ageTo: 9,
      totalLessonTimeMin: null,
      videoLinks: [],
      imageUrl: null,
    })
    expect(html).not.toContain("<img")
  })

  it("still generates without error when total time is inconsistent with activities x duration", async () => {
    aiConfig.provider = "mock"
    const result = await generateLessonPlan({
      ageFrom: 3,
      ageTo: 9,
      concept: "Numbers",
      numActivities: 5,
      activityDurationMin: 20,
      totalLessonTimeMin: 10,
    })
    expect(result.activities).toHaveLength(5)
  })

  it("maps an AI generation failure to 502 with no partial save", async () => {
    vi.mocked(generateLessonPlan).mockRejectedValue(new AIGenerationError("provider timed out"))

    const app = createApp()
    const server = app.listen(0)
    try {
      const { port } = server.address() as AddressInfo
      const response = await fetch(`http://127.0.0.1:${port}/api/lesson-plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age_from: 3,
          age_to: 9,
          concept: "Colors",
          num_activities: 2,
          activity_duration_min: 10,
        }),
      })

      expect(response.status).toBe(502)
      expect(prisma.lessonPlan.create).not.toHaveBeenCalled()
    } finally {
      server.close()
    }
  })

  it.each([
    [3, 9],
    [5, 5],
    [3, 3],
    [9, 9],
  ])("accepts age range bounds (%d, %d)", (age_from, age_to) => {
    const plan = lessonPlanCreateSchema.parse({
      age_from,
      age_to,
      concept: "Colors",
      num_activities: 1,
      activity_duration_min: 10,
    })
    expect(plan.age_from).toBe(age_from)
    expect(plan.age_to).toBe(age_to)
  })

  it("keeps total_lesson_time_min optional", () => {
    const plan = lessonPlanCreateSchema.parse({
      age_from: 3,
      age_to: 9,
      concept: "Colors",
      num_activities: 1,
      activity_duration_min: 10,
    })
    expect(plan.total_lesson_time_min ?? null).toBeNull()
  })
})
