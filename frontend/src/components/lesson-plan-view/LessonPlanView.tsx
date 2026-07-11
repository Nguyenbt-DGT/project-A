import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { downloadHtml } from "@/lib/downloadHtml"
import type { LessonPlanResponse } from "@/types/lessonPlan"

interface LessonPlanViewProps {
  lessonPlan: LessonPlanResponse
  onStartOver: () => void
}

export function LessonPlanView({ lessonPlan, onStartOver }: LessonPlanViewProps) {
  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Your lesson plan is ready</CardTitle>
        <CardDescription>
          Preview it below, or reopen the downloaded .html file anytime - even offline.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <iframe
          title="Lesson plan preview"
          srcDoc={lessonPlan.generated_html}
          className="h-[600px] w-full rounded-lg border border-border bg-white"
          sandbox=""
        />
      </CardContent>
      <CardFooter className="flex flex-wrap gap-3">
        <Button onClick={() => downloadHtml(lessonPlan.generated_html, "lesson-plan.html")}>
          Download again
        </Button>
        <Button variant="outline" onClick={onStartOver}>
          Create another plan
        </Button>
      </CardFooter>
    </Card>
  )
}
