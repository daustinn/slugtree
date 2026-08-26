import { defineConfig } from 'vitest/config'
import { slugtree } from './src/vite.js'

export default defineConfig({
  plugins: [slugtree()],
  test: {
    environment: 'node',
    include: ['src/tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
})
