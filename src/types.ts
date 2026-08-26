export interface FrontMatter {
  title: string
  description?: string
  icon?: string
  href?: string
}

export interface DirConfig {
  title?: string
  icon?: string
  nodes?: string[]
}

export interface TocItem {
  id: string
  text: string
  depth: number
}

/**
 * Text separator or section heading in navigation tree
 */
export interface NodeLabel {
  type: 'label'
  label: string
}

/**
 * Individual documentation page node
 */
export interface NodePage {
  type: 'page'
  slug: string[]
  href: string
  title: string
  description?: string
  icon?: string
}

/**
 * Directory or folder node containing child pages and folders
 */
export interface NodeFolder {
  type: 'folder'
  title: string
  description?: string
  slug: string[]
  href: string | undefined
  children: Node[]
  icon?: string
}

/**
 * Union of all possible tree node items
 */
export type Node = NodeLabel | NodePage | NodeFolder

/**
 * Hierarchical tree structure of navigation nodes
 */
export type Tree = Node[]

/**
 * Full node metadata including frontmatter, table of contents, and raw content
 */
export interface NodeData {
  type: 'page' | 'folder'
  slug: string[]
  href: string | undefined
  filePath: string
  relativePath: string
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

export interface PaginationItem {
  title: string
  description?: string
  href: string
  slug: string[]
}

export interface Pagination {
  prev: PaginationItem | null
  next: PaginationItem | null
}

export interface SearchResultChild {
  id: string
  title: string
  href: string
  type: 'title' | 'subtitle'
  content: string
  matchScore: number
}

export interface SearchResult {
  id: string
  title: string
  description?: string
  icon?: string
  href: string
  matchScore: number
  children: SearchResultChild[]
}
