import path from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

function toPosix(p: string): string {
  return p.split(path.sep).join('/')
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@testing-library/jest-dom/vitest': path.resolve(
        __dirname,
        'node_modules/@testing-library/jest-dom/dist/vitest.mjs'
      ),
    },
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [toPosix(path.resolve(__dirname, '../testing/unit/frontend/setup.ts'))],
    include: [toPosix(path.resolve(__dirname, '../testing/unit/frontend/**/*.test.{ts,tsx}'))],
  },
})
