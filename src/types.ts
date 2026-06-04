export interface FrontMatter {
  title: string
  description?: string
  icon?: string
}

export interface DirConfig {
  title?: string
  nodes?: string[]
}

export interface TocItem {
  id: string
  text: string
  depth: number
}

export interface NodeLabel {
  type: 'label'
  label: string
}

export interface NodePage {
  type: 'page'
  slug: string[]
  href: string
  title: string
  description?: string
  icon?: string
}

export interface NodeFolder {
  type: 'folder'
  title: string
  description?: string
  slug: string[]
  href: string | undefined
  children: Node[]
}

export type Node = NodeLabel | NodePage | NodeFolder

export type Tree = Node[]

export interface NodeData {
  type: 'page' | 'folder'
  slug: string[]
  href: string | undefined
  filePath: string
  frontMatter: FrontMatter
  toc: TocItem[]
  rawContent: string
  children?: NodeData[]
}

export interface BreadcrumbItem {
  title: string
  href: string | undefined
}
export interface NodeNavigation {
  prev: NodeData | null
  next: NodeData | null
}
