import { useCallback, useState } from "react"
import { ApiError, createLessonPlan, uploadImage } from "@/lib/api"
import type { LessonPlanCreateRequest, LessonPlanResponse } from "@/types/lessonPlan"

interface GenerateInput {
  ageFrom: number
  ageTo: number
  concept: string
  numActivities: number
  activityDurationMin: number
  totalLessonTimeMin?: number
  videoLinks: string[]
  imageFile?: File
}

export function useGenerateLessonPlan() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [lessonPlan, setLessonPlan] = useState<LessonPlanResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (input: GenerateInput) => {
    setIsGenerating(true)
    setError(null)
    try {
      let imageUrl: string | undefined
      if (input.imageFile) {
        const uploaded = await uploadImage(input.imageFile)
        imageUrl = uploaded.url
      }

      const payload: LessonPlanCreateRequest = {
        age_from: input.ageFrom,
        age_to: input.ageTo,
        concept: input.concept,
        num_activities: input.numActivities,
        activity_duration_min: input.activityDurationMin,
        total_lesson_time_min: input.totalLessonTimeMin,
        video_links: input.videoLinks,
        image_url: imageUrl,
      }

      const result = await createLessonPlan(payload)
      setLessonPlan(result)
      return result
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.detail
          : "Could not reach the server. Please check your connection and try again."
      setError(message)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const reset = useCallback(() => {
    setLessonPlan(null)
    setError(null)
  }, [])

  return { generate, isGenerating, lessonPlan, error, reset }
}
