import express, { type Application } from "express"
import cors from "cors"
import { lessonPlansRouter } from "./routes/lessonPlans.js"
import { uploadsRouter } from "./routes/uploads.js"

export function createApp(): Application {
  const app = express()

  const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5173").split(",")
  app.use(cors({ origin: allowedOrigins, credentials: true }))
  app.use(express.json())

  app.use(lessonPlansRouter)
  app.use(uploadsRouter)

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" })
  })

  return app
}
