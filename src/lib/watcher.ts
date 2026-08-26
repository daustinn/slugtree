import path from 'node:path'
import type { Node, NodeData } from '../types.js'
import { generateContent } from './generator.js'
import { hasFileContentChanged } from './cache.js'
import { logChange, logWarn } from './logger.js'

export async function startWatcher(
  resolvedContentDir: string,
  resolvedOutputDir: string,
  basePath: string,
  onChange?: (data: {
    tree: Node[]
    nodes: NodeData[]
    basePath: string
  }) => void
): Promise<void> {
  let chokidar: typeof import('chokidar')
  try {
    chokidar = await import('chokidar')
  } catch {
    logWarn('chokidar not found, watching disabled')
    return
  }

  const watcher = chokidar.watch(resolvedContentDir, {
    ignoreInitial: true,
    cwd: process.cwd()
  })

  let timeout: ReturnType<typeof setTimeout>
  watcher.on('all', (_event: string, filename: string) => {
    if (
      filename &&
      (filename.endsWith('.mdx') ||
        filename.endsWith('.md') ||
        filename.endsWith('.json'))
    ) {
      const fullPath = path.isAbsolute(filename)
        ? filename
        : path.resolve(process.cwd(), filename)

      if (!hasFileContentChanged(fullPath)) {
        return
      }

      clearTimeout(timeout)
      timeout = setTimeout(() => {
        const relativePath = path.relative(process.cwd(), fullPath)
        logChange(relativePath)
        const generatedData = generateContent(
          resolvedContentDir,
          resolvedOutputDir,
          basePath
        )
        onChange?.(generatedData)
      }, 100)
    }
  })
}
