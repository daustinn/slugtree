import path from 'node:path'
import pc from 'picocolors'
import { generateContent } from './generator.js'

export async function startWatcher(
  resolvedContentDir: string,
  resolvedOutputDir: string,
  basePath: string,
  resolvedDistOutputDir?: string
): Promise<void> {
  let chokidar: typeof import('chokidar')
  try {
    chokidar = await import('chokidar')
  } catch {
    console.warn(pc.yellow('slugtree: chokidar not found, watching disabled'))
    return
  }

  const watcher = chokidar.watch(resolvedContentDir, {
    ignoreInitial: true,
    cwd: process.cwd()
  })

  let timeout: ReturnType<typeof setTimeout>
  watcher.on('all', (_event: string, filename: string) => {
    if (filename && (filename.endsWith('.mdx') || filename.endsWith('.json'))) {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        console.log(
          pc.cyan(`slugtree: change detected in ${filename}, rebuilding...`)
        )
        generateContent(
          resolvedContentDir,
          resolvedOutputDir,
          basePath,
          resolvedDistOutputDir
        )
      }, 100)
    }
  })

  console.log(
    pc.blue('slugtree: watching for changes in ') +
      pc.dim(path.relative(process.cwd(), resolvedContentDir))
  )
}
