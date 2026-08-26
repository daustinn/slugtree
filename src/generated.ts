import type { Node, NodeData } from './types.js'

export const tree: Node[] = []
export const nodes: NodeData[] = []
export const basePath: string = '/docs'
export const meta: string = basePath
export const slugs: string[][] = []

export default { tree, nodes, basePath, meta, slugs }
