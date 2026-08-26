import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AstroIntegration } from 'astro'
import type { Plugin, ViteDevServer, ModuleNode } from 'vite'
import { generateContent } from './lib/generator.js'
import { hasFileContentChanged } from './lib/cache.js'
import { logChange } from './lib/logger.js'
import { setServerData } from './server.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
 * Astro integration for Slugtree documentation builder.
 *
 * Scans your MDX content folder during `astro:config:setup`, builds navigation
 * hierarchies in `.slugtree`, configures Vite module aliases, and invalidates
 * generated modules on content updates in dev mode.
 *
 * @param options - Configuration options for content directory, output path, and base URL.
 * @returns Astro integration object.
 *
 * @example
 * ```ts
 * // astro.config.mjs
 * import { defineConfig } from 'astro/config'
 * import mdx from '@astrojs/mdx'
 * import slugtree from 'slugtree/astro'
 *
 * export default defineConfig({
 *   integrations: [
 *     slugtree({
 *       contentDir: './src/content',
 *       basePath: '/docs'
 *     }),
 *     mdx()
 *   ]
 * })
 * ```
 */
function slugtree(options: PluginOptions = {}): AstroIntegration {
  let resolvedContentDir: string
  let resolvedOutputDir: string
  let basePath: string

  return {
    name: 'slugtree',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        const cwd = process.cwd()

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

        const generatedData = generateContent(
          resolvedContentDir,
          resolvedOutputDir,
          basePath
        )
        setServerData(generatedData)

        const vitePlugin: Plugin = {
          name: 'slugtree:hmr',
          enforce: 'pre',

          config() {
            return {
              resolve: {
                alias: {
                  'slugtree/generated': resolvedOutputDir
                }
              }
            }
          },

          handleHotUpdate({
            file,
            server
          }: {
            file: string
            server: ViteDevServer
          }) {
            const normalized = file.replace(/\\/g, '/')
            const contentNorm = resolvedContentDir.replace(/\\/g, '/')
            const outputNorm = resolvedOutputDir.replace(/\\/g, '/')

            const isInsideContent = normalized.startsWith(contentNorm)
            const isInsideOutput = normalized.startsWith(outputNorm)

            if (!isInsideContent || isInsideOutput || !isContentFile(file))
              return
            if (!hasFileContentChanged(file)) return

            const relativePath = path.relative(process.cwd(), file)
            logChange(relativePath)

            const data = generateContent(
              resolvedContentDir,
              resolvedOutputDir,
              basePath
            )
            setServerData(data)

            if (file.endsWith('.json')) {
              server.restart()
              return []
            }

            const affectedModules: ModuleNode[] = []
            for (const mod of server.moduleGraph.idToModuleMap.values()) {
              if (mod.id && mod.id.startsWith(outputNorm)) {
                server.moduleGraph.invalidateModule(mod)
                affectedModules.push(mod)
              }
            }

            return affectedModules.length > 0 ? affectedModules : undefined
          }
        }

        updateConfig({
          vite: {
            plugins: [vitePlugin],
            resolve: {
              alias: {
                'slugtree/generated': resolvedOutputDir
              }
            }
          }
        })
      }
    }
  }
}

/**
 * Resolves and returns the rendered MDX component for the specified slug in Astro.
 *
 * @param slug - The slug array or string (e.g. ['guides', 'routing'] or 'guides/routing').
 * @param mdxGlob - The result of `import.meta.glob('./content/**\/*.mdx')`.
 * @returns The MDX Content component, or null if not found.
 *
 * @example
 * ```astro
 * ---
 * // src/pages/docs/[...slug].astro
 * import { getAstroContent, getSlugs } from 'slugtree/astro'
 *
 * export async function getStaticPaths() {
 *   return getSlugs().map((slug) => ({
 *     params: { slug: slug.join('/') || undefined }
 *   }))
 * }
 *
 * const { slug } = Astro.params
 * const Content = await getAstroContent(slug ?? '', import.meta.glob('../../content/**\/*.mdx'))
 * ---
 *
 * <Content />
 * ```
 */
export async function getAstroContent(
  slug: string | string[],
  mdxGlob: Record<
    string,
    () => Promise<{ default: unknown; [key: string]: unknown }>
  >
) {
  const normSlug = Array.isArray(slug) ? slug : slug.split('/').filter(Boolean)
  const slugPath = normSlug.length === 0 ? 'index' : normSlug.join('/')

  const fileKey = Object.keys(mdxGlob).find(
    (key) =>
      key.endsWith(`/${slugPath}.mdx`) ||
      key.endsWith(`/${slugPath}.md`) ||
      key.endsWith(`/${slugPath}/index.mdx`) ||
      key.endsWith(`/${slugPath}/index.md`)
  )

  if (fileKey) {
    const module = await mdxGlob[fileKey]()
    return module.Content
  }

  return null
}

export default slugtree
