import { z } from "zod"

export const lessonPlanCreateSchema = z
  .object({
    age_from: z.number().int().min(3).max(9),
    age_to: z.number().int().min(3).max(9),
    concept: z.string().min(1).max(300),
    num_activities: z.number().int().min(1).max(10),
    activity_duration_min: z.number().int().min(1).max(60),
    total_lesson_time_min: z.number().int().min(5).max(180).optional().nullable(),
    video_links: z
      .array(z.string())
      .optional()
      .nullable()
      .transform((links) => (links ?? []).map((link) => link.trim()).filter((link) => link.length > 0))
      .refine((links) => links.every((link) => link.startsWith("http://") || link.startsWith("https://")), {
        message: "video_links must only contain http:// or https:// URLs",
      }),
    image_url: z.string().optional().nullable(),
  })
  .refine((data) => data.age_to >= data.age_from, {
    message: "age_to must be greater than or equal to age_from",
    path: ["age_to"],
  })

export type LessonPlanCreate = z.infer<typeof lessonPlanCreateSchema>
