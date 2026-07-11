import { afterEach, describe, expect, it, vi } from "vitest"
import { ApiError, createLessonPlan, getLessonPlan, uploadImage } from "@/lib/api"

function mockFetchOnce(response: Partial<Response> & { ok: boolean }) {
  const fetchMock = vi.fn().mockResolvedValue(response as Response)
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

describe("api client", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("createLessonPlan posts JSON and returns the parsed response", async () => {
    const body = { id: "1", generated_html: "<html></html>", created_at: "2026-01-01T00:00:00Z" }
    const fetchMock = mockFetchOnce({ ok: true, json: async () => body } as Response)

    const result = await createLessonPlan({
      age_from: 3,
      age_to: 9,
      concept: "Colors",
      num_activities: 2,
      activity_duration_min: 10,
      video_links: [],
    })

    expect(result).toEqual(body)
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain("/api/lesson-plans")
    expect(options.method).toBe("POST")
    expect((options.headers as Record<string, string>)["Content-Type"]).toBe("application/json")
  })

  it("createLessonPlan throws ApiError with the server detail on failure", async () => {
    mockFetchOnce({
      ok: false,
      status: 422,
      json: async () => ({ detail: "age_to must be >= age_from" }),
    } as Response)

    await expect(
      createLessonPlan({
        age_from: 8,
        age_to: 4,
        concept: "Colors",
        num_activities: 2,
        activity_duration_min: 10,
        video_links: [],
      })
    ).rejects.toMatchObject({ status: 422, detail: "age_to must be >= age_from" })
  })

  it("uploadImage posts multipart form data", async () => {
    const fetchMock = mockFetchOnce({ ok: true, json: async () => ({ url: "https://x/y.png" }) } as Response)
    const file = new File(["abc"], "pic.png", { type: "image/png" })

    const result = await uploadImage(file)

    expect(result.url).toBe("https://x/y.png")
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(options.body).toBeInstanceOf(FormData)
  })

  it("getLessonPlan fetches by id", async () => {
    const body = { id: "42", generated_html: "<html></html>", created_at: "2026-01-01T00:00:00Z" }
    const fetchMock = mockFetchOnce({ ok: true, json: async () => body } as Response)

    const result = await getLessonPlan("42")

    expect(result).toEqual(body)
    expect((fetchMock.mock.calls[0] as [string])[0]).toContain("/api/lesson-plans/42")
  })

  it("falls back to a generic message when the error body is not JSON", async () => {
    mockFetchOnce({
      ok: false,
      status: 502,
      json: async () => {
        throw new Error("not json")
      },
    } as Response)

    await expect(getLessonPlan("missing")).rejects.toBeInstanceOf(ApiError)
  })
})
