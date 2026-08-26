import { defineConfig } from 'astro/config'
import process from 'node:process'
import cloudflare from '@astrojs/cloudflare'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import preact from '@astrojs/preact'
import slugtree from 'slugtree/astro'

import { loadEnv } from 'vite'

const mode =
  process.env.NODE_ENV ??
  (process.argv.includes('build') ? 'production' : 'development')

const env = {
  ...loadEnv(mode, path.resolve(import.meta.dirname, '..'), ''),
  ...loadEnv(mode, import.meta.dirname, ''),
  ...process.env
}

const SITE =
  env.SITE ||
  env.ASTRO_SITE ||
  env.PUBLIC_SITE ||
  (mode === 'production'
    ? 'https://slugtree.daustinn.com'
    : 'http://localhost:4321')
const BASE = env.SITE_BASE ?? env.BASE ?? '/'

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
