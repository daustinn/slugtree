'use client'

import React from 'react'
import type {
  Node,
  NodeData,
  NodeFolder,
  NodeLabel,
  NodePage,
  TocItem,
  BreadcrumbItem,
  PaginationItem,
  Pagination,
  SearchResult,
  SearchResultChild
} from './types.js'

import defaultData from 'slugtree/generated'
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

export type ClientContextState = {
  tree: Node[]
  nodes: NodeData[]
  basePath: string
}

const DEFAULT_STATE: ClientContextState = {
  tree: [],
  nodes: [],
  basePath: '/docs'
}

export const ClientContext = React.createContext<ClientContextState | null>(null)

function useClientContext(): ClientContextState {
  const ctx = React.useContext(ClientContext)
  if (!ctx) {
    throw new Error('slugtree hooks must be used within SlugtreeProvider')
  }
  return ctx
}

export function useTree(): Node[] {
  return useClientContext().tree
}

export function useNode(
  slug: string | string[] = []
): NodePage | NodeFolder | null {
  const { tree, basePath } = useClientContext()
  return queryNode(tree, slug, basePath)
}

export function useNodeChildren(slug: string | string[] = []): Node[] {
  const { tree, basePath } = useClientContext()
  return queryNodeChildren(tree, slug, basePath)
}

export function useNodeParent(slug: string | string[] = []): Node | null {
  const { tree, basePath } = useClientContext()
  return queryNodeParent(tree, slug, basePath)
}

export function useNodeSiblings(slug: string | string[] = []): Node[] {
  const { tree, basePath } = useClientContext()
  return queryNodeSiblings(tree, slug, basePath)
}

export function useNodePath(slug: string | string[] = []): Node[] {
  const { tree, basePath } = useClientContext()
  return queryNodePath(tree, slug, basePath)
}

export function useNodeSection(
  slug: string | string[] = []
): NodeFolder | null {
  const { tree, basePath } = useClientContext()
  return queryNodeSection(tree, slug, basePath)
}

export function useBasePath(): string {
  return useClientContext().basePath
}

export function useNodeLabel(
  slug: string | string[] = [],
  scope: 'local' | 'deep' = 'deep'
): NodeLabel | null {
  const { tree, basePath } = useClientContext()
  return queryNodeLabel(tree, slug, scope, basePath)
}

export function useNodeData(
  slug: string | string[] = []
): NodeData | undefined {
  const { nodes, basePath } = useClientContext()
  const normalized = normalizeSlug(slug, basePath)
  const slugPath = normalized.join('/')
  return nodes.find((node) => node.slug.join('/') === slugPath)
}

export function useAllNodes(): NodeData[] {
  return useClientContext().nodes
}

export function usePageNodes(): NodeData[] {
  return useClientContext().nodes.filter(
    (node) =>
      node.type === 'page' ||
      (node.type === 'folder' && node.href !== undefined)
  )
}

export function useFindNodes(
  predicate: (node: NodeData) => boolean
): NodeData[] {
  return useClientContext().nodes.filter(predicate)
}

export function useIsNodeActive(
  slug: string | string[],
  currentSlug: string | string[]
): boolean {
  const { basePath } = useClientContext()
  return checkNodeActive(slug, currentSlug, basePath)
}

export function useIsNodeChildrenActive(
  folderSlug: string | string[],
  currentSlug: string | string[]
): boolean {
  const { basePath } = useClientContext()
  return checkNodeChildrenActive(folderSlug, currentSlug, basePath)
}

export const useIsNodeChildrenAction = useIsNodeChildrenActive

export function useNodeBreadcrumbs(
  slug: string | string[] = []
): BreadcrumbItem[] {
  const { tree, nodes, basePath } = useClientContext()
  return queryNodeBreadcrumbs(tree, nodes, slug, basePath)
}

export function useNodeToc(slug: string | string[] = []): TocItem[] {
  const { nodes, basePath } = useClientContext()
  return queryNodeToc(nodes, slug, basePath)
}

export function useNodePagination(
  slug: string | string[] = []
): Pagination | null {
  const { nodes, basePath } = useClientContext()
  return queryNodePagination(nodes, slug, basePath)
}

export function useSearchContent(query: string): SearchResult[] {
  const { nodes } = useClientContext()
  return React.useMemo(() => searchContentNodes(nodes, query), [nodes, query])
}

export interface SlugtreeContextValue extends ClientContextState {
  slugs: string[][]
  getNode: (slug?: string | string[]) => NodePage | NodeFolder | null
  getNodeChildren: (slug?: string | string[]) => Node[]
  getNodeParent: (slug?: string | string[]) => Node | null
  getNodeSiblings: (slug?: string | string[]) => Node[]
  getNodePath: (slug?: string | string[]) => Node[]
  getNodeSection: (slug?: string | string[]) => NodeFolder | null
  getNodeLabel: (
    slug?: string | string[],
    scope?: 'local' | 'deep'
  ) => NodeLabel | null
  getNodeData: (slug?: string | string[]) => NodeData | undefined
  getAllNodes: () => NodeData[]
  getPageNodes: () => NodeData[]
  findNodes: (predicate: (node: NodeData) => boolean) => NodeData[]
  getNodesByFrontMatter: (key: string, value: unknown) => NodeData[]
  getSlugs: () => string[][]
  isNodeActive: (
    slug: string | string[],
    currentSlug: string | string[]
  ) => boolean
  isNodeChildrenActive: (
    folderSlug: string | string[],
    currentSlug: string | string[]
  ) => boolean
  isNodeChildrenAction: (
    folderSlug: string | string[],
    currentSlug: string | string[]
  ) => boolean
  getNodeBreadcrumbs: (slug?: string | string[]) => BreadcrumbItem[]
  getNodeToc: (slug?: string | string[]) => TocItem[]
  getNodePagination: (slug?: string | string[]) => Pagination | null
  searchContent: (query: string) => SearchResult[]
}

export function useSlugtree(): SlugtreeContextValue {
  const ctx = useClientContext()
  const { tree, nodes, basePath } = ctx

  const slugs = Array.from(
    new Map(
      nodes
        .filter(
          (n) => n.type === 'page' || (n.type === 'folder' && n.href !== undefined)
        )
        .map((n) => [n.slug.join('/'), n.slug])
    ).values()
  )

  return {
    tree,
    nodes,
    basePath,
    slugs,
    getNode: (slug = []) => queryNode(tree, slug, basePath),
    getNodeChildren: (slug = []) => queryNodeChildren(tree, slug, basePath),
    getNodeParent: (slug = []) => queryNodeParent(tree, slug, basePath),
    getNodeSiblings: (slug = []) => queryNodeSiblings(tree, slug, basePath),
    getNodePath: (slug = []) => queryNodePath(tree, slug, basePath),
    getNodeSection: (slug = []) => queryNodeSection(tree, slug, basePath),
    getNodeLabel: (slug = [], scope = 'deep') =>
      queryNodeLabel(tree, slug, scope, basePath),
    getNodeData: (slug = []) => {
      const normalized = normalizeSlug(slug, basePath)
      const slugPath = normalized.join('/')
      return nodes.find((node) => node.slug.join('/') === slugPath)
    },
    getAllNodes: () => nodes,
    getPageNodes: () =>
      nodes.filter(
        (node) =>
          node.type === 'page' ||
          (node.type === 'folder' && node.href !== undefined)
      ),
    findNodes: (predicate) => nodes.filter(predicate),
    getNodesByFrontMatter: (key, value) =>
      nodes.filter(
        (node) =>
          (node.frontMatter as unknown as Record<string, unknown>)[key] ===
          value
      ),
    getSlugs: () => slugs,
    isNodeActive: (slug, currentSlug) =>
      checkNodeActive(slug, currentSlug, basePath),
    isNodeChildrenActive: (folderSlug, currentSlug) =>
      checkNodeChildrenActive(folderSlug, currentSlug, basePath),
    isNodeChildrenAction: (folderSlug, currentSlug) =>
      checkNodeChildrenActive(folderSlug, currentSlug, basePath),
    getNodeBreadcrumbs: (slug = []) =>
      queryNodeBreadcrumbs(tree, nodes, slug, basePath),
    getNodeToc: (slug = []) => queryNodeToc(nodes, slug, basePath),
    getNodePagination: (slug = []) =>
      queryNodePagination(nodes, slug, basePath),
    searchContent: (query) => searchContentNodes(nodes, query)
  }
}

export interface SlugtreeProviderProps {
  slot?: ClientContextState
  children: React.ReactNode
}

export default function SlugtreeProvider({
  slot: propSlot,
  children
}: SlugtreeProviderProps) {
  const [slot, setSlot] = React.useState<ClientContextState>(
    () => propSlot ?? (defaultData as ClientContextState) ?? DEFAULT_STATE
  )

  React.useEffect(() => {
    if (propSlot) {
      setSlot(propSlot)
    }
  }, [propSlot])

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const onCustomUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ClientContextState>
      if (customEvent.detail) {
        setSlot(customEvent.detail)
      }
    }

    window.addEventListener('slugtree:update', onCustomUpdate)
    return () => {
      window.removeEventListener('slugtree:update', onCustomUpdate)
    }
  }, [])

  return (
    <ClientContext.Provider value={slot}>{children}</ClientContext.Provider>
  )
}

export { normalizeSlug }
export type { Pagination, PaginationItem, SearchResult, SearchResultChild }
