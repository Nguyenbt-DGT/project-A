import { randomUUID } from "node:crypto"
import { createClient } from "@supabase/supabase-js"
import { Router, type Request, type Response } from "express"
import multer from "multer"

const ALLOWED_CONTENT_TYPES = new Set(["image/png", "image/jpeg", "image/webp"])
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
}

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "lesson-plan-images"

function supabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured")
  }
  return createClient(url, key)
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_UPLOAD_BYTES + 1 } })

export const uploadsRouter = Router()

uploadsRouter.post("/api/uploads", upload.single("file"), async (req: Request, res: Response) => {
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
  const { error } = await supabase()
    .storage.from(STORAGE_BUCKET)
    .upload(filename, file.buffer, { contentType: file.mimetype })
  if (error) {
    console.error("Supabase Storage upload failed:", error.message)
    return res.status(502).json({ detail: "Image upload failed, please retry" })
  }

  const { data } = supabase().storage.from(STORAGE_BUCKET).getPublicUrl(filename)
  return res.status(201).json({ url: data.publicUrl })
})
