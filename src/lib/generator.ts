import fs from 'node:fs'
import path from 'node:path'
import type { Node, NodeData } from '../types.js'
import { buildDirNodes } from './builder.js'
import { logSuccess } from './logger.js'

/**
 * Formats a virtual JS module containing Slugtree metadata.
 *
 * @param data - The tree, nodes, basePath, and optional slugs.
 * @returns Executable JavaScript module code.
 */
export function formatModuleCode(data: {
  tree: Node[]
  nodes: NodeData[]
  basePath: string
  slugs?: string[][]
}): string {
  const slugs =
    data.slugs ||
    Array.from(
      new Map(
        data.nodes.map((node) => [node.slug.join('/'), node.slug])
      ).values()
    )

  return [
    `export const tree = ${JSON.stringify(data.tree)};`,
    `export const nodes = ${JSON.stringify(data.nodes)};`,
    `export const basePath = ${JSON.stringify(data.basePath)};`,
    `export const slugs = ${JSON.stringify(slugs)};`,
    `export default { tree, nodes, basePath: ${JSON.stringify(data.basePath)}, slugs: ${JSON.stringify(slugs)} };`,
    ''
  ].join('\n')
}

/**
 * Builds and writes documentation files to the output directory (.slugtree).
 *
 * @param resolvedContentDir - Content folder path.
 * @param resolvedOutputDir - Destination output folder path.
 * @param basePath - Documentation base URL.
 * @returns Object with generated tree, nodes, and basePath.
 */
export function generateContent(
  resolvedContentDir: string,
  resolvedOutputDir: string,
  basePath: string
): { tree: Node[]; nodes: NodeData[]; basePath: string } {
  const allNodesData: NodeData[] = []
  const tree = buildDirNodes(resolvedContentDir, [], basePath, allNodesData)

  fs.mkdirSync(resolvedOutputDir, { recursive: true })

  fs.writeFileSync(
    path.join(resolvedOutputDir, 'tree.js'),
    `export default ${JSON.stringify(tree)};\n`
  )

  fs.writeFileSync(
    path.join(resolvedOutputDir, 'nodes.js'),
    `export default ${JSON.stringify(allNodesData)};\n`
  )

  fs.writeFileSync(
    path.join(resolvedOutputDir, 'meta.js'),
    `export default ${JSON.stringify(basePath)};\n`
  )

  const uniqueSlugs = Array.from(
    new Map(
      allNodesData.map((node) => [node.slug.join('/'), node.slug])
    ).values()
  )

  fs.writeFileSync(
    path.join(resolvedOutputDir, 'slugs.js'),
    `export default ${JSON.stringify(uniqueSlugs)};\n`
  )

  fs.writeFileSync(
    path.join(resolvedOutputDir, 'index.js'),
    `export { default as tree } from './tree.js';\nexport { default as nodes } from './nodes.js';\nexport { default as meta } from './meta.js';\nexport { default as slugs } from './slugs.js';\nimport tree from './tree.js';\nimport nodes from './nodes.js';\nimport meta from './meta.js';\nimport slugs from './slugs.js';\nexport default { tree, nodes, basePath: meta, slugs };\n`
  )

  logSuccess('content generated')

  return { tree, nodes: allNodesData, basePath }
}
