import { describe, it, expect, vi } from 'vitest'

// Mock the generated files before importing server
vi.mock('../generated/nodes.js', () => ({
  default: [
    {
      type: 'page',
      slug: [],
      href: '/docs',
      filePath: 'content/index.mdx',
      frontMatter: {
        title: 'Home',
        description: 'Home description',
        category: 'getting-started'
      },
      toc: [{ id: 'home', text: 'Home', depth: 1 }],
      rawContent: '# Home'
    },
    {
      type: 'page',
      slug: ['installation'],
      href: '/docs/installation',
      filePath: 'content/installation.mdx',
      frontMatter: {
        title: 'Installation',
        description: 'Install guide',
        category: 'getting-started'
      },
      toc: [{ id: 'install', text: 'Install', depth: 1 }],
      rawContent: '# Install\nTo install slugtree run the command.'
    },
    {
      type: 'folder',
      slug: ['guides'],
      href: '/docs/guides',
      filePath: 'content/guides/index.mdx',
      frontMatter: { title: 'Guides' },
      toc: [],
      rawContent: '',
      children: []
    },
    {
      type: 'page',
      slug: ['guides', 'routing'],
      href: '/docs/guides/routing',
      filePath: 'content/guides/routing.mdx',
      frontMatter: {
        title: 'Routing',
        description: 'Routing guide',
        icon: 'route'
      },
      toc: [
        { id: 'routing', text: 'Routing', depth: 1 },
        { id: 'nested-routing', text: 'Nested Routing', depth: 2 }
      ],
      rawContent:
        '# Routing\nRouting details here.\n## Nested Routing\nNested routing details here.'
    }
  ]
}))

vi.mock('../generated/tree.js', () => ({
  default: [
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
        }
      ]
    }
  ]
}))

vi.mock('../generated/meta.js', () => ({ default: '/docs' }))
vi.mock('../generated/slugs.js', () => ({
  default: [[], ['installation'], ['guides', 'routing']]
}))

import {
  getTree,
  getNode,
  getNodeChildren,
  getNodeParent,
  getNodeSiblings,
  getNodePath,
  getNodeSection,
  getBasePath,
  getNodeData,
  getAllNodes,
  getPageNodes,
  findNodes,
  getNodesByFrontMatter,
  getSlugs,
  isNodeActive,
  getNodePagination,
  getNodeBreadcrumbs,
  getNodeToc,
  searchContent
} from '../server.js'

describe('server utilities', () => {
  describe('getTree', () => {
    it('returns the entire structured tree', () => {
      const tree = getTree()
      expect(tree).toHaveLength(3)
      expect(tree[0].type).toBe('page')
      expect(tree[2].type).toBe('folder')
    })
  })

  describe('getNode', () => {
    it('returns the node matching the slug', () => {
      const node = getNode(['installation'])
      expect(node).not.toBeNull()
      expect(node?.title).toBe('Installation')

      const folder = getNode(['guides'])
      expect(folder).not.toBeNull()
      expect(folder?.type).toBe('folder')
    })

    it('returns null if node not found', () => {
      expect(getNode(['non-existent'])).toBeNull()
    })
  })

  describe('getNodeChildren', () => {
    it('returns children if folder exists', () => {
      const children = getNodeChildren(['guides'])
      expect(children).toHaveLength(1)
      expect((children[0] as any).title).toBe('Routing')
    })

    it('returns empty array if page/label or non-existent slug', () => {
      expect(getNodeChildren(['installation'])).toEqual([])
      expect(getNodeChildren(['non-existent'])).toEqual([])
    })
  })

  describe('getNodeParent', () => {
    it('returns parent node of a child in folder', () => {
      const parent = getNodeParent(['guides', 'routing'])
      expect(parent).not.toBeNull()
      expect(parent?.type).toBe('folder')
      expect((parent as any)?.title).toBe('Guides')
    })

    it('returns null for root level nodes', () => {
      expect(getNodeParent(['installation'])).toBeNull()
      expect(getNodeParent([])).toBeNull()
    })
  })

  describe('getNodeSiblings', () => {
    it('returns siblings at same level excluding self and labels', () => {
      const siblings = getNodeSiblings(['installation'])
      expect(siblings).toHaveLength(2)
      expect((siblings[0] as any).title).toBe('Home')
      expect((siblings[1] as any).title).toBe('Guides')
    })

    it('returns empty array for empty slug', () => {
      expect(getNodeSiblings([])).toEqual([])
    })
  })

  describe('getNodePath', () => {
    it('returns list of nodes from root to page', () => {
      const path = getNodePath(['guides', 'routing'])
      expect(path).toHaveLength(2)
      expect((path[0] as any).title).toBe('Guides')
      expect((path[1] as any).title).toBe('Routing')
    })
  })

  describe('getNodeSection', () => {
    it('returns the root-level folder section containing slug', () => {
      const section = getNodeSection(['guides', 'routing'])
      expect(section).not.toBeNull()
      expect(section?.title).toBe('Guides')
    })

    it('returns null if at root level or not found', () => {
      expect(getNodeSection(['installation'])).toBeNull()
      expect(getNodeSection([])).toBeNull()
    })
  })

  describe('getBasePath', () => {
    it('returns configured base path', () => {
      expect(getBasePath()).toBe('/docs')
    })
  })

  describe('getNodeData', () => {
    it('returns the flattened node data matching slug', () => {
      const data = getNodeData(['installation'])
      expect(data).toBeDefined()
      expect(data?.frontMatter.title).toBe('Installation')
      expect(data?.filePath).toBe('content/installation.mdx')
    })

    it('returns undefined if not found', () => {
      expect(getNodeData(['non-existent'])).toBeUndefined()
    })
  })

  describe('getAllNodes', () => {
    it('returns all flat nodes', () => {
      const nodes = getAllNodes()
      expect(nodes).toHaveLength(4)
    })
  })

  describe('getPageNodes', () => {
    it('returns only page nodes', () => {
      const pages = getPageNodes()
      expect(pages).toHaveLength(3)
      expect(pages.every((p) => p.type === 'page')).toBe(true)
    })
  })

  describe('findNodes', () => {
    it('filters nodes based on predicate', () => {
      const matches = findNodes(
        (n) => (n.frontMatter as any).category === 'getting-started'
      )
      expect(matches).toHaveLength(2)
    })
  })

  describe('getNodesByFrontMatter', () => {
    it('filters nodes by key value match in frontmatter', () => {
      const matches = getNodesByFrontMatter('icon', 'route')
      expect(matches).toHaveLength(1)
      expect(matches[0].frontMatter.title).toBe('Routing')
    })
  })

  describe('getSlugs', () => {
    it('returns all valid slugs', () => {
      const slugs = getSlugs()
      expect(slugs).toEqual([[], ['installation'], ['guides', 'routing']])
    })
  })

  describe('isNodeActive', () => {
    it('returns true if slug is active', () => {
      expect(isNodeActive(['guides'], ['guides', 'routing'])).toBe(true)
      expect(isNodeActive(['guides', 'routing'], ['guides', 'routing'])).toBe(
        true
      )
      expect(isNodeActive(['installation'], ['guides'])).toBe(false)
      expect(isNodeActive([], ['installation'])).toBe(false)
    })
  })

  describe('getNodeBreadcrumbs', () => {
    it('returns breadcrumb list', () => {
      const crumbs = getNodeBreadcrumbs(['guides', 'routing'])
      expect(crumbs).toEqual([
        { title: 'Guides', href: '/docs/guides' },
        { title: 'Routing', href: '/docs/guides/routing' }
      ])
    })
  })

  describe('getTableOfContents', () => {
    it('returns TOC for the root index page', () => {
      const toc = getNodeToc([])
      expect(toc).toEqual([{ id: 'home', text: 'Home', depth: 1 }])
    })

    it('returns TOC for a specific page', () => {
      const toc = getNodeToc(['installation'])
      expect(toc).toEqual([{ id: 'install', text: 'Install', depth: 1 }])
    })

    it('returns empty array for non-existent page', () => {
      const toc = getNodeToc(['does-not-exist'])
      expect(toc).toEqual([])
    })
  })

  describe('getNodePagination', () => {
    it('returns next but no prev for the first page', () => {
      const pagination = getNodePagination([])
      expect(pagination).not.toBeNull()
      expect(pagination?.prev).toBeNull()
      expect(pagination?.next).toEqual({
        title: 'Installation',
        description: 'Install guide',
        href: '/docs/installation',
        slug: ['installation']
      })
    })

    it('returns both prev and next for middle page, skipping folders', () => {
      const pagination = getNodePagination(['installation'])
      expect(pagination).not.toBeNull()

      expect(pagination?.prev).toEqual({
        title: 'Home',
        description: 'Home description',
        href: '/docs',
        slug: []
      })

      expect(pagination?.next).toEqual({
        title: 'Routing',
        description: 'Routing guide',
        href: '/docs/guides/routing',
        slug: ['guides', 'routing']
      })
    })

    it('returns prev but no next for the last page', () => {
      const pagination = getNodePagination(['guides', 'routing'])
      expect(pagination).not.toBeNull()

      expect(pagination?.prev).toEqual({
        title: 'Installation',
        description: 'Install guide',
        href: '/docs/installation',
        slug: ['installation']
      })
      expect(pagination?.next).toBeNull()
    })

    it('returns null for non-existent page', () => {
      const pagination = getNodePagination(['does-not-exist'])
      expect(pagination).toBeNull()
    })
  })

  describe('searchContent', () => {
    it('returns empty array on empty query', () => {
      expect(searchContent('')).toEqual([])
      expect(searchContent('   ')).toEqual([])
    })

    it('matches titles and sorts by relevance', () => {
      const results = searchContent('routing')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Routing')
      expect(results[0].matchScore).toBeGreaterThan(0)
    })

    it('matches description', () => {
      const results = searchContent('Install guide')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Installation')
    })

    it('matches headings inside page TOC and returns them as children with excerpts', () => {
      const results = searchContent('Nested')
      expect(results).toHaveLength(1)

      const pageResult = results[0]
      expect(pageResult.title).toBe('Routing')
      expect(pageResult.children).toHaveLength(1)
      expect(pageResult.children[0].title).toBe('Nested Routing')
      expect(pageResult.children[0].type).toBe('subtitle')
      expect(pageResult.children[0].content).toContain(
        'Nested routing details here.'
      )
    })
  })
})
