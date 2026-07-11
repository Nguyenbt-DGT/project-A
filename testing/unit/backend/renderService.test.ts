import { describe, expect, it } from "vitest"
import { renderLessonPlanHtml, type LessonPlanContent } from "../../../backend/src/services/renderService.js"

const PLAN: LessonPlanContent = {
  title: "Fruit Colors",
  warm_up: "Say hello",
  concept_explanation: "Fruits have colors",
  activities: [{ name: "Match Game", rule: "Match fruit to color", duration_min: 10 }],
  closing: "Great job everyone",
}

function render(overrides: Partial<Parameters<typeof renderLessonPlanHtml>[0]> = {}) {
  return renderLessonPlanHtml({
    plan: PLAN,
    ageFrom: 3,
    ageTo: 9,
    totalLessonTimeMin: null,
    videoLinks: [],
    imageUrl: null,
    ...overrides,
  })
}

describe("renderLessonPlanHtml", () => {
  it("omits the video section when there are no links", () => {
    expect(render()).not.toContain("Video Resources")
  })

  it("includes video links as clickable anchors", () => {
    const html = render({ videoLinks: ["https://youtube.com/watch?v=abc"] })
    expect(html).toContain("Video Resources")
    expect(html).toContain('<a href="https://youtube.com/watch?v=abc"')
    expect(html).toContain('target="_blank"')
  })

  it("omits the image block when there is no image", () => {
    expect(render()).not.toContain("<img")
  })

  it("includes the image when provided", () => {
    const html = render({ imageUrl: "https://example.com/pic.png" })
    expect(html).toContain('src="https://example.com/pic.png"')
  })

  it("escapes AI-generated content to prevent XSS", () => {
    const html = render({ plan: { ...PLAN, title: "<script>alert(1)</script>" } })
    expect(html).not.toContain("<script>alert(1)</script>")
    expect(html).toContain("&lt;script&gt;")
  })

  it("shows the total time pill when provided", () => {
    expect(render({ totalLessonTimeMin: 30 })).toContain("Total time: 30 min")
  })

  it("omits the total time pill when not provided", () => {
    expect(render()).not.toContain("Total time:")
  })

  it("reflects the age range and activity duration", () => {
    const html = render({ ageFrom: 4, ageTo: 7 })
    expect(html).toContain("Ages 4-7")
    expect(html).toContain("10 min")
  })

  it("is standalone with no external dependencies", () => {
    const html = render()
    expect(html).toContain("<style>")
    expect(html).not.toContain("<link ")
    expect(html).not.toContain("<script ")
  })
})
