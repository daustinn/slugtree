import fs from 'node:fs'
import path from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'
import type { Node, NodeData } from './types.js'
import { generateContent, formatModuleCode } from './lib/generator.js'
import { readGeneratedContent } from './lib/sync.js'
import { startWatcher } from './lib/watcher.js'
import { hasFileContentChanged } from './lib/cache.js'
import { logChange } from './lib/logger.js'
import { setServerData } from './server.js'

const VIRTUAL_ID = 'virtual:slugtree'
const RESOLVED_VIRTUAL_ID = '\0' + VIRTUAL_ID

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

const CONTENT_EXTENSIONS = ['.mdx', '.md', '.json']

function isContentFile(filepath: string): boolean {
  return CONTENT_EXTENSIONS.some((ext) => filepath.endsWith(ext))
}

/**
 * Vite plugin for Slugtree documentation builder and React runtime.
 *
 * Automatically discovers MDX files in your content directory, generates
 * hierarchical navigation trees and metadata in `.slugtree`, exposes the
 * `virtual:slugtree` module, and delivers instant Hot Module Replacement (HMR).
 *
 * @param options - Configuration options for content directory, output path, and base URL.
 * @returns Vite plugin object.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite'
 * import react from '@vitejs/plugin-react'
 * import slugtree from 'slugtree/vite'
 *
 * export default defineConfig({
 *   plugins: [
 *     slugtree({
 *       contentDir: './src/content',
 *       basePath: '/docs'
 *     }),
 *     react()
 *   ]
 * })
 * ```
 */
function slugtree(options: PluginOptions = {}): Plugin {
  let resolvedContentDir: string
  let resolvedOutputDir: string
  let basePath: string
  let latestData: { tree: Node[]; nodes: NodeData[]; basePath: string } | null =
    null

  return {
    name: 'slugtree',
    enforce: 'pre',

    resolveId(id) {
      if (id === VIRTUAL_ID) {
        return RESOLVED_VIRTUAL_ID
      }
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) {
        if (!latestData && resolvedContentDir && resolvedOutputDir) {
          latestData = generateContent(
            resolvedContentDir,
            resolvedOutputDir,
            basePath
          )
          setServerData(latestData)
        }

        if (latestData) {
          return formatModuleCode(latestData)
        }

        const diskData = readGeneratedContent(resolvedOutputDir)
        if (diskData) {
          return formatModuleCode(diskData)
        }

        return formatModuleCode({
          tree: [],
          nodes: [],
          basePath: '/docs',
          slugs: []
        })
      }
    },

    config(userConfig) {
      const cwd = userConfig.root
        ? path.resolve(userConfig.root)
        : process.cwd()
      const outputDir = options.outputDir ?? DEFAULT_OPTIONS.outputDir
      const resolvedOutput = path.isAbsolute(outputDir)
        ? outputDir
        : path.resolve(cwd, outputDir)

      return {
        server: {
          watch: {
            ignored: [`**/${path.basename(resolvedOutput)}/**`]
          }
        },
        resolve: {
          alias: {
            'slugtree/generated': resolvedOutput
          }
        },
        optimizeDeps: {
          exclude: ['slugtree']
        }
      }
    },

    configResolved(config) {
      const isPreview =
        config.command === 'serve' &&
        (config.mode === 'production' ||
          process.argv.some((arg) => arg.includes('preview')) ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (config as any).isPreview)

      if (isPreview) {
        return
      }

      const cwd = config.root || process.cwd()

      const defaultContentDir = fs.existsSync(path.resolve(cwd, './src'))
        ? './src/content'
        : './content'

      const opts: InternalOptions = {
        ...DEFAULT_OPTIONS,
        contentDir: defaultContentDir,
        ...options
      }

      resolvedContentDir = path.resolve(cwd, opts.contentDir)
      resolvedOutputDir = path.isAbsolute(opts.outputDir)
        ? opts.outputDir
        : path.resolve(cwd, opts.outputDir)
      basePath = opts.basePath

      latestData = generateContent(
        resolvedContentDir,
        resolvedOutputDir,
        basePath
      )
      setServerData(latestData)
    },

    configureServer(server) {
      startWatcher(resolvedContentDir, resolvedOutputDir, basePath, (data) => {
        latestData = data
        setServerData(data)
        server.ws.send({
          type: 'custom',
          event: 'slugtree:update',
          data
        })
      })

      server.ws.on('connection', () => {
        if (latestData) {
          server.ws.send({
            type: 'custom',
            event: 'slugtree:update',
            data: latestData
          })
        }
      })
    },

    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (
        normalizedId.includes('/react-provider') ||
        normalizedId.includes('/dist/react')
      ) {
        return {
          code: `${code}\nif (import.meta.hot) {\n  import.meta.hot.on('slugtree:update', (data) => {\n    window.dispatchEvent(new CustomEvent('slugtree:update', { detail: data }))\n  })\n}\n`,
          map: null
        }
      }
    },

    handleHotUpdate({ file, server }: { file: string; server: ViteDevServer }) {
      const normalized = file.replace(/\\/g, '/')
      const contentNorm = resolvedContentDir.replace(/\\/g, '/')
      const outputNorm = resolvedOutputDir.replace(/\\/g, '/')

      const isInsideContent = normalized.startsWith(contentNorm)
      const isInsideOutput = normalized.startsWith(outputNorm)

      if (isInsideOutput) return []
      if (!isInsideContent || !isContentFile(file)) return
      if (!hasFileContentChanged(file)) return []

      const relativePath = path.relative(process.cwd(), file)
      logChange(relativePath)

      latestData = generateContent(
        resolvedContentDir,
        resolvedOutputDir,
        basePath
      )
      setServerData(latestData)

      server.ws.send({
        type: 'custom',
        event: 'slugtree:update',
        data: latestData
      })

      return []
    }
  }
}

export { slugtree }
export default slugtree
