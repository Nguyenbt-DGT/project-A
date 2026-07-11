import { useState } from "react"
import heroImg from "@/assets/hero.png"
import { LessonPlanForm } from "@/components/lesson-plan-form/LessonPlanForm"
import { LessonPlanView } from "@/components/lesson-plan-view/LessonPlanView"
import { downloadHtml } from "@/lib/downloadHtml"
import type { LessonPlanResponse } from "@/types/lessonPlan"

export function HomePage() {
  const [lessonPlan, setLessonPlan] = useState<LessonPlanResponse | null>(null)

  function handleGenerated(plan: LessonPlanResponse) {
    setLessonPlan(plan)
    downloadHtml(plan.generated_html, "lesson-plan.html")
  }

  return (
    <main className="min-h-screen bg-background bg-noise px-4 py-12">
      <div className="mx-auto mb-10 flex max-w-3xl flex-col items-center gap-4 text-center">
        <img src={heroImg} alt="" className="h-28 w-auto" />
        <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          AI Lesson Plan Builder
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Describe a teaching concept and get a polished, printable lesson plan for ages 3-9 - ready
          to download in under a minute.
        </p>
      </div>

      {lessonPlan ? (
        <LessonPlanView lessonPlan={lessonPlan} onStartOver={() => setLessonPlan(null)} />
      ) : (
        <LessonPlanForm onGenerated={handleGenerated} />
      )}
    </main>
  )
}
