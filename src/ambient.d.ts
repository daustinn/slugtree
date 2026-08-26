declare module 'virtual:slugtree' {
  import type { Node, NodeData } from './types.js'
  export const tree: Node[]
  export const nodes: NodeData[]
  export const basePath: string
  export const meta: string
  export const slugs: string[][]
  const defaultData: {
    tree: Node[]
    nodes: NodeData[]
    basePath: string
    meta: string
    slugs: string[][]
  }
  export default defaultData
}

declare module 'slugtree/generated' {
  import type { Node, NodeData } from './types.js'
  export const tree: Node[]
  export const nodes: NodeData[]
  export const basePath: string
  export const meta: string
  export const slugs: string[][]
  const defaultData: {
    tree: Node[]
    nodes: NodeData[]
    basePath: string
    meta: string
    slugs: string[][]
  }
  export default defaultData
}
