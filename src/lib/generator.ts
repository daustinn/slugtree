import fs from 'node:fs'
import path from 'node:path'
import pc from 'picocolors'
import type { NodeData } from '../types.js'
import { buildDirNodes } from './builder.js'

export function generateContent(
  resolvedContentDir: string,
  resolvedOutputDir: string,
  basePath: string
): void {
  const allNodesData: NodeData[] = []
  const tree = buildDirNodes(resolvedContentDir, [], basePath, allNodesData)

  fs.mkdirSync(resolvedOutputDir, { recursive: true })

  fs.writeFileSync(
    path.join(resolvedOutputDir, 'tree.ts'),
    `import type { Node } from '../types.js'\n\nexport default ${JSON.stringify(tree)} as Node[]\n`
  )
  fs.writeFileSync(
    path.join(resolvedOutputDir, 'nodes.ts'),
    `import type { NodeData } from '../types.js'\n\nexport default ${JSON.stringify(allNodesData)} as NodeData[]\n`
  )
  fs.writeFileSync(
    path.join(resolvedOutputDir, 'meta.ts'),
    `export default ${JSON.stringify(basePath)} as string\n`
  )
  const uniqueSlugs = Array.from(
    new Map(
      allNodesData.map((node) => [node.slug.join('/'), node.slug])
    ).values()
  )

  fs.writeFileSync(
    path.join(resolvedOutputDir, 'slugs.ts'),
    `export default ${JSON.stringify(uniqueSlugs)} as string[][]\n`
  )

  console.log(pc.green('slugtree: content generated'))
}
