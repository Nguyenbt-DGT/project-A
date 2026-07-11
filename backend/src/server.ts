import "dotenv/config"
import { createApp } from "./app.js"

const port = Number(process.env.PORT ?? 8000)
const app = createApp()

app.listen(port, () => {
  console.log(`AI Lesson Plan Builder API listening on port ${port}`)
})
