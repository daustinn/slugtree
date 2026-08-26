import generated from 'slugtree/generated'
import { readGeneratedContent } from './lib/sync.js'
import type {
  BreadcrumbItem,
  Node,
  NodeData,
  NodeFolder,
  NodeLabel,
  NodePage,
  Pagination,
  PaginationItem,
  SearchResult,
  SearchResultChild,
  TocItem
} from './types.js'

import {
  normalizeSlug,
  queryNode,
  queryNodeChildren,
  queryNodeParent,
  queryNodeSiblings,
  queryNodePath,
  queryNodeSection,
  queryNodeLabel,
  queryNodeBreadcrumbs,
  queryNodePagination,
  queryNodeToc,
  isNodeActive as checkNodeActive,
  isNodeChildrenActive as checkNodeChildrenActive,
  searchContentNodes
} from './lib/tree-utils.js'

let tree: Node[] = (generated?.tree as Node[]) || []
let nodes: NodeData[] = (generated?.nodes as NodeData[]) || []
let basePath: string = (generated?.basePath as string) || '/'
let slugs: string[][] = (generated?.slugs as string[][]) || []
let lastMtime = 0

function syncFromDisk(): void {
  const disk = readGeneratedContent(undefined, lastMtime)
  if (disk) {
    tree = disk.tree
    nodes = disk.nodes
    basePath = disk.basePath
    slugs = disk.slugs
    lastMtime = disk.mtime
  }
}

export function setServerData(data: {
  tree?: Node[]
  nodes?: NodeData[]
  basePath?: string
  slugs?: string[][]
}): void {
  if (data.tree) tree = data.tree
  if (data.nodes) nodes = data.nodes
  if (data.basePath) basePath = data.basePath
  if (data.slugs) slugs = data.slugs
  lastMtime = Date.now()
}

/**
 * Retrieves the entire structured tree of nodes, representing the folder and page hierarchy.
 *
 * @returns An array of the root Nodes.
 */
export function getTree(): Node[] {
  syncFromDisk()
  return tree
}

/**
 * Retrieves a specific Node (from the tree structure) by its slug.
 *
 * @param slug - The slug array or string representing the path.
 * @returns The matching Node if found, or null if not.
 */
export function getNode(
  slug: string | string[] = []
): NodePage | NodeFolder | null {
  syncFromDisk()
  return queryNode(tree, slug, basePath)
}

/**
 * Retrieves the direct children of a folder node.
 * Returns an empty array if the node is not a folder or is not found.
 *
 * @param slug - The slug array or string of the folder.
 * @returns An array of child Nodes.
 */
export function getNodeChildren(slug: string | string[] = []): Node[] {
  syncFromDisk()
  return queryNodeChildren(tree, slug, basePath)
}

/**
 * Retrieves the parent Node of a given slug.
 * Returns null if the node is at the root level or not found.
 *
 * @param slug - The slug array or string of the target node.
 * @returns The parent Node or null.
 */
export function getNodeParent(slug: string | string[] = []): Node | null {
  syncFromDisk()
  return queryNodeParent(tree, slug, basePath)
}

/**
 * Retrieves the sibling nodes at the same level as the given slug.
 * For root-level nodes, returns all other root-level non-label nodes.
 *
 * @param slug - The slug array or string of the target node.
 * @returns An array of sibling Nodes (excluding the current node).
 */
export function getNodeSiblings(slug: string | string[] = []): Node[] {
  syncFromDisk()
  return queryNodeSiblings(tree, slug, basePath)
}

/**
 * Retrieves the ancestor chain from root to the target node as an array of Nodes.
 * Similar to breadcrumbs but returns full Node objects instead of lightweight items.
 *
 * @param slug - The slug array or string of the target node.
 * @returns An ordered array of Nodes from root to the target.
 */
export function getNodePath(slug: string | string[] = []): Node[] {
  syncFromDisk()
  return queryNodePath(tree, slug, basePath)
}

/**
 * Retrieves the root-level folder section that contains the given slug.
 * Returns null if the node lives at the root level or is not found.
 *
 * @param slug - The slug array or string of the target node.
 * @returns The root NodeFolder or null.
 */
export function getNodeSection(
  slug: string | string[] = []
): NodeFolder | null {
  syncFromDisk()
  return queryNodeSection(tree, slug, basePath)
}

/**
 * Returns the configured base path for all documentation routes.
 *
 * @returns The base path string (e.g. '/docs').
 */
export function getBasePath(): string {
  syncFromDisk()
  return basePath
}

/**
 * Returns the nearest NodeLabel that groups the node identified by the given slug.
 *
 * With scope `'deep'` (default) it first looks for a label preceding the node
 * among its siblings, then bubbles up through each ancestor until one is found.
 * With scope `'local'` it only searches the node's immediate sibling list.
 *
 * @param slug - The slug array or string of the target node.
 * @param scope - `'deep'` to bubble up through parents (default), `'local'` for siblings only.
 * @returns The nearest NodeLabel, or null if none exists.
 */
export function getNodeLabel(
  slug: string | string[] = [],
  scope: 'local' | 'deep' = 'deep'
): NodeLabel | null {
  syncFromDisk()
  return queryNodeLabel(tree, slug, scope, basePath)
}

/**
 * Retrieves the full flattened data for a specific node by its slug.
 * Includes raw content, frontmatter, and parsed table of contents.
 *
 * @param slug - The slug array or string representing the page path (e.g., ['guides', 'routing']).
 * @returns The NodeData object if found, or undefined if not.
 */
export function getNodeData(
  slug: string | string[] = []
): NodeData | undefined {
  syncFromDisk()
  const normalized = normalizeSlug(slug, basePath)
  const slugPath = normalized.join('/')
  return nodes.find((node: NodeData) => node.slug.join('/') === slugPath)
}

/**
 * Retrieves all flattened nodes (pages and folders).
 *
 * @returns An array of all NodeData objects.
 */
export function getAllNodes(): NodeData[] {
  syncFromDisk()
  return nodes
}

/**
 * Retrieves only the page-type nodes (excludes folders and labels).
 * Useful for generating sitemaps (sitemap.xml).
 *
 * @returns An array of NodeData objects where type is 'page'.
 */
export function getPageNodes(): NodeData[] {
  syncFromDisk()
  return nodes.filter(
    (node: NodeData) =>
      node.type === 'page' ||
      (node.type === 'folder' && node.href !== undefined)
  )
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
  syncFromDisk()
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
  syncFromDisk()
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
  syncFromDisk()
  return slugs
}

/**
 * Checks whether a given slug is part of the active route.
 *
 * @param slug - The slug array or string to test.
 * @param currentSlug - The current page's slug array or string.
 * @returns True if slug is an ancestor of or equal to currentSlug.
 */
export function isNodeActive(
  slug: string | string[],
  currentSlug: string | string[]
): boolean {
  return checkNodeActive(slug, currentSlug, basePath)
}

/**
 * Checks whether any child or descendant of a given folder slug is active.
 *
 * @param folderSlug - The folder slug array or string to test.
 * @param currentSlug - The current active page's slug array or string.
 * @returns True if currentSlug is a descendant of folderSlug (and not folderSlug itself).
 */
export function isNodeChildrenActive(
  folderSlug: string | string[],
  currentSlug: string | string[]
): boolean {
  return checkNodeChildrenActive(folderSlug, currentSlug, basePath)
}

/**
 * Retrieves the previous and next page nodes for a given slug.
 * Perfect for implementing a "Next / Previous" pagination component.
 *
 * @param slug - The current page's slug array or string.
 * @returns An object with `prev` and `next` PaginationItems, or null if not found.
 */
export function getNodePagination(
  slug: string | string[] = []
): Pagination | null {
  syncFromDisk()
  return queryNodePagination(nodes, slug, basePath)
}

/**
 * Generates the breadcrumb trail for a given page slug, traversing its parent folders.
 *
 * @param slug - The current page's slug array or string.
 * @returns An array of BreadcrumbItems representing the path from root to the current page.
 */
export function getNodeBreadcrumbs(
  slug: string | string[] = []
): BreadcrumbItem[] {
  syncFromDisk()
  return queryNodeBreadcrumbs(tree, nodes, slug, basePath)
}

/**
 * Returns the Table of Contents for a specific page node by slug.
 *
 * @param slug - The slug array or string representing the page path.
 * @returns An array of TocItems, or an empty array if the node isn't found.
 */
export function getNodeToc(slug: string | string[] = []): TocItem[] {
  syncFromDisk()
  return queryNodeToc(nodes, slug, basePath)
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
  syncFromDisk()
  return searchContentNodes(nodes, query)
}

export { normalizeSlug }
export type { PaginationItem, Pagination, SearchResult, SearchResultChild }
