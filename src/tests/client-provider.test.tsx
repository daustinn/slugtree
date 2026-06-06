import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Node, NodeData } from '../types.js'
import ClientProvider, {
  ClientContext,
  useTree,
  useNode,
  useNodeChildren,
  useNodeParent,
  useNodeSiblings,
  useNodePath,
  useNodeSection,
  useBasePath,
  useNodeData,
  useAllNodes,
  usePageNodes,
  useFindNodes,
  useIsNodeActive,
  useNodeBreadcrumbs,
  useNodeToc,
  useNodePagination
} from '../client-provider.js'

const mockTree: Node[] = [
  {
    type: 'page',
    slug: [],
    href: '/docs',
    title: 'Home'
  },
  {
    type: 'page',
    slug: ['installation'],
    href: '/docs/installation',
    title: 'Installation'
  },
  {
    type: 'folder',
    slug: ['guides'],
    href: '/docs/guides',
    title: 'Guides',
    children: [
      {
        type: 'page',
        slug: ['guides', 'routing'],
        href: '/docs/guides/routing',
        title: 'Routing'
      },
      {
        type: 'label',
        label: 'Advanced Settings'
      }
    ]
  }
]

const mockNodes: NodeData[] = [
  {
    type: 'page',
    slug: [],
    href: '/docs',
    filePath: 'content/index.mdx',
    frontMatter: { title: 'Home', description: 'Home description' },
    toc: [{ id: 'home', text: 'Home', depth: 1 }],
    rawContent: '# Home'
  },
  {
    type: 'page',
    slug: ['installation'],
    href: '/docs/installation',
    filePath: 'content/installation.mdx',
    frontMatter: { title: 'Installation', description: 'Install guide' },
    toc: [{ id: 'install', text: 'Install', depth: 1 }],
    rawContent: '# Install'
  },
  {
    type: 'page',
    slug: ['guides', 'routing'],
    href: '/docs/guides/routing',
    filePath: 'content/guides/routing.mdx',
    frontMatter: { title: 'Routing', description: 'Routing guide' },
    toc: [{ id: 'routing', text: 'Routing', depth: 1 }],
    rawContent: '# Routing'
  }
]

const mockContextValue = {
  tree: mockTree,
  nodes: mockNodes,
  basePath: '/docs'
}

describe('client-provider hooks', () => {
  beforeEach(() => {
    vi.restoreAllMocks()

    vi.spyOn(React, 'useContext').mockImplementation((context) => {
      if (context === ClientContext) {
        return mockContextValue
      }
      return null
    })
  })

  it('throws error when hook used outside provider', () => {
    vi.spyOn(React, 'useContext').mockReturnValue(null)
    expect(() => useTree()).toThrowError(
      'slugtree hooks must be used within SlugtreeProvider'
    )
  })

  it('useTree returns the correct tree structure', () => {
    expect(useTree()).toEqual(mockTree)
  })

  it('useNode retrieves a node by its slug path', () => {
    expect(useNode([])).toEqual(mockTree[0])
    expect(useNode(['installation'])).toEqual(mockTree[1])
    expect(useNode(['guides', 'routing'])).toEqual(
      (mockTree[2] as any).children[0]
    )
    expect(useNode(['non-existent'])).toBeNull()
  })

  it('useNodeChildren retrieves children for a folder node', () => {
    expect(useNodeChildren(['guides'])).toEqual((mockTree[2] as any).children)
    expect(useNodeChildren(['installation'])).toEqual([])
  })

  it('useNodeParent retrieves the parent node', () => {
    expect(useNodeParent(['guides', 'routing'])).toEqual(mockTree[2])
    expect(useNodeParent(['installation'])).toBeNull()
    expect(useNodeParent([])).toBeNull()
  })

  it('useNodeSiblings retrieves sibling nodes excluding self and labels', () => {
    const siblings = useNodeSiblings(['installation'])
    expect(siblings).toHaveLength(2)
    expect(siblings[0]).toEqual(mockTree[0])
    expect(siblings[1]).toEqual(mockTree[2])

    expect(useNodeSiblings([])).toEqual([])
  })

  it('useNodePath retrieves the path from root to the node', () => {
    const path = useNodePath(['guides', 'routing'])
    expect(path).toHaveLength(2)
    expect(path[0]).toEqual(mockTree[2])
    expect(path[1]).toEqual((mockTree[2] as any).children[0])
  })

  it('useNodeSection retrieves the top level root folder', () => {
    expect(useNodeSection(['guides', 'routing'])).toEqual(mockTree[2])
    expect(useNodeSection(['installation'])).toBeNull()
    expect(useNodeSection([])).toBeNull()
  })

  it('useBasePath returns the correct base path', () => {
    expect(useBasePath()).toBe('/docs')
  })

  it('useNodeData retrieves the exact node data', () => {
    expect(useNodeData(['installation'])).toEqual(mockNodes[1])
    expect(useNodeData(['non-existent'])).toBeUndefined()
  })

  it('useAllNodes returns all node data', () => {
    expect(useAllNodes()).toEqual(mockNodes)
  })

  it('usePageNodes returns only nodes of type page', () => {
    expect(usePageNodes()).toEqual(mockNodes)
  })

  it('useFindNodes returns filtered nodes based on predicate', () => {
    const result = useFindNodes((n) => n.slug.includes('routing'))
    expect(result).toHaveLength(1)
    expect(result[0].frontMatter.title).toBe('Routing')
  })

  it('useIsNodeActive detects active hierarchy correctly', () => {
    expect(useIsNodeActive(['guides'], ['guides', 'routing'])).toBe(true)
    expect(useIsNodeActive(['guides', 'routing'], ['guides', 'routing'])).toBe(
      true
    )
    expect(useIsNodeActive(['installation'], ['guides'])).toBe(false)
    expect(useIsNodeActive([], ['guides'])).toBe(false)
  })

  it('useNodeBreadcrumbs returns correct breadcrumb objects', () => {
    const crumbs = useNodeBreadcrumbs(['guides', 'routing'])
    expect(crumbs).toEqual([
      { title: 'Guides', href: '/docs/guides' },
      { title: 'Routing', href: '/docs/guides/routing' }
    ])
  })

  it('useNodeToc returns table of contents for pages', () => {
    expect(useNodeToc(['installation'])).toEqual([
      { id: 'install', text: 'Install', depth: 1 }
    ])
    expect(useNodeToc(['non-existent'])).toEqual([])
  })

  it('useNodePagination returns correct prev and next buttons', () => {
    const pag = useNodePagination(['installation'])
    expect(pag).not.toBeNull()
    expect(pag?.prev?.title).toBe('Home')
    expect(pag?.next?.title).toBe('Routing')

    const first = useNodePagination([])
    expect(first?.prev).toBeNull()
    expect(first?.next?.title).toBe('Installation')

    const last = useNodePagination(['guides', 'routing'])
    expect(last?.prev?.title).toBe('Installation')
    expect(last?.next).toBeNull()
  })

  it('ClientProvider renders context provider correctly', () => {
    const element = ClientProvider({
      slot: mockContextValue,
      children: <div />
    })
    expect(element).toBeDefined()
    expect(element.type).toBe(ClientContext.Provider)
    expect(element.props.value).toEqual(mockContextValue)
  })
})
