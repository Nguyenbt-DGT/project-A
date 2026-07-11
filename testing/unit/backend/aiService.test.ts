import { afterEach, describe, expect, it } from "vitest"
import { aiConfig, AIGenerationError, generateLessonPlan, validateShape } from "../../../backend/src/services/aiService.js"

const originalProvider = aiConfig.provider

afterEach(() => {
  aiConfig.provider = originalProvider
})

describe("generateLessonPlan (mock provider)", () => {
  it("returns exactly num_activities activities", async () => {
    aiConfig.provider = "mock"
    const result = await generateLessonPlan({
      ageFrom: 3,
      ageTo: 9,
      concept: "Colors of fruits",
      numActivities: 4,
      activityDurationMin: 10,
      totalLessonTimeMin: null,
    })
    expect(result.activities).toHaveLength(4)
    expect(result.activities.every((activity) => activity.duration_min === 10)).toBe(true)
    for (const key of ["title", "warm_up", "concept_explanation", "closing"] as const) {
      expect(result[key]).toBeTruthy()
    }
  })

  it("mentions pacing when total time is given", async () => {
    aiConfig.provider = "mock"
    const result = await generateLessonPlan({
      ageFrom: 3,
      ageTo: 9,
      concept: "Shapes",
      numActivities: 2,
      activityDurationMin: 5,
      totalLessonTimeMin: 20,
    })
    expect(result.closing).toContain("20-minute")
  })

  it("omits pacing note when no total time is given", async () => {
    aiConfig.provider = "mock"
    const result = await generateLessonPlan({
      ageFrom: 3,
      ageTo: 9,
      concept: "Shapes",
      numActivities: 2,
      activityDurationMin: 5,
      totalLessonTimeMin: null,
    })
    expect(result.closing).not.toContain("-minute lesson")
  })

  it("raises for an unsupported provider", async () => {
    aiConfig.provider = "bogus"
    await expect(
      generateLessonPlan({
        ageFrom: 3,
        ageTo: 9,
        concept: "x",
        numActivities: 1,
        activityDurationMin: 5,
        totalLessonTimeMin: null,
      })
    ).rejects.toBeInstanceOf(AIGenerationError)
  })
})

describe("validateShape", () => {
  it("rejects wrong activity count", () => {
    expect(() =>
      validateShape(
        {
          title: "t",
          warm_up: "w",
          concept_explanation: "c",
          activities: [{ name: "a", rule: "r", duration_min: 5 }],
          closing: "cl",
        },
        2
      )
    ).toThrow()
  })

  it("rejects missing keys", () => {
    expect(() => validateShape({ title: "t" }, 1)).toThrow()
  })

  it("accepts a correct payload", () => {
    const data = {
      title: "t",
      warm_up: "w",
      concept_explanation: "c",
      activities: [{ name: "a", rule: "r", duration_min: 5 }],
      closing: "cl",
    }
    expect(() => validateShape(data, 1)).not.toThrow()
  })
})
