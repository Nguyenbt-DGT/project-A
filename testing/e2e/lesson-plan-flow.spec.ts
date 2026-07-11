import path from "node:path"
import { fileURLToPath } from "node:url"
import { expect, test } from "@playwright/test"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEST_IMAGE_PATH = path.join(__dirname, "fixtures", "test-image.png")

test("teacher can generate a lesson plan and download it", async ({ page }) => {
  await page.goto("/")

  await page.getByLabel("Learner age (from)").fill("3")
  await page.getByLabel("Learner age (to)").fill("9")
  await page.getByLabel("Concept to teach").fill("Colors of fruits")
  await page.getByLabel("Number of activities").fill("2")
  await page.getByLabel("Time per activity (min)").fill("10")
  await page.getByLabel(/Video clip links/).fill("https://youtube.com/watch?v=demo")

  const downloadPromise = page.waitForEvent("download")
  await page.getByRole("button", { name: "Generate Lesson Plan" }).click()

  await expect(page.getByText("Your lesson plan is ready")).toBeVisible({ timeout: 30_000 })

  const preview = page.frameLocator('iframe[title="Lesson plan preview"]')
  await expect(preview.locator("body")).toContainText("Colors of fruits", { ignoreCase: true })
  await expect(preview.locator("body")).toContainText("youtube.com/watch?v=demo")

  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe("lesson-plan.html")
})

test("shows inline validation instead of submitting when an age is out of range", async ({ page }) => {
  await page.goto("/")

  await page.getByLabel("Learner age (from)").fill("2")
  await page.getByLabel("Concept to teach").fill("Shapes")
  await page.getByRole("button", { name: "Generate Lesson Plan" }).click()

  await expect(page.getByText("Enter an age from 3 to 9.").first()).toBeVisible()
  await expect(page.getByText("Your lesson plan is ready")).toHaveCount(0)
})

test("uploaded picture is embedded in the generated plan", async ({ page }) => {
  await page.goto("/")

  await page.getByLabel("Concept to teach").fill("Shapes")
  await page.getByLabel("Picture - optional").setInputFiles(TEST_IMAGE_PATH)

  const downloadPromise = page.waitForEvent("download")
  await page.getByRole("button", { name: "Generate Lesson Plan" }).click()
  await expect(page.getByText("Your lesson plan is ready")).toBeVisible({ timeout: 30_000 })
  await downloadPromise

  const preview = page.frameLocator('iframe[title="Lesson plan preview"]')
  await expect(preview.locator("img.lesson-image")).toHaveCount(1)
  await expect(preview.locator("img.lesson-image")).toHaveAttribute("src", /\/uploads\//)
})

test("omits the video resources section when no links are given", async ({ page }) => {
  await page.goto("/")

  await page.getByLabel("Concept to teach").fill("Numbers")

  const downloadPromise = page.waitForEvent("download")
  await page.getByRole("button", { name: "Generate Lesson Plan" }).click()
  await expect(page.getByText("Your lesson plan is ready")).toBeVisible({ timeout: 30_000 })
  await downloadPromise

  const preview = page.frameLocator('iframe[title="Lesson plan preview"]')
  await expect(preview.getByText("Video Resources")).toHaveCount(0)
  await expect(preview.locator("img.lesson-image")).toHaveCount(0)
})

test("shows an error toast and triggers no download when generation fails", async ({ page }) => {
  await page.route("**/api/lesson-plans", (route) => {
    route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({ detail: "AI generation failed, please retry" }),
    })
  })

  await page.goto("/")
  await page.getByLabel("Concept to teach").fill("Animals")

  let downloadFired = false
  page.on("download", () => {
    downloadFired = true
  })

  await page.getByRole("button", { name: "Generate Lesson Plan" }).click()

  await expect(page.getByText("We couldn't generate your lesson plan. Please try again.")).toBeVisible()
  await expect(page.getByText("Your lesson plan is ready")).toHaveCount(0)
  expect(downloadFired).toBe(false)
})
