import { randomUUID } from "node:crypto"
import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { Router, type Request, type Response } from "express"
import multer from "multer"

const ALLOWED_CONTENT_TYPES = new Set(["image/png", "image/jpeg", "image/webp"])
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
}

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? "uploads")
mkdirSync(UPLOAD_DIR, { recursive: true })

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_UPLOAD_BYTES + 1 } })

export const uploadsRouter = Router()

uploadsRouter.post("/api/uploads", upload.single("file"), (req: Request, res: Response) => {
  const file = req.file
  if (!file) {
    return res.status(422).json({ detail: "Only PNG, JPEG or WEBP images are allowed" })
  }
  if (!ALLOWED_CONTENT_TYPES.has(file.mimetype)) {
    return res.status(422).json({ detail: "Only PNG, JPEG or WEBP images are allowed" })
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return res.status(422).json({ detail: "Image must be 5MB or smaller" })
  }

  const filename = `${randomUUID()}${EXTENSION_BY_CONTENT_TYPE[file.mimetype]}`
  const destination = path.join(UPLOAD_DIR, filename)
  writeFileSync(destination, file.buffer)

  const baseUrl = `${req.protocol}://${req.get("host")}`
  return res.status(201).json({ url: `${baseUrl}/uploads/${filename}` })
})
