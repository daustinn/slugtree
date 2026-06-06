import fs from 'node:fs'
import path from 'node:path'
import pc from 'picocolors'
import type { NodeData } from '../types.js'
import { buildDirNodes } from './builder.js'

export function generateContent(
  resolvedContentDir: string,
  resolvedOutputDir: string,
  basePath: string,
  resolvedDistOutputDir?: string
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

  if (
    resolvedDistOutputDir &&
    fs.existsSync(path.dirname(resolvedDistOutputDir))
  ) {
    fs.mkdirSync(resolvedDistOutputDir, { recursive: true })

    fs.writeFileSync(
      path.join(resolvedDistOutputDir, 'tree.js'),
      `export default ${JSON.stringify(tree)};\n`
    )
    fs.writeFileSync(
      path.join(resolvedDistOutputDir, 'tree.d.ts'),
      `import type { Node } from '../types.js';\ndeclare const _default: Node[];\nexport default _default;\n`
    )

    fs.writeFileSync(
      path.join(resolvedDistOutputDir, 'nodes.js'),
      `export default ${JSON.stringify(allNodesData)};\n`
    )
    fs.writeFileSync(
      path.join(resolvedDistOutputDir, 'nodes.d.ts'),
      `import type { NodeData } from '../types.js';\ndeclare const _default: NodeData[];\nexport default _default;\n`
    )

    fs.writeFileSync(
      path.join(resolvedDistOutputDir, 'meta.js'),
      `export default ${JSON.stringify(basePath)};\n`
    )
    fs.writeFileSync(
      path.join(resolvedDistOutputDir, 'meta.d.ts'),
      `declare const _default: string;\nexport default _default;\n`
    )

    fs.writeFileSync(
      path.join(resolvedDistOutputDir, 'slugs.js'),
      `export default ${JSON.stringify(uniqueSlugs)};\n`
    )
    fs.writeFileSync(
      path.join(resolvedDistOutputDir, 'slugs.d.ts'),
      `declare const _default: string[][];\nexport default _default;\n`
    )
  }

  console.log(pc.green('slugtree: content generated'))
}
