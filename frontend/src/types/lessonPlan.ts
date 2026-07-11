export interface LessonPlanActivity {
  name: string
  rule: string
  duration_min: number
}

export interface LessonPlanCreateRequest {
  age_from: number
  age_to: number
  concept: string
  num_activities: number
  activity_duration_min: number
  total_lesson_time_min?: number
  video_links: string[]
  image_url?: string
}

export interface LessonPlanResponse {
  id: string
  generated_html: string
  created_at: string
}

export interface UploadResponse {
  url: string
}
