import { describe, expect, it } from "vitest"
import {
  isValidUrl,
  parseVideoLinks,
  validateLessonPlanForm,
  type LessonPlanFormValues,
} from "@/lib/lessonPlanValidation"

function validForm(overrides: Partial<LessonPlanFormValues> = {}): LessonPlanFormValues {
  return {
    ageFrom: "3",
    ageTo: "9",
    concept: "Colors of fruits",
    numActivities: "3",
    activityDurationMin: "10",
    totalLessonTimeMin: "",
    videoLinksText: "",
    ...overrides,
  }
}

describe("parseVideoLinks", () => {
  it("splits on commas and newlines and trims whitespace", () => {
    expect(parseVideoLinks("https://a.com, https://b.com\nhttps://c.com")).toEqual([
      "https://a.com",
      "https://b.com",
      "https://c.com",
    ])
  })

  it("drops blank entries", () => {
    expect(parseVideoLinks("https://a.com,,  \n")).toEqual(["https://a.com"])
  })
})

describe("isValidUrl", () => {
  it("accepts http and https URLs", () => {
    expect(isValidUrl("https://youtube.com/watch?v=1")).toBe(true)
    expect(isValidUrl("http://example.com")).toBe(true)
  })

  it("rejects non-URL strings", () => {
    expect(isValidUrl("not-a-url")).toBe(false)
    expect(isValidUrl("ftp://example.com")).toBe(false)
  })
})

describe("validateLessonPlanForm", () => {
  it("passes for a fully valid form", () => {
    expect(validateLessonPlanForm(validForm(), null)).toEqual({})
  })

  it("requires age between 3 and 9", () => {
    const errors = validateLessonPlanForm(validForm({ ageFrom: "2" }), null)
    expect(errors.ageFrom).toBeDefined()
  })

  it("requires ageTo to be >= ageFrom", () => {
    const errors = validateLessonPlanForm(validForm({ ageFrom: "8", ageTo: "4" }), null)
    expect(errors.ageTo).toBeDefined()
  })

  it("requires a non-empty concept under 300 chars", () => {
    expect(validateLessonPlanForm(validForm({ concept: "" }), null).concept).toBeDefined()
    expect(validateLessonPlanForm(validForm({ concept: "x".repeat(301) }), null).concept).toBeDefined()
  })

  it("requires num_activities between 1 and 10", () => {
    expect(validateLessonPlanForm(validForm({ numActivities: "0" }), null).numActivities).toBeDefined()
    expect(validateLessonPlanForm(validForm({ numActivities: "11" }), null).numActivities).toBeDefined()
  })

  it("requires activity duration between 1 and 60", () => {
    expect(
      validateLessonPlanForm(validForm({ activityDurationMin: "0" }), null).activityDurationMin
    ).toBeDefined()
    expect(
      validateLessonPlanForm(validForm({ activityDurationMin: "61" }), null).activityDurationMin
    ).toBeDefined()
  })

  it("treats total lesson time as optional but validates range when provided", () => {
    expect(
      validateLessonPlanForm(validForm({ totalLessonTimeMin: "" }), null).totalLessonTimeMin
    ).toBeUndefined()
    expect(
      validateLessonPlanForm(validForm({ totalLessonTimeMin: "4" }), null).totalLessonTimeMin
    ).toBeDefined()
    expect(
      validateLessonPlanForm(validForm({ totalLessonTimeMin: "30" }), null).totalLessonTimeMin
    ).toBeUndefined()
  })

  it("rejects malformed video links", () => {
    const errors = validateLessonPlanForm(validForm({ videoLinksText: "not-a-link" }), null)
    expect(errors.videoLinksText).toBeDefined()
  })

  it("surfaces an externally-provided image error", () => {
    const errors = validateLessonPlanForm(validForm(), "Image must be 5MB or smaller.")
    expect(errors.image).toBe("Image must be 5MB or smaller.")
  })
})
