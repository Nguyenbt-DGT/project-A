import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { downloadHtml } from "@/lib/downloadHtml"

describe("downloadHtml", () => {
  let createObjectURL: ReturnType<typeof vi.fn>
  let revokeObjectURL: ReturnType<typeof vi.fn>
  let clickSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    createObjectURL = vi.fn(() => "blob:mock-url")
    revokeObjectURL = vi.fn()
    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL
    clickSpy = vi.fn()
    HTMLAnchorElement.prototype.click = clickSpy
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("creates a text/html blob and triggers a download via a temporary anchor", () => {
    downloadHtml("<html></html>", "lesson-plan.html")

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    const [blob] = createObjectURL.mock.calls[0] as [Blob]
    expect(blob.type).toBe("text/html")
    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url")
  })

  it("does not leave the temporary anchor in the document", () => {
    downloadHtml("<html></html>", "lesson-plan.html")
    const anchors = document.querySelectorAll('a[download="lesson-plan.html"]')
    expect(anchors.length).toBe(0)
  })
})
