export interface LessonPlanFormValues {
  ageFrom: string
  ageTo: string
  concept: string
  numActivities: string
  activityDurationMin: string
  totalLessonTimeMin: string
  videoLinksText: string
}

export function parseVideoLinks(text: string): string[] {
  return text
    .split(/[\n,]/)
    .map((link) => link.trim())
    .filter(Boolean)
}

export function isValidUrl(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value)
}

export function validateLessonPlanForm(
  form: LessonPlanFormValues,
  imageError: string | null
): Record<string, string> {
  const errors: Record<string, string> = {}

  const ageFrom = Number(form.ageFrom)
  const ageTo = Number(form.ageTo)
  if (!form.ageFrom || Number.isNaN(ageFrom) || ageFrom < 3 || ageFrom > 9) {
    errors.ageFrom = "Enter an age from 3 to 9."
  }
  if (!form.ageTo || Number.isNaN(ageTo) || ageTo < 3 || ageTo > 9) {
    errors.ageTo = "Enter an age from 3 to 9."
  }
  if (!errors.ageFrom && !errors.ageTo && ageTo < ageFrom) {
    errors.ageTo = "'To' age must be the same or older than 'from' age."
  }

  const concept = form.concept.trim()
  if (!concept) {
    errors.concept = "Describe the concept you want to teach."
  } else if (concept.length > 300) {
    errors.concept = "Keep the concept under 300 characters."
  }

  const numActivities = Number(form.numActivities)
  if (!form.numActivities || Number.isNaN(numActivities) || numActivities < 1 || numActivities > 10) {
    errors.numActivities = "Choose between 1 and 10 activities."
  }

  const activityDurationMin = Number(form.activityDurationMin)
  if (
    !form.activityDurationMin ||
    Number.isNaN(activityDurationMin) ||
    activityDurationMin < 1 ||
    activityDurationMin > 60
  ) {
    errors.activityDurationMin = "Enter a duration between 1 and 60 minutes."
  }

  if (form.totalLessonTimeMin) {
    const totalLessonTimeMin = Number(form.totalLessonTimeMin)
    if (Number.isNaN(totalLessonTimeMin) || totalLessonTimeMin < 5 || totalLessonTimeMin > 180) {
      errors.totalLessonTimeMin = "Total lesson time must be between 5 and 180 minutes."
    }
  }

  const invalidLink = parseVideoLinks(form.videoLinksText).find((link) => !isValidUrl(link))
  if (invalidLink) {
    errors.videoLinksText = `"${invalidLink}" doesn't look like a valid link (must start with http:// or https://).`
  }

  if (imageError) {
    errors.image = imageError
  }

  return errors
}
