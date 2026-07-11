import { describe, expect, it } from "vitest"
import { lessonPlanCreateSchema } from "../../../backend/src/schemas/lessonPlan.js"

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    age_from: 3,
    age_to: 9,
    concept: "Colors of fruits",
    num_activities: 3,
    activity_duration_min: 10,
    ...overrides,
  }
}

describe("lessonPlanCreateSchema", () => {
  it("accepts minimal required fields", () => {
    const plan = lessonPlanCreateSchema.parse(validPayload())
    expect(plan.total_lesson_time_min ?? null).toBeNull()
    expect(plan.video_links).toEqual([])
    expect(plan.image_url ?? null).toBeNull()
  })

  it("rejects age_to below age_from", () => {
    expect(() => lessonPlanCreateSchema.parse(validPayload({ age_from: 8, age_to: 4 }))).toThrow()
  })

  it.each([
    [2, 9],
    [3, 10],
    [0, 3],
  ])("rejects ages outside 3 to 9 (%d, %d)", (age_from, age_to) => {
    expect(() => lessonPlanCreateSchema.parse(validPayload({ age_from, age_to }))).toThrow()
  })

  it("rejects concept over 300 chars", () => {
    expect(() => lessonPlanCreateSchema.parse(validPayload({ concept: "x".repeat(301) }))).toThrow()
  })

  it("rejects empty concept", () => {
    expect(() => lessonPlanCreateSchema.parse(validPayload({ concept: "" }))).toThrow()
  })

  it.each([0, 11])("rejects num_activities out of range (%d)", (num_activities) => {
    expect(() => lessonPlanCreateSchema.parse(validPayload({ num_activities }))).toThrow()
  })

  it.each([0, 61])("rejects activity_duration_min out of range (%d)", (activity_duration_min) => {
    expect(() => lessonPlanCreateSchema.parse(validPayload({ activity_duration_min }))).toThrow()
  })

  it("accepts optional total_lesson_time_min in range", () => {
    const plan = lessonPlanCreateSchema.parse(validPayload({ total_lesson_time_min: 30 }))
    expect(plan.total_lesson_time_min).toBe(30)
  })

  it.each([4, 181])("rejects total_lesson_time_min out of range (%d)", (total_lesson_time_min) => {
    expect(() =>
      lessonPlanCreateSchema.parse(validPayload({ total_lesson_time_min }))
    ).toThrow()
  })

  it("rejects an invalid video link", () => {
    expect(() =>
      lessonPlanCreateSchema.parse(validPayload({ video_links: ["not-a-url"] }))
    ).toThrow()
  })

  it("accepts valid video links and strips blank entries", () => {
    const plan = lessonPlanCreateSchema.parse(
      validPayload({ video_links: ["https://youtube.com/watch?v=1", "  ", "http://example.com"] })
    )
    expect(plan.video_links).toEqual(["https://youtube.com/watch?v=1", "http://example.com"])
  })

  it("treats missing video_links as an empty list", () => {
    const plan = lessonPlanCreateSchema.parse(validPayload({ video_links: null }))
    expect(plan.video_links).toEqual([])
  })
})
