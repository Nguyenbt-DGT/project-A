import type { LessonPlanCreateRequest, LessonPlanResponse, UploadResponse } from "@/types/lessonPlan"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"

export class ApiError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.status = status
    this.detail = detail
  }
}

async function parseErrorDetail(response: Response): Promise<string> {
  try {
    const data = await response.json()
    if (typeof data?.detail === "string") return data.detail
    if (Array.isArray(data?.detail)) {
      return data.detail
        .map((issue: { msg?: string }) => issue.msg)
        .filter(Boolean)
        .join(", ")
    }
  } catch {
    // response body was not JSON; fall through to the default message
  }
  return "Something went wrong. Please try again."
}

export async function uploadImage(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_BASE_URL}/api/uploads`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorDetail(response))
  }

  return response.json()
}

export async function createLessonPlan(payload: LessonPlanCreateRequest): Promise<LessonPlanResponse> {
  const response = await fetch(`${API_BASE_URL}/api/lesson-plans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorDetail(response))
  }

  return response.json()
}

export async function getLessonPlan(id: string): Promise<LessonPlanResponse> {
  const response = await fetch(`${API_BASE_URL}/api/lesson-plans/${id}`)

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorDetail(response))
  }

  return response.json()
}
