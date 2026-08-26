import fs from 'node:fs'
import path from 'node:path'
import { generateContent } from './lib/generator.js'
import { startWatcher } from './lib/watcher.js'
import { setServerData } from './server.js'

export type PluginSpec = string | [string, Record<string, unknown>]

export interface PluginOptions {
  /**
   * The directory containing your MDX content files.
   * Resolves relative to project root.
   *
   * @default './src/content' (or './content' if src does not exist)
   */
  contentDir?: string

  /**
   * The output directory for the generated metadata files.
   * Resolves relative to project root.
   *
   * @default '.slugtree'
   */
  outputDir?: string

  /**
   * The base URL path where your documentation is hosted (e.g. '/docs').
   *
   * @default '/'
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
  outputDir: '.slugtree',
  basePath: '/'
}

function isDevMode(): boolean {
  return process.env.NODE_ENV !== 'production'
}

/**
 * Next.js configuration wrapper for Slugtree documentation builder.
 *
 * Scans your MDX content directory, generates document trees and metadata in `.slugtree`,
 * sets up webpack module aliases (`slugtree/generated`), and runs a live watcher in development.
 *
 * @param nextConfig - The existing Next.js configuration object.
 * @param options - Custom options for content directory, output path, and base URL.
 * @returns Enhanced Next.js configuration object.
 *
 * @example
 * ```ts
 * // next.config.mjs
 * import withSlugtree from 'slugtree/next'
 *
 * const nextConfig = {
 *   reactStrictMode: true,
 * }
 *
 * export default withSlugtree(nextConfig, {
 *   contentDir: './src/content',
 *   basePath: '/docs'
 * })
 * ```
 */
export function withSlugtree<T extends Record<string, any> = Record<string, any>>(
  nextConfig?: T,
  options: PluginOptions = {}
): T {
  const cfg = (nextConfig ?? {}) as T & {
    webpack?: (config: any, options: any) => any
  }
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

  const initialData = generateContent(
    resolvedContentDir,
    resolvedOutputDir,
    basePath
  )
  setServerData(initialData)

  if (isDevMode()) {
    startWatcher(resolvedContentDir, resolvedOutputDir, basePath, (data) => {
      setServerData(data)
    })
  }

  return {
    ...cfg,
    transpilePackages: Array.from(
      new Set(['slugtree', ...(cfg.transpilePackages || [])])
    ),
    turbopack: {
      resolveAlias: {
        'slugtree/generated': `./${path.relative(cwd, resolvedOutputDir).replace(/\\/g, '/')}`
      },
      ...(cfg.turbopack || {})
    },
    webpack(config: any, options: any) {
      config.resolve = config.resolve || {}
      config.resolve.alias = config.resolve.alias || {}
      config.resolve.alias['slugtree/generated'] = resolvedOutputDir

      if (typeof cfg.webpack === 'function') {
        return cfg.webpack(config, options)
      }
      return config
    }
  } as T
}

export default withSlugtree
