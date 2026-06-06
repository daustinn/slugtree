import tree from './generated/tree.js'
import nodes from './generated/nodes.js'
import basePath from './generated/meta.js'
import slugs from './generated/slugs.js'

import type {
  BreadcrumbItem,
  Node,
  NodeData,
  NodeFolder,
  NodePage,
  TocItem
} from './types.js'

function findNode(treeNodes: Node[], slugPath: string): Node | null {
  for (const node of treeNodes) {
    if (node.type === 'label') continue
    if (node.slug.join('/') === slugPath) return node
    if (node.type === 'folder') {
      const found = findNode(node.children, slugPath)
      if (found) return found
    }
  }
  return null
}

function findFolderNode(
  treeNodes: Node[],
  targetSlug: string[]
): { title: string; href: string | undefined } | null {
  const target = targetSlug.join('/')
  for (const node of treeNodes) {
    if (node.type === 'folder') {
      if (node.slug.join('/') === target) {
        return { title: node.title, href: node.href }
      }
      const found = findFolderNode(node.children, targetSlug)
      if (found) return found
    }
  }
  return null
}

function findParentNode(treeNodes: Node[], slugPath: string): Node | null {
  for (const node of treeNodes) {
    if (node.type === 'folder') {
      const directChild = node.children.find(
        (c) => c.type !== 'label' && c.slug.join('/') === slugPath
      )
      if (directChild) return node
      const found = findParentNode(node.children, slugPath)
      if (found) return found
    }
  }
  return null
}

/**
 * Retrieves the entire structured tree of nodes, representing the folder and page hierarchy.
 *
 * @returns An array of the root Nodes.
 */
export function getTree(): Node[] {
  return tree
}

/**
 * Retrieves a specific Node (from the tree structure) by its slug.
 *
 * @param slug - The slug array representing the path.
 * @returns The matching Node if found, or null if not.
 */
export function getNode(slug: string[] = []): NodePage | NodeFolder | null {
  const slugPath = slug.join('/')
  const node = findNode(tree, slugPath)
  if (!node || node.type === 'label') return null
  return node
}

/**
 * Retrieves the direct children of a folder node.
 * Returns an empty array if the node is not a folder or is not found.
 *
 * @param slug - The slug array of the folder.
 * @returns An array of child Nodes.
 */
export function getNodeChildren(slug: string[] = []): Node[] {
  const node = getNode(slug)
  if (!node || node.type !== 'folder') return []
  return node.children
}

/**
 * Retrieves the parent Node of a given slug.
 * Returns null if the node is at the root level or not found.
 *
 * @param slug - The slug array of the target node.
 * @returns The parent Node or null.
 */
export function getNodeParent(slug: string[] = []): Node | null {
  if (slug.length === 0) return null
  return findParentNode(tree, slug.join('/'))
}

/**
 * Retrieves the sibling nodes at the same level as the given slug.
 * For root-level nodes, returns all other root-level non-label nodes.
 *
 * @param slug - The slug array of the target node.
 * @returns An array of sibling Nodes (excluding the current node).
 */
export function getNodeSiblings(slug: string[] = []): Node[] {
  if (slug.length === 0) return []
  const slugPath = slug.join('/')

  const parent = findParentNode(tree, slugPath)
  const siblings = parent && parent.type === 'folder' ? parent.children : tree

  return siblings.filter(
    (n: Node) => n.type !== 'label' && n.slug.join('/') !== slugPath
  )
}

/**
 * Retrieves the ancestor chain from root to the target node as an array of Nodes.
 * Similar to breadcrumbs but returns full Node objects instead of lightweight items.
 *
 * @param slug - The slug array of the target node.
 * @returns An ordered array of Nodes from root to the target.
 */
export function getNodePath(slug: string[] = []): Node[] {
  const path: Node[] = []
  for (let i = 1; i <= slug.length; i++) {
    const node = getNode(slug.slice(0, i))
    if (node) path.push(node)
  }
  return path
}

/**
 * Retrieves the root-level folder section that contains the given slug.
 * Returns null if the node lives at the root level or is not found.
 *
 * @param slug - The slug array of the target node.
 * @returns The root NodeFolder or null.
 */
export function getNodeSection(slug: string[] = []): NodeFolder | null {
  if (slug.length === 0) return null
  const root = getNode(slug.slice(0, 1))
  if (!root || root.type !== 'folder') return null
  return root as NodeFolder
}

/**
 * Returns the configured base path for all documentation routes.
 *
 * @returns The base path string (e.g. '/docs').
 */
export function getBasePath(): string {
  return basePath
}

/**
 * Retrieves the full flattened data for a specific node by its slug.
 * Includes raw content, frontmatter, and parsed table of contents.
 *
 * @param slug - The slug array representing the page path (e.g., ['guides', 'routing']).
 * @returns The NodeData object if found, or undefined if not.
 */
export function getNodeData(slug: string[] = []): NodeData | undefined {
  const slugPath = slug.join('/')
  return nodes.find((node: NodeData) => node.slug.join('/') === slugPath)
}

/**
 * Retrieves all flattened nodes (pages and folders).
 *
 * @returns An array of all NodeData objects.
 */
export function getAllNodes(): NodeData[] {
  return nodes
}

/**
 * Retrieves only the page-type nodes (excludes folders and labels).
 * Useful for generating sitemaps (sitemap.xml).
 *
 * @returns An array of NodeData objects where type is 'page'.
 */
export function getPageNodes(): NodeData[] {
  return nodes.filter((node: NodeData) => node.type === 'page')
}

/**
 * Generic filter over all NodeData. Returns every node for which the
 * predicate returns true. The most flexible query function in the API.
 *
 * @param predicate - A function that receives a NodeData and returns boolean.
 * @returns An array of matching NodeData objects.
 *
 * @example
 * // All nodes with a specific icon
 * findNodes((n) => n.frontMatter.icon === 'star')
 */
export function findNodes(predicate: (node: NodeData) => boolean): NodeData[] {
  return nodes.filter(predicate)
}

/**
 * Filters NodeData by a frontmatter field key/value pair.
 *
 * @param key - The frontmatter field name.
 * @param value - The value to match against.
 * @returns An array of NodeData objects whose frontmatter[key] equals value.
 */
export function getNodesByFrontMatter(key: string, value: unknown): NodeData[] {
  return nodes.filter(
    (node: NodeData) =>
      (node.frontMatter as unknown as Record<string, unknown>)[key] === value
  )
}

/**
 * Retrieves all valid URL slugs for all page nodes.
 * Useful for generating static params in Next.js (`generateStaticParams`).
 *
 * @returns An array of string arrays representing the slugs.
 */
export function getSlugs(): string[][] {
  return slugs
}

/**
 * Checks whether a given slug is part of the active route.
 * Useful for highlighting active items in sidebars.
 *
 * @param slug - The slug to test.
 * @param currentSlug - The current page slug.
 * @returns True if slug is an ancestor of or equal to currentSlug.
 */
export function isNodeActive(slug: string[], currentSlug: string[]): boolean {
  if (slug.length === 0 || currentSlug.length === 0) return false
  const slugPath = slug.join('/')
  const currentPath = currentSlug.join('/')
  return currentPath === slugPath || currentPath.startsWith(slugPath + '/')
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

/**
 * Retrieves the previous and next page nodes for a given slug.
 * Perfect for implementing a "Next / Previous" pagination component.
 *
 * @param slug - The current page's slug array.
 * @returns An object with `prev` and `next` PaginationItems, or null if not found.
 */
export function getNodePagination(slug: string[] = []): Pagination | null {
  const slugPath = slug.join('/')
  const flatPages = nodes.filter((node: NodeData) => node.type === 'page')
  const index = flatPages.findIndex(
    (node: NodeData) => node.slug.join('/') === slugPath
  )

  if (index === -1) return null

  const mapToItem = (node: NodeData): PaginationItem => ({
    title: node.frontMatter.title,
    description: node.frontMatter.description,
    href: node.href!,
    slug: node.slug
  })

  return {
    prev: index > 0 ? mapToItem(flatPages[index - 1]) : null,
    next: index < flatPages.length - 1 ? mapToItem(flatPages[index + 1]) : null
  }
}

/**
 * Generates the breadcrumb trail for a given page slug, traversing its parent folders.
 *
 * @param slug - The current page's slug array.
 * @returns An array of BreadcrumbItems representing the path from root to the current page.
 */
export function getNodeBreadcrumbs(slug: string[] = []): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = []

  for (let i = 1; i <= slug.length; i++) {
    const partialSlug = slug.slice(0, i)
    const partialPath = partialSlug.join('/')

    const node = nodes.find(
      (node: NodeData) => node.slug.join('/') === partialPath
    )
    if (node) {
      crumbs.push({ title: node.frontMatter.title, href: node.href })
      continue
    }

    const folderNode = findFolderNode(tree, partialSlug)
    if (folderNode) {
      crumbs.push({ title: folderNode.title, href: folderNode.href })
    }
  }

  return crumbs
}

/**
 * Returns the Table of Contents for a specific page node by slug.
 *
 * @param slug - The slug array representing the page path.
 * @returns An array of TocItems, or an empty array if the node isn't found.
 */
export function getNodeToc(slug: string[] = []): TocItem[] {
  const node = getNodeData(slug)
  return node ? node.toc : []
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

function extractHeadingContent(
  rawContent: string,
  headingText: string,
  maxLength: number
): string {
  const lines = rawContent.split('\n')
  const headingPattern = /^#{1,6}\s+/

  let headingIndex = -1
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (
      headingPattern.test(line) &&
      line.replace(headingPattern, '').trim().toLowerCase() ===
        headingText.toLowerCase()
    ) {
      headingIndex = i
      break
    }
  }

  if (headingIndex === -1) return ''

  const contentLines: string[] = []
  for (let i = headingIndex + 1; i < lines.length; i++) {
    if (headingPattern.test(lines[i])) break
    contentLines.push(lines[i])
  }

  const text = contentLines
    .join(' ')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, (m) => m.slice(1, -1))
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return text.length > maxLength
    ? text.slice(0, maxLength).trimEnd() + '\u2026'
    : text
}

/**
 * Searches across all page nodes' titles, descriptions, TOC headings, and raw content.
 * Returns a tree of results: each top-level item is a matched page, and heading-level
 * matches within that page are nested as children with a content excerpt (~200 chars).
 * Results are sorted by relevance score descending.
 *
 * @param query - The text string to search for.
 * @returns An array of SearchResult objects sorted by matchScore descending.
 */
export function searchContent(query: string): SearchResult[] {
  if (!query || query.trim() === '') return []

  const lowerQuery = query.toLowerCase()
  const results: SearchResult[] = []

  for (const node of nodes) {
    if (node.type !== 'page') continue

    const title = (node.frontMatter.title || '').toLowerCase()
    const description = (node.frontMatter.description || '').toLowerCase()
    const content = (node.rawContent || '').toLowerCase()

    let pageScore = 0
    if (title.includes(lowerQuery)) pageScore += 10
    if (description.includes(lowerQuery)) pageScore += 5

    const contentMatches = content.split(lowerQuery).length - 1
    pageScore += contentMatches

    const matchingHeadings: SearchResultChild[] = []
    for (const tocItem of node.toc) {
      if (tocItem.text.toLowerCase().includes(lowerQuery)) {
        const headingScore = tocItem.depth <= 2 ? 4 : 2
        const headingType = tocItem.depth === 1 ? 'title' : 'subtitle'

        const excerpt = extractHeadingContent(
          node.rawContent || '',
          tocItem.text,
          200
        )
        matchingHeadings.push({
          id: `${node.slug.join('/')}#${tocItem.id}`,
          title: tocItem.text,
          href: `${node.href}#${tocItem.id}`,
          type: headingType,
          content: excerpt,
          matchScore: headingScore
        })
        pageScore += headingScore
      }
    }

    if (pageScore > 0) {
      results.push({
        id: node.slug.join('/'),
        title: node.frontMatter.title,
        description: node.frontMatter.description,
        icon: node.frontMatter.icon,
        href: node.href!,
        matchScore: pageScore,
        children: matchingHeadings
      })
    }
  }

  return results.sort((a, b) => b.matchScore - a.matchScore)
}
