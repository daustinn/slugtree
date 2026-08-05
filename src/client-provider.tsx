'use client'

import React from 'react'
import type {
  Node,
  NodeData,
  NodeFolder,
  TocItem,
  BreadcrumbItem
} from './types.js'

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

type ClientContextState = {
  tree: Node[]
  nodes: NodeData[]
  basePath: string
}

export const ClientContext = React.createContext<ClientContextState | null>(
  null
)

function useClientContext(): ClientContextState {
  const ctx = React.useContext(ClientContext)
  if (!ctx) {
    throw new Error('slugtree hooks must be used within SlugtreeProvider')
  }
  return ctx
}

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

export function normalizeSlug(slug: string | string[], basePath: string): string[] {
  if (Array.isArray(slug)) return slug
  if (typeof slug === 'string') {
    let s = slug
    if (s.startsWith(basePath)) s = s.slice(basePath.length)
    return s.split('/').filter(Boolean)
  }
  return []
}

/**
 * Retrieves the entire structured tree of nodes, representing the folder and page hierarchy.
 *
 * @returns An array of the root Nodes.
 */
export function useTree(): Node[] {
  return useClientContext().tree
}

/**
 * Retrieves a specific Node (from the tree structure) by its slug.
 *
 * @param slug - The slug array or string representing the path.
 * @returns The matching Node if found, or null if not.
 */
export function useNode(slug: string | string[] = []): Node | null {
  const { tree, basePath } = useClientContext()
  const normalized = normalizeSlug(slug, basePath)
  return findNode(tree, normalized.join('/'))
}

/**
 * Retrieves the direct children of a folder node.
 * Returns an empty array if the node is not a folder or is not found.
 *
 * @param slug - The slug array or string of the folder.
 * @returns An array of child Nodes.
 */
export function useNodeChildren(slug: string | string[] = []): Node[] {
  const { tree, basePath } = useClientContext()
  const normalized = normalizeSlug(slug, basePath)
  const node = findNode(tree, normalized.join('/'))
  if (!node || node.type !== 'folder') return []
  return node.children
}

/**
 * Retrieves the parent Node of a given slug.
 * Returns null if the node is at the root level or not found.
 *
 * @param slug - The slug array or string of the target node.
 * @returns The parent Node or null.
 */
export function useNodeParent(slug: string | string[] = []): Node | null {
  const { tree, basePath } = useClientContext()
  const normalized = normalizeSlug(slug, basePath)
  if (normalized.length === 0) return null
  return findParentNode(tree, normalized.join('/'))
}

/**
 * Retrieves the sibling nodes at the same level as the given slug.
 * For root-level nodes, returns all other root-level non-label nodes.
 *
 * @param slug - The slug array or string of the target node.
 * @returns An array of sibling Nodes (excluding the current node).
 */
export function useNodeSiblings(slug: string | string[] = []): Node[] {
  const { tree, basePath } = useClientContext()
  const normalized = normalizeSlug(slug, basePath)
  if (normalized.length === 0) return []
  const slugPath = normalized.join('/')

  const parent = findParentNode(tree, slugPath)
  const siblings = parent && parent.type === 'folder' ? parent.children : tree

  return siblings.filter(
    (n) => n.type !== 'label' && n.slug.join('/') !== slugPath
  )
}

/**
 * Retrieves the ancestor chain from root to the target node as an array of Nodes.
 * Similar to breadcrumbs but returns full Node objects instead of lightweight items.
 *
 * @param slug - The slug array or string of the target node.
 * @returns An ordered array of Nodes from root to the target.
 */
export function useNodePath(slug: string | string[] = []): Node[] {
  const { tree, basePath } = useClientContext()
  const normalized = normalizeSlug(slug, basePath)
  const path: Node[] = []
  for (let i = 1; i <= normalized.length; i++) {
    const node = findNode(tree, normalized.slice(0, i).join('/'))
    if (node) path.push(node)
  }
  return path
}

/**
 * Retrieves the root-level folder section that contains the given slug.
 * Returns null if the node lives at the root level or is not found.
 *
 * @param slug - The slug array or string of the target node.
 * @returns The root NodeFolder or null.
 */
export function useNodeSection(slug: string | string[] = []): NodeFolder | null {
  const { tree, basePath } = useClientContext()
  const normalized = normalizeSlug(slug, basePath)
  if (normalized.length === 0) return null
  const root = findNode(tree, normalized[0])
  if (!root || root.type !== 'folder') return null
  return root as NodeFolder
}

/**
 * Returns the configured base path for all documentation routes.
 *
 * @returns The base path string (e.g. '/docs').
 */
export function useBasePath(): string {
  return useClientContext().basePath
}

/**
 * Retrieves the full flattened data for a specific node by its slug.
 * Includes raw content, frontmatter, and parsed table of contents.
 *
 * @param slug - The slug array or string representing the page path (e.g., ['guides', 'routing'] or '/docs/guides/routing').
 * @returns The NodeData object if found, or undefined if not.
 */
export function useNodeData(slug: string | string[] = []): NodeData | undefined {
  const { nodes, basePath } = useClientContext()
  const normalized = normalizeSlug(slug, basePath)
  const slugPath = normalized.join('/')
  return nodes.find((node) => node.slug.join('/') === slugPath)
}

/**
 * Retrieves all flattened nodes (pages and folders).
 *
 * @returns An array of all NodeData objects.
 */
export function useAllNodes(): NodeData[] {
  return useClientContext().nodes
}

/**
 * Retrieves only the page-type nodes (excludes folders and labels).
 * Useful for generating sitemaps (sitemap.xml).
 *
 * @returns An array of NodeData objects where type is 'page'.
 */
export function usePageNodes(): NodeData[] {
  return useClientContext().nodes.filter((n) => n.type === 'page')
}

/**
 * Generic filter over all NodeData. Returns every node for which the
 * predicate returns true. The most flexible query function in the API.
 *
 * @param predicate - A function that receives a NodeData and returns boolean.
 * @returns An array of matching NodeData objects.
 */
export function useFindNodes(
  predicate: (node: NodeData) => boolean
): NodeData[] {
  return useClientContext().nodes.filter(predicate)
}

/**
 * Checks whether a given slug is part of the active route.
 * Useful for highlighting active items in sidebars.
 *
 * @param slug - The slug array or string to test.
 * @param currentSlug - The current page's slug array or string.
 * @returns True if slug is an ancestor of or equal to currentSlug.
 */
export function useIsNodeActive(
  slug: string | string[],
  currentSlug: string | string[]
): boolean {
  const { basePath } = useClientContext()
  const normSlug = normalizeSlug(slug, basePath)
  const normCurrent = normalizeSlug(currentSlug, basePath)
  if (normSlug.length === 0 || normCurrent.length === 0) return false
  const slugPath = normSlug.join('/')
  const currentPath = normCurrent.join('/')
  return currentPath === slugPath || currentPath.startsWith(slugPath + '/')
}

/**
 * Generates the breadcrumb trail for a given page slug, traversing its parent folders.
 *
 * @param slug - The current page's slug array or string.
 * @returns An array of BreadcrumbItems representing the path from root to the current page.
 */
export function useNodeBreadcrumbs(slug: string | string[] = []): BreadcrumbItem[] {
  const { nodes, tree, basePath } = useClientContext()
  const normalized = normalizeSlug(slug, basePath)
  const crumbs: BreadcrumbItem[] = []

  for (let i = 1; i <= normalized.length; i++) {
    const partialSlug = normalized.slice(0, i)
    const partialPath = partialSlug.join('/')

    const node = nodes.find((n) => n.slug.join('/') === partialPath)
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
 * @param slug - The slug array or string representing the page path.
 * @returns An array of TocItems, or an empty array if the node isn't found.
 */
export function useNodeToc(slug: string | string[] = []): TocItem[] {
  const { nodes, basePath } = useClientContext()
  const normalized = normalizeSlug(slug, basePath)
  const slugPath = normalized.join('/')
  const node = nodes.find((n) => n.slug.join('/') === slugPath)
  return node ? node.toc : []
}

/**
 * Retrieves the previous and next page nodes for a given slug.
 * Perfect for implementing a "Next / Previous" pagination component.
 *
 * @param slug - The current page's slug array or string.
 * @returns An object with prev and next PaginationItems, or null if not found.
 */
export function useNodePagination(slug: string | string[] = []): Pagination | null {
  const { nodes, basePath } = useClientContext()
  const normalized = normalizeSlug(slug, basePath)
  const slugPath = normalized.join('/')
  const flatPages = nodes.filter((n) => n.type === 'page')
  const index = flatPages.findIndex((n) => n.slug.join('/') === slugPath)

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

export default function ClientProvider({
  slot,
  children
}: {
  slot: ClientContextState
  children: React.ReactNode
}) {
  return (
    <ClientContext.Provider value={slot}>{children}</ClientContext.Provider>
  )
}
