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

export function useTree(): Node[] {
  return useClientContext().tree
}

export function useNode(slug: string[] = []): Node | null {
  const { tree } = useClientContext()
  return findNode(tree, slug.join('/'))
}

export function useNodeChildren(slug: string[] = []): Node[] {
  const { tree } = useClientContext()
  const node = findNode(tree, slug.join('/'))
  if (!node || node.type !== 'folder') return []
  return node.children
}

export function useNodeParent(slug: string[] = []): Node | null {
  const { tree } = useClientContext()
  if (slug.length === 0) return null
  return findParentNode(tree, slug.join('/'))
}

export function useNodeSiblings(slug: string[] = []): Node[] {
  const { tree } = useClientContext()
  if (slug.length === 0) return []
  const slugPath = slug.join('/')

  const parent = findParentNode(tree, slugPath)
  const siblings = parent && parent.type === 'folder' ? parent.children : tree

  return siblings.filter(
    (n) => n.type !== 'label' && n.slug.join('/') !== slugPath
  )
}

export function useNodePath(slug: string[] = []): Node[] {
  const { tree } = useClientContext()
  const path: Node[] = []
  for (let i = 1; i <= slug.length; i++) {
    const node = findNode(tree, slug.slice(0, i).join('/'))
    if (node) path.push(node)
  }
  return path
}

export function useNodeSection(slug: string[] = []): NodeFolder | null {
  const { tree } = useClientContext()
  if (slug.length === 0) return null
  const root = findNode(tree, slug[0])
  if (!root || root.type !== 'folder') return null
  return root as NodeFolder
}

export function useBasePath(): string {
  return useClientContext().basePath
}

export function useNodeData(slug: string[] = []): NodeData | undefined {
  const { nodes } = useClientContext()
  const slugPath = slug.join('/')
  return nodes.find((node) => node.slug.join('/') === slugPath)
}

export function useAllNodes(): NodeData[] {
  return useClientContext().nodes
}

export function usePageNodes(): NodeData[] {
  return useClientContext().nodes.filter((n) => n.type === 'page')
}

export function useFindNodes(
  predicate: (node: NodeData) => boolean
): NodeData[] {
  return useClientContext().nodes.filter(predicate)
}

export function useIsNodeActive(
  slug: string[],
  currentSlug: string[]
): boolean {
  if (slug.length === 0 || currentSlug.length === 0) return false
  const slugPath = slug.join('/')
  const currentPath = currentSlug.join('/')
  return currentPath === slugPath || currentPath.startsWith(slugPath + '/')
}

export function useNodeBreadcrumbs(slug: string[] = []): BreadcrumbItem[] {
  const { nodes, tree } = useClientContext()
  const crumbs: BreadcrumbItem[] = []

  for (let i = 1; i <= slug.length; i++) {
    const partialSlug = slug.slice(0, i)
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

export function useNodeToc(slug: string[] = []): TocItem[] {
  const { nodes } = useClientContext()
  const slugPath = slug.join('/')
  const node = nodes.find((n) => n.slug.join('/') === slugPath)
  return node ? node.toc : []
}

export function useNodePagination(slug: string[] = []): Pagination | null {
  const { nodes } = useClientContext()
  const slugPath = slug.join('/')
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
