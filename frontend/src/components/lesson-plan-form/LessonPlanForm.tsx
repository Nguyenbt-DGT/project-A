import { useId, useState, type ChangeEvent, type FormEvent } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useGenerateLessonPlan } from "@/hooks/useGenerateLessonPlan"
import { parseVideoLinks, validateLessonPlanForm, type LessonPlanFormValues } from "@/lib/lessonPlanValidation"
import type { LessonPlanResponse } from "@/types/lessonPlan"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"]

type FormState = LessonPlanFormValues

const INITIAL_STATE: FormState = {
  ageFrom: "3",
  ageTo: "9",
  concept: "",
  numActivities: "3",
  activityDurationMin: "10",
  totalLessonTimeMin: "",
  videoLinksText: "",
}

interface LessonPlanFormProps {
  onGenerated: (plan: LessonPlanResponse) => void
}

export function LessonPlanForm({ onGenerated }: LessonPlanFormProps) {
  const formId = useId()
  const [form, setForm] = useState<FormState>(INITIAL_STATE)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { generate, isGenerating } = useGenerateLessonPlan()

  function updateField(field: keyof FormState) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }))
    }
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    if (!file) {
      setImageFile(null)
      setImageError(null)
      return
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageFile(null)
      setImageError("Please upload a PNG, JPEG or WEBP image.")
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageFile(null)
      setImageError("Image must be 5MB or smaller.")
      return
    }
    setImageFile(file)
    setImageError(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const validationErrors = validateLessonPlanForm(form, imageError)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      return
    }

    try {
      const plan = await generate({
        ageFrom: Number(form.ageFrom),
        ageTo: Number(form.ageTo),
        concept: form.concept.trim(),
        numActivities: Number(form.numActivities),
        activityDurationMin: Number(form.activityDurationMin),
        totalLessonTimeMin: form.totalLessonTimeMin ? Number(form.totalLessonTimeMin) : undefined,
        videoLinks: parseVideoLinks(form.videoLinksText),
        imageFile: imageFile ?? undefined,
      })
      toast.success("Lesson plan generated! Your download has started.")
      onGenerated(plan)
    } catch {
      toast.error("We couldn't generate your lesson plan. Please try again.")
    }
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Build your lesson plan</CardTitle>
        <CardDescription>
          Tell us about your class and we'll put together a ready-to-teach plan in under a minute.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${formId}-age-from`}>Learner age (from)</Label>
              <Input
                id={`${formId}-age-from`}
                type="number"
                min={3}
                max={9}
                value={form.ageFrom}
                onChange={updateField("ageFrom")}
                aria-invalid={Boolean(errors.ageFrom)}
              />
              {errors.ageFrom && <p className="text-xs text-destructive">{errors.ageFrom}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${formId}-age-to`}>Learner age (to)</Label>
              <Input
                id={`${formId}-age-to`}
                type="number"
                min={3}
                max={9}
                value={form.ageTo}
                onChange={updateField("ageTo")}
                aria-invalid={Boolean(errors.ageTo)}
              />
              {errors.ageTo && <p className="text-xs text-destructive">{errors.ageTo}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${formId}-concept`}>Concept to teach</Label>
            <Textarea
              id={`${formId}-concept`}
              placeholder="e.g. Colors of fruits"
              value={form.concept}
              onChange={updateField("concept")}
              maxLength={300}
              aria-invalid={Boolean(errors.concept)}
            />
            {errors.concept && <p className="text-xs text-destructive">{errors.concept}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${formId}-num-activities`}>Number of activities</Label>
              <Input
                id={`${formId}-num-activities`}
                type="number"
                min={1}
                max={10}
                value={form.numActivities}
                onChange={updateField("numActivities")}
                aria-invalid={Boolean(errors.numActivities)}
              />
              {errors.numActivities && <p className="text-xs text-destructive">{errors.numActivities}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${formId}-activity-duration`}>Time per activity (min)</Label>
              <Input
                id={`${formId}-activity-duration`}
                type="number"
                min={1}
                max={60}
                value={form.activityDurationMin}
                onChange={updateField("activityDurationMin")}
                aria-invalid={Boolean(errors.activityDurationMin)}
              />
              {errors.activityDurationMin && (
                <p className="text-xs text-destructive">{errors.activityDurationMin}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${formId}-total-time`}>Total lesson time (min) - optional</Label>
            <Input
              id={`${formId}-total-time`}
              type="number"
              min={5}
              max={180}
              placeholder="e.g. 30"
              value={form.totalLessonTimeMin}
              onChange={updateField("totalLessonTimeMin")}
              aria-invalid={Boolean(errors.totalLessonTimeMin)}
            />
            {errors.totalLessonTimeMin && (
              <p className="text-xs text-destructive">{errors.totalLessonTimeMin}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${formId}-video-links`}>Video clip links - optional</Label>
            <Textarea
              id={`${formId}-video-links`}
              placeholder={"One per line, e.g.\nhttps://youtube.com/watch?v=..."}
              value={form.videoLinksText}
              onChange={updateField("videoLinksText")}
              aria-invalid={Boolean(errors.videoLinksText)}
            />
            {errors.videoLinksText && <p className="text-xs text-destructive">{errors.videoLinksText}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${formId}-image`}>Picture - optional</Label>
            <Input
              id={`${formId}-image`}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              aria-invalid={Boolean(errors.image)}
            />
            {imageFile && !errors.image && (
              <p className="text-xs text-muted-foreground">Selected: {imageFile.name}</p>
            )}
            {errors.image && <p className="text-xs text-destructive">{errors.image}</p>}
          </div>

          <Button type="submit" size="lg" className="mt-2 self-start" disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate Lesson Plan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
