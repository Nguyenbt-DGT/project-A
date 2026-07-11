export interface LessonPlanActivity {
  name: string
  rule: string
  duration_min: number
}

export interface LessonPlanContent {
  title: string
  warm_up: string
  concept_explanation: string
  activities: LessonPlanActivity[]
  closing: string
}

export interface RenderLessonPlanHtmlOptions {
  plan: LessonPlanContent
  ageFrom: number
  ageTo: number
  totalLessonTimeMin: number | null | undefined
  videoLinks: string[]
  imageUrl: string | null | undefined
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function renderLessonPlanHtml({
  plan,
  ageFrom,
  ageTo,
  totalLessonTimeMin,
  videoLinks,
  imageUrl,
}: RenderLessonPlanHtmlOptions): string {
  const title = escapeHtml(plan.title)
  const warmUp = escapeHtml(plan.warm_up)
  const conceptExplanation = escapeHtml(plan.concept_explanation)
  const closing = escapeHtml(plan.closing)

  const activitiesHtml = plan.activities
    .map(
      (activity) => `
        <div class="activity-card">
          <div class="activity-header">
            <h3>${escapeHtml(activity.name)}</h3>
            <span class="duration-badge">${Math.trunc(activity.duration_min)} min</span>
          </div>
          <p>${escapeHtml(activity.rule)}</p>
        </div>
        `
    )
    .join("\n")

  const totalTimeHtml = totalLessonTimeMin
    ? `<span class="banner-pill">Total time: ${Math.trunc(totalLessonTimeMin)} min</span>`
    : ""

  let imageHtml = ""
  if (imageUrl) {
    const safeImageUrl = escapeHtml(imageUrl)
    imageHtml = `
        <section class="section">
          <img class="lesson-image" src="${safeImageUrl}" alt="Lesson picture" />
        </section>
        `
  }

  let videoHtml = ""
  if (videoLinks.length > 0) {
    const items = videoLinks
      .map(
        (link) =>
          `<li><a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link)}</a></li>`
      )
      .join("\n")
    videoHtml = `
        <section class="section">
          <h2>Video Resources</h2>
          <ul class="video-list">${items}</ul>
        </section>
        `
  }

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>
  :root { color-scheme: light; }
  body { font-family: 'Nunito Sans', Arial, sans-serif; background: #F7F5EF; color: #1B4D3E; margin: 0; padding: 2rem; line-height: 1.6; }
  .sheet { max-width: 760px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; padding: 2.5rem; box-shadow: 0 4px 24px rgba(27,77,62,0.08); }
  h1 { font-family: 'Fredoka', Arial, sans-serif; font-size: 2rem; margin: 0 0 0.5rem; }
  h2 { font-family: 'Fredoka', Arial, sans-serif; font-size: 1.25rem; margin-top: 2rem; color: #1B4D3E; }
  h3 { margin: 0; font-size: 1.05rem; }
  .banner { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
  .banner-pill { background: #EDEAE0; color: #1B4D3E; border-radius: 999px; padding: 0.35rem 0.9rem; font-size: 0.9rem; font-weight: 600; }
  .section { margin-top: 1.75rem; }
  .activity-card { border: 1px solid #DCD6C6; border-radius: 12px; padding: 1rem 1.25rem; margin-top: 0.9rem; }
  .activity-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
  .duration-badge { background: #F88379; color: #fff; border-radius: 999px; padding: 0.2rem 0.7rem; font-size: 0.8rem; font-weight: 700; white-space: nowrap; }
  .lesson-image { max-width: 100%; border-radius: 12px; display: block; }
  .video-list { padding-left: 1.25rem; }
  .video-list a { color: #E56B60; }
  footer { margin-top: 2rem; font-size: 0.85rem; color: #5C6F68; }
</style>
</head>
<body>
  <div class="sheet">
    <h1>${title}</h1>
    <div class="banner">
      <span class="banner-pill">Ages ${ageFrom}-${ageTo}</span>
      ${totalTimeHtml}
    </div>
    <section class="section">
      <h2>Warm-up</h2>
      <p>${warmUp}</p>
    </section>
    <section class="section">
      <h2>Concept Explanation</h2>
      <p>${conceptExplanation}</p>
    </section>
    <section class="section">
      <h2>Activities</h2>
      ${activitiesHtml}
    </section>
    ${imageHtml}
    ${videoHtml}
    <section class="section">
      <h2>Closing</h2>
      <p>${closing}</p>
    </section>
    <footer>Generated with AI Lesson Plan Builder</footer>
  </div>
</body>
</html>`
}
