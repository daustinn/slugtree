import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pc from 'picocolors'
import type { AstroIntegration } from 'astro'
import { generateContent } from './lib/generator.js'
import { startWatcher } from './lib/watcher.js'

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

export default function slugtree(
  options: PluginOptions = {}
): AstroIntegration {
  return {
    name: 'slugtree',
    hooks: {
      'astro:config:setup': ({ command }) => {
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

        const resolvedDistOutputDir = path.resolve(
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

        if (command === 'dev') {
          startWatcher(
            resolvedContentDir,
            resolvedOutputDir,
            basePath,
            resolvedDistOutputDir
          )
        }
      }
    }
  }
}

/**
 * Helper to easily render the MDX component in Astro using Vite's import.meta.glob.
 * 
 * @param slug - The slug array or string representing the page.
 * @param mdxGlob - The result of import.meta.glob() for the content folder.
 * @returns The Astro component (Content) or null if not found.
 */
export async function getAstroContent(
  slug: string | string[],
  mdxGlob: Record<string, () => Promise<any>>
) {
  const normSlug = Array.isArray(slug) ? slug : slug.split('/').filter(Boolean)
  const slugPath = normSlug.length === 0 ? 'index' : normSlug.join('/')
  
  const fileKey = Object.keys(mdxGlob).find(key => 
    key.endsWith(`/${slugPath}.mdx`) || key.endsWith(`/${slugPath}/index.mdx`)
  )
  
  if (fileKey) {
    const module = await mdxGlob[fileKey]()
    return module.Content
  }
  
  return null
}
