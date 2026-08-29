import type {
  Node,
  NodeData,
  NodeFolder,
  NodeLabel,
  NodePage,
  TocItem,
  BreadcrumbItem,
  Pagination,
  PaginationItem,
  SearchResult,
  SearchResultChild
} from '../types.js'

export function normalizeSlug(
  slug: string | string[],
  basePath: string = ''
): string[] {
  if (Array.isArray(slug)) return slug
  if (typeof slug === 'string') {
    let s = slug
    if (basePath && s.startsWith(basePath)) s = s.slice(basePath.length)
    return s.split('/').filter(Boolean)
  }
  return []
}

export function findNode(treeNodes: Node[], slugPath: string): Node | null {
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

export function findParentNode(
  treeNodes: Node[],
  slugPath: string
): Node | null {
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

export function findFolderNode(
  treeNodes: Node[],
  targetSlug: string[]
): NodeFolder | null {
  const target = targetSlug.join('/')
  for (const node of treeNodes) {
    if (node.type === 'folder') {
      if (node.slug.join('/') === target) {
        return node
      }
      const found = findFolderNode(node.children, targetSlug)
      if (found) return found
    }
  }
  return null
}

export function buildAncestorChain(
  treeNodes: Node[],
  slugPath: string,
  acc: Array<{ siblings: Node[]; targetSlug: string }> = []
): Array<{ siblings: Node[]; targetSlug: string }> | null {
  for (const node of treeNodes) {
    if (node.type === 'label') continue
    const nodeSlug = node.slug.join('/')
    if (nodeSlug === slugPath) {
      return [...acc, { siblings: treeNodes, targetSlug: nodeSlug }]
    }
    if (node.type === 'folder') {
      const result = buildAncestorChain(node.children, slugPath, [
        ...acc,
        { siblings: treeNodes, targetSlug: nodeSlug }
      ])
      if (result) return result
    }
  }
  return null
}

export function findPrecedingLabel(
  siblings: Node[],
  targetSlug: string
): NodeLabel | null {
  let lastLabel: NodeLabel | null = null
  for (const node of siblings) {
    if (node.type === 'label') {
      lastLabel = node
      continue
    }
    if (node.slug.join('/') === targetSlug) return lastLabel
  }
  return null
}

export function queryNode(
  tree: Node[],
  slug: string | string[] = [],
  basePath: string = ''
): NodePage | NodeFolder | null {
  const normalized = normalizeSlug(slug, basePath)
  const slugPath = normalized.join('/')
  const node = findNode(tree, slugPath)
  if (!node || node.type === 'label') return null
  return node
}

export function queryNodeChildren(
  tree: Node[],
  slug: string | string[] = [],
  basePath: string = ''
): Node[] {
  const node = queryNode(tree, slug, basePath)
  if (!node || node.type !== 'folder') return []
  return node.children
}

export function queryNodeParent(
  tree: Node[],
  slug: string | string[] = [],
  basePath: string = ''
): Node | null {
  const normalized = normalizeSlug(slug, basePath)
  if (normalized.length === 0) return null
  return findParentNode(tree, normalized.join('/'))
}

export function queryNodeSiblings(
  tree: Node[],
  slug: string | string[] = [],
  basePath: string = ''
): Node[] {
  const normalized = normalizeSlug(slug, basePath)
  if (normalized.length === 0) return []
  const slugPath = normalized.join('/')
  const parent = findParentNode(tree, slugPath)
  const siblings = parent && parent.type === 'folder' ? parent.children : tree
  return siblings.filter(
    (n) => n.type !== 'label' && n.slug.join('/') !== slugPath
  )
}

export function queryNodePath(
  tree: Node[],
  slug: string | string[] = [],
  basePath: string = ''
): Node[] {
  const normalized = normalizeSlug(slug, basePath)
  const path: Node[] = []
  for (let i = 1; i <= normalized.length; i++) {
    const node = findNode(tree, normalized.slice(0, i).join('/'))
    if (node) path.push(node)
  }
  return path
}

export function queryNodeSection(
  tree: Node[],
  slug: string | string[] = [],
  basePath: string = ''
): NodeFolder | null {
  const normalized = normalizeSlug(slug, basePath)
  if (normalized.length === 0) return null
  const root = findNode(tree, normalized[0])
  if (!root || root.type !== 'folder') return null
  return root as NodeFolder
}

export function queryNodeLabel(
  tree: Node[],
  slug: string | string[] = [],
  scope: 'local' | 'deep' = 'deep',
  basePath: string = ''
): NodeLabel | null {
  const normalized = normalizeSlug(slug, basePath)
  if (normalized.length === 0) return null
  const chain = buildAncestorChain(tree, normalized.join('/'))
  if (!chain) return null
  const levels =
    scope === 'local' ? [chain[chain.length - 1]] : [...chain].reverse()
  for (const { siblings, targetSlug } of levels) {
    const label = findPrecedingLabel(siblings, targetSlug)
    if (label) return label
  }
  return null
}

export function queryNodeBreadcrumbs(
  tree: Node[],
  nodes: NodeData[],
  slug: string | string[] = [],
  basePath: string = ''
): BreadcrumbItem[] {
  const normalized = normalizeSlug(slug, basePath)
  const crumbs: BreadcrumbItem[] = []
  for (let i = 1; i <= normalized.length; i++) {
    const partialSlug = normalized.slice(0, i)
    const partialPath = partialSlug.join('/')
    const node = nodes.find((n) => n.slug.join('/') === partialPath)
    if (node) {
      crumbs.push({
        ...node.frontMatter,
        title: node.frontMatter.title,
        href: node.href
      })
      continue
    }
    const folderNode = findFolderNode(tree, partialSlug)
    if (folderNode) {
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        children: _children,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        type: _type,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        slug: _slug,
        ...rest
      } = folderNode
      crumbs.push({
        ...rest,
        title: folderNode.title,
        href: folderNode.href
      })
    }
  }
  return crumbs
}

export function queryNodePagination(
  nodes: NodeData[],
  slug: string | string[] = [],
  basePath: string = ''
): Pagination | null {
  const normalized = normalizeSlug(slug, basePath)
  const slugPath = normalized.join('/')
  const flatPages = nodes.filter(
    (n) => n.type === 'page' || (n.type === 'folder' && n.href !== undefined)
  )
  const index = flatPages.findIndex((n) => n.slug.join('/') === slugPath)
  if (index === -1) return null
  const mapToItem = (node: NodeData): PaginationItem => ({
    ...node.frontMatter,
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

export function queryNodeToc(
  nodes: NodeData[],
  slug: string | string[] = [],
  basePath: string = ''
): TocItem[] {
  const normalized = normalizeSlug(slug, basePath)
  const slugPath = normalized.join('/')
  const node = nodes.find((n) => n.slug.join('/') === slugPath)
  return node ? node.toc : []
}

export function isNodeActive(
  slug: string | string[],
  currentSlug: string | string[],
  basePath: string = ''
): boolean {
  const normSlug = normalizeSlug(slug, basePath)
  const normCurrent = normalizeSlug(currentSlug, basePath)
  if (normSlug.length === 0 || normCurrent.length === 0) return false
  const slugPath = normSlug.join('/')
  const currentPath = normCurrent.join('/')
  return currentPath === slugPath || currentPath.startsWith(slugPath + '/')
}

export function isNodeChildrenActive(
  folderSlug: string | string[],
  currentSlug: string | string[],
  basePath: string = ''
): boolean {
  const normFolder = normalizeSlug(folderSlug, basePath)
  const normCurrent = normalizeSlug(currentSlug, basePath)
  if (normFolder.length === 0 || normCurrent.length === 0) return false
  const folderPath = normFolder.join('/')
  const currentPath = normCurrent.join('/')
  return currentPath !== folderPath && currentPath.startsWith(folderPath + '/')
}

export function extractHeadingContent(
  rawContent: string,
  headingText: string,
  maxLength: number = 200
): string {
  const lines = rawContent.split('\n')
  const headingIndex = lines.findIndex(
    (line) =>
      /^#{1,6}\s+/.test(line) &&
      line
        .replace(/^#{1,6}\s+/, '')
        .trim()
        .toLowerCase() === headingText.trim().toLowerCase()
  )
  if (headingIndex === -1) return ''

  const contentLines: string[] = []
  for (let i = headingIndex + 1; i < lines.length; i++) {
    const line = lines[i]
    if (/^#{1,6}\s+/.test(line)) break
    contentLines.push(line)
  }

  const text = contentLines
    .join(' ')
    .replace(/[#*`_~[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return text.length > maxLength
    ? text.slice(0, maxLength).trimEnd() + '\u2026'
    : text
}

export function searchContentNodes(
  nodes: NodeData[],
  query: string
): SearchResult[] {
  if (!query || query.trim() === '') return []
  const lowerQuery = query.toLowerCase()
  const results: SearchResult[] = []

  for (const node of nodes) {
    const isPageLike =
      node.type === 'page' ||
      (node.type === 'folder' && node.href !== undefined)
    if (!isPageLike) continue

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
        ...node.frontMatter,
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
