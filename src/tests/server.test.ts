import { describe, it, expect, vi } from 'vitest'

// Mock the generated files before importing server
vi.mock('../generated/nodes.js', () => ({
  default: [
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
      frontMatter: { title: 'Routing', description: 'Routing guide' },
      toc: [{ id: 'routing', text: 'Routing', depth: 1 }],
      rawContent: '# Routing'
    }
  ]
}))

vi.mock('../generated/tree.js', () => ({ default: [] }))
vi.mock('../generated/meta.js', () => ({ default: '/docs' }))
vi.mock('../generated/slugs.js', () => ({
  default: [[], ['installation'], ['guides', 'routing']]
}))

import { getNodeToc, getNodePagination } from '../server.js'

describe('server utilities', () => {
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

      // Should skip the "guides" folder and go directly to the "routing" page
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
})
