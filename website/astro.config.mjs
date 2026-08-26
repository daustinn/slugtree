import { defineConfig } from 'astro/config'
import process, { loadEnvFile } from 'node:process'
import cloudflare from '@astrojs/cloudflare'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import preact from '@astrojs/preact'
import slugtree from 'slugtree/astro'

try {
  loadEnvFile(path.resolve(import.meta.dirname, '../.env'))
} catch {
  // Ignore missing .env file
}

const SITE = process.env.SITE ?? 'http://localhost:4321'
const BASE = process.env.SITE_BASE ?? '/'

export default defineConfig({
  site: SITE,
  base: BASE,
  srcDir: '.',
  output: 'static',
  integrations: [
    slugtree({
      basePath: BASE
    }),
    preact({ compat: true })
  ],
  adapter: cloudflare({
    prerenderEnvironment: 'node'
  }),
  vite: {
    plugins: [tailwindcss()]
  }
})
