import { Router, type Request, type Response } from "express"
import { prisma } from "../db.js"
import { lessonPlanCreateSchema } from "../schemas/lessonPlan.js"
import { AIGenerationError, generateLessonPlan } from "../services/aiService.js"
import { renderLessonPlanHtml } from "../services/renderService.js"

export const lessonPlansRouter = Router()

lessonPlansRouter.post("/api/lesson-plans", async (req: Request, res: Response) => {
  const parsed = lessonPlanCreateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(422).json({
      detail: parsed.error.issues.map((issue) => ({ msg: issue.message, loc: issue.path })),
    })
  }
  const payload = parsed.data

  let aiResult
  try {
    aiResult = await generateLessonPlan({
      ageFrom: payload.age_from,
      ageTo: payload.age_to,
      concept: payload.concept,
      numActivities: payload.num_activities,
      activityDurationMin: payload.activity_duration_min,
      totalLessonTimeMin: payload.total_lesson_time_min,
    })
  } catch (exc) {
    if (exc instanceof AIGenerationError) {
      console.error("AI generation failed:", exc.message)
      return res.status(502).json({ detail: "AI generation failed, please retry" })
    }
    throw exc
  }

  const generatedHtml = renderLessonPlanHtml({
    plan: aiResult,
    ageFrom: payload.age_from,
    ageTo: payload.age_to,
    totalLessonTimeMin: payload.total_lesson_time_min,
    videoLinks: payload.video_links,
    imageUrl: payload.image_url,
  })

  const lessonPlan = await prisma.lessonPlan.create({
    data: {
      ageFrom: payload.age_from,
      ageTo: payload.age_to,
      concept: payload.concept,
      numActivities: payload.num_activities,
      activityDurationMin: payload.activity_duration_min,
      totalLessonTimeMin: payload.total_lesson_time_min ?? null,
      videoLinks: payload.video_links,
      imageUrl: payload.image_url ?? null,
      generatedHtml,
    },
  })

  return res.status(201).json({
    id: lessonPlan.id,
    generated_html: lessonPlan.generatedHtml,
    created_at: lessonPlan.createdAt,
  })
})

lessonPlansRouter.get("/api/lesson-plans/:id", async (req: Request, res: Response) => {
  const lessonPlan = await prisma.lessonPlan.findUnique({ where: { id: req.params.id } })
  if (!lessonPlan) {
    return res.status(404).json({ detail: "Lesson plan not found" })
  }
  return res.status(200).json({
    id: lessonPlan.id,
    generated_html: lessonPlan.generatedHtml,
    created_at: lessonPlan.createdAt,
  })
})
