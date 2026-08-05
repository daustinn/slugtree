import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pc from 'picocolors'
import type { AstroIntegration } from 'astro'
import type { Plugin, ViteDevServer, ModuleNode } from 'vite'
import { generateContent } from './lib/generator.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

const CONTENT_EXTENSIONS = ['.mdx', '.md', '.json']

function isContentFile(filepath: string): boolean {
  return CONTENT_EXTENSIONS.some((ext) => filepath.endsWith(ext))
}

export default function slugtree(
  options: PluginOptions = {}
): AstroIntegration {
  let resolvedContentDir: string
  let resolvedOutputDir: string
  let resolvedDistOutputDir: string
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

        resolvedDistOutputDir = path.resolve(
          __dirname,
          '..',
          'dist',
          'generated'
        )

        console.log(pc.magenta(`\n> slugtree initializing for astro...`))

        generateContent(
          resolvedContentDir,
          resolvedOutputDir,
          basePath,
          resolvedDistOutputDir
        )

        const vitePlugin: Plugin = {
          name: 'slugtree:hmr',
          enforce: 'pre',

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
            const distNorm = resolvedDistOutputDir?.replace(/\\/g, '/')

            const isInsideContent = normalized.startsWith(contentNorm)
            const isInsideOutput =
              normalized.startsWith(outputNorm) ||
              (distNorm != null && normalized.startsWith(distNorm))

            if (!isInsideContent || isInsideOutput || !isContentFile(file))
              return

            console.log(
              pc.cyan(
                `slugtree: change detected in ${path.relative(process.cwd(), file)}, rebuilding...`
              )
            )

            generateContent(
              resolvedContentDir,
              resolvedOutputDir,
              basePath,
              resolvedDistOutputDir
            )

            if (file.endsWith('.json')) {
              server.restart()
              return []
            }

            const affectedModules: ModuleNode[] = []
            for (const mod of server.moduleGraph.idToModuleMap.values()) {
              if (
                mod.id &&
                (mod.id.startsWith(outputNorm) ||
                  (distNorm && mod.id.startsWith(distNorm)))
              ) {
                server.moduleGraph.invalidateModule(mod)
                affectedModules.push(mod)
              }
            }

            return affectedModules.length > 0 ? affectedModules : undefined
          }
        }

        updateConfig({ vite: { plugins: [vitePlugin] } })
      }
    }
  }
}

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
