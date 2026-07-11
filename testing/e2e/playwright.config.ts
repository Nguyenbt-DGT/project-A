import { defineConfig, devices } from "@playwright/test"

const FRONTEND_URL = process.env.E2E_BASE_URL ?? "http://localhost:5173"

export default defineConfig({
  testDir: ".",
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: FRONTEND_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // In CI: the workflow starts the backend (against a native Postgres service) and the
  // frontend dev server before this config runs; reuseExistingServer just detects them.
  // Locally: run a Postgres instance, `npm run dev --prefix ../../backend` and
  // `npm run dev --prefix ../../frontend` yourself first.
  webServer: process.env.CI
    ? [
        {
          command: "npm run dev --prefix ../../backend",
          url: "http://localhost:8000/health",
          timeout: 120_000,
          reuseExistingServer: true,
        },
        {
          command: "npm run dev --prefix ../../frontend",
          url: FRONTEND_URL,
          timeout: 60_000,
          reuseExistingServer: false,
        },
      ]
    : undefined,
})
