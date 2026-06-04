import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { buildPageNode, buildDirNodes } from '../lib/builder.js'
import type { NodeData, NodePage, NodeFolder, NodeLabel } from '../types.js'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

describe('builder', () => {
  let tmpDir: string

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slugtree-test-'))
    fs.writeFileSync(
      path.join(tmpDir, 'index.mdx'),
      '---\ntitle: Home\n---\n# Welcome'
    )
    fs.writeFileSync(
      path.join(tmpDir, 'about.mdx'),
      '---\ntitle: About Us\n---\n# About'
    )

    const subDir = path.join(tmpDir, 'guide')
    fs.mkdirSync(subDir)
    fs.writeFileSync(
      path.join(subDir, 'index.mdx'),
      '---\ntitle: Guide\n---\n# Guide'
    )
    fs.writeFileSync(
      path.join(subDir, 'start.mdx'),
      '---\ntitle: Start\n---\n# Start'
    )
    fs.writeFileSync(
      path.join(subDir, 'config.json'),
      JSON.stringify({
        title: 'User Guide',
        nodes: ['index', '--- Settings ---', 'start']
      })
    )
  })

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  describe('buildPageNode', () => {
    it('creates a page node properly from an existing file', () => {
      const allNodesData: NodeData[] = []
      const node = buildPageNode(
        path.join(tmpDir, 'about.mdx'),
        ['about'],
        '/docs',
        allNodesData
      )

      expect(node.type).toBe('page')
      expect((node as NodePage).title).toBe('About Us')
      expect((node as NodePage).slug).toEqual(['about'])
      expect((node as NodePage).href).toBe('/docs/about')

      expect(allNodesData).toHaveLength(1)
      expect(allNodesData[0].frontMatter.title).toBe('About Us')
    })

    it('handles missing files gracefully', () => {
      const allNodesData: NodeData[] = []
      const node = buildPageNode(
        path.join(tmpDir, 'missing.mdx'),
        ['missing'],
        '/docs',
        allNodesData
      )

      expect((node as NodePage).title).toBe('Missing')
      expect(allNodesData[0].rawContent).toBe('')
    })
  })

  describe('buildDirNodes', () => {
    it('builds a tree of nodes from a directory structure', () => {
      const allNodesData: NodeData[] = []
      const nodes = buildDirNodes(tmpDir, [], '/docs', allNodesData)

      expect(nodes.length).toBe(3)

      const guideNode = nodes.find(
        (n) => n.type === 'folder' && n.href === '/docs/guide'
      ) as NodeFolder
      expect(guideNode).toBeDefined()
      expect(guideNode.title).toBe('User Guide')
      expect(guideNode.children).toBeDefined()

      expect(guideNode.children).toHaveLength(3)
      expect(guideNode.children[0].type).toBe('page')
      expect(guideNode.children[1].type).toBe('label')
      expect((guideNode.children[1] as NodeLabel).label).toBe('Settings')
      expect(guideNode.children[2].type).toBe('page')
    })
  })
})
