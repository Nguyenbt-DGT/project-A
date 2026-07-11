import path from "node:path"
import { defineConfig } from "vitest/config"

function toPosix(p: string): string {
  return p.split(path.sep).join("/")
}

export default defineConfig({
  test: {
    globals: true,
    include: [
      toPosix(path.resolve(__dirname, "../testing/unit/backend/**/*.test.ts")),
      toPosix(path.resolve(__dirname, "../testing/regression/backend/**/*.test.ts")),
    ],
  },
})
