import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pc from 'picocolors'
import type { NextConfig } from 'next'
import { generateContent } from './lib/generator.js'
import { startWatcher } from './lib/watcher.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export type PluginSpec = string | [string, Record<string, unknown>]

// MDX configuration is now handled directly in the application's MDX component.

export interface PluginOptions {
  /**
   * The directory containing your MDX content files.
   * @default './src/content'
   */
  contentDir?: string
  /**
   * The output directory for the generated metadata.
   * @default './src/generated'
   */
  outputDir?: string
  /**
   * The base URL path where your docs will be served.
   * @default '/docs'
   */
  basePath?: string
}

interface InternalOptions {
  contentDir: string
  outputDir: string
  basePath: string
}

const DEFAULT_OPTIONS: InternalOptions = {
  contentDir: './src/content',
  outputDir: path.resolve(__dirname, '..', 'src', 'generated'),
  basePath: '/docs'
}

function isDevMode(): boolean {
  return process.env.NODE_ENV !== 'production'
}

export function withSlugtree(
  nextConfig: NextConfig,
  options: PluginOptions = {}
): NextConfig {
  const cwd = process.cwd()

  const defaultContentDir = fs.existsSync(path.resolve(cwd, './src'))
    ? './src/content'
    : './content'

  const opts: InternalOptions = {
    ...DEFAULT_OPTIONS,
    contentDir: defaultContentDir,
    ...options
  }

  const resolvedContentDir = path.resolve(cwd, opts.contentDir)
  const resolvedOutputDir = path.isAbsolute(opts.outputDir)
    ? opts.outputDir
    : path.resolve(cwd, opts.outputDir)
  const basePath = opts.basePath

  const resolvedDistOutputDir = path.resolve(__dirname, '..', 'dist', 'generated')

  console.log(pc.magenta(`\n> slugtree initializing...`))

  generateContent(
    resolvedContentDir,
    resolvedOutputDir,
    basePath,
    resolvedDistOutputDir
  )

  if (isDevMode()) {
    startWatcher(
      resolvedContentDir,
      resolvedOutputDir,
      basePath,
      resolvedDistOutputDir
    )
  }

  return nextConfig
}
