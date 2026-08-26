import fs from 'node:fs'
import path from 'node:path'
import type { Node, NodeData } from '../types.js'

export interface DiskData {
  tree: Node[]
  nodes: NodeData[]
  basePath: string
  slugs: string[][]
  mtime: number
}

/**
 * Reads generated metadata files (.slugtree) from disk if modified.
 *
 * @param outputDir - Path to the .slugtree output directory.
 * @param lastMtime - Last known timestamp to prevent unnecessary re-reads.
 * @returns The parsed DiskData or null if no updates or file missing.
 */
export function readGeneratedContent(
  outputDir: string = path.resolve(process.cwd(), '.slugtree'),
  lastMtime: number = 0
): DiskData | null {
  try {
    const treePath = path.join(outputDir, 'tree.js')
    if (!fs.existsSync(treePath)) return null

    const stat = fs.statSync(treePath)
    if (stat.mtimeMs <= lastMtime) {
      return null
    }

    let tree: Node[] = []
    let nodes: NodeData[] = []
    let basePath: string = '/docs'
    let slugs: string[][] = []

    const treeContent = fs.readFileSync(treePath, 'utf-8')
    const treeMatch = treeContent.match(/export\s+default\s+([\s\S]+?);\s*$/)
    if (treeMatch) {
      tree = JSON.parse(treeMatch[1])
    }

    const nodesPath = path.join(outputDir, 'nodes.js')
    if (fs.existsSync(nodesPath)) {
      const nodesContent = fs.readFileSync(nodesPath, 'utf-8')
      const nodesMatch = nodesContent.match(
        /export\s+default\s+([\s\S]+?);\s*$/
      )
      if (nodesMatch) {
        nodes = JSON.parse(nodesMatch[1])
      }
    }

    const metaPath = path.join(outputDir, 'meta.js')
    if (fs.existsSync(metaPath)) {
      const metaContent = fs.readFileSync(metaPath, 'utf-8')
      const metaMatch = metaContent.match(/export\s+default\s+([\s\S]+?);\s*$/)
      if (metaMatch) {
        basePath = JSON.parse(metaMatch[1])
      }
    }

    const slugsPath = path.join(outputDir, 'slugs.js')
    if (fs.existsSync(slugsPath)) {
      const slugsContent = fs.readFileSync(slugsPath, 'utf-8')
      const slugsMatch = slugsContent.match(
        /export\s+default\s+([\s\S]+?);\s*$/
      )
      if (slugsMatch) {
        slugs = JSON.parse(slugsMatch[1])
      }
    }

    return {
      tree,
      nodes,
      basePath,
      slugs,
      mtime: stat.mtimeMs
    }
  } catch {
    return null
  }
}
