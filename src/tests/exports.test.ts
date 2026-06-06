import { describe, it, expect } from 'vitest'
import * as indexExports from '../index.js'
import * as reactExports from '../react.js'
import * as nextExports from '../next.js'

describe('entrypoint exports', () => {
  describe('index.ts', () => {
    it('exports all server helper functions', () => {
      expect(indexExports.getTree).toBeTypeOf('function')
      expect(indexExports.getNode).toBeTypeOf('function')
      expect(indexExports.getNodeChildren).toBeTypeOf('function')
      expect(indexExports.getNodeParent).toBeTypeOf('function')
      expect(indexExports.getNodeSiblings).toBeTypeOf('function')
      expect(indexExports.getNodePath).toBeTypeOf('function')
      expect(indexExports.getNodeSection).toBeTypeOf('function')
      expect(indexExports.getBasePath).toBeTypeOf('function')
      expect(indexExports.getNodeData).toBeTypeOf('function')
      expect(indexExports.getAllNodes).toBeTypeOf('function')
      expect(indexExports.getPageNodes).toBeTypeOf('function')
      expect(indexExports.findNodes).toBeTypeOf('function')
      expect(indexExports.getNodesByFrontMatter).toBeTypeOf('function')
      expect(indexExports.getSlugs).toBeTypeOf('function')
      expect(indexExports.isNodeActive).toBeTypeOf('function')
      expect(indexExports.getNodePagination).toBeTypeOf('function')
      expect(indexExports.getNodeBreadcrumbs).toBeTypeOf('function')
      expect(indexExports.getNodeToc).toBeTypeOf('function')
      expect(indexExports.searchContent).toBeTypeOf('function')
    })
  })

  describe('react.tsx', () => {
    it('exports SlugtreeProvider component and hook functions', () => {
      expect(reactExports.SlugtreeProvider).toBeTypeOf('function')
      expect(reactExports.useTree).toBeTypeOf('function')
      expect(reactExports.useNode).toBeTypeOf('function')
      expect(reactExports.useNodeChildren).toBeTypeOf('function')
      expect(reactExports.useNodeParent).toBeTypeOf('function')
      expect(reactExports.useNodeSiblings).toBeTypeOf('function')
      expect(reactExports.useNodePath).toBeTypeOf('function')
      expect(reactExports.useNodeSection).toBeTypeOf('function')
      expect(reactExports.useBasePath).toBeTypeOf('function')
      expect(reactExports.useNodeData).toBeTypeOf('function')
      expect(reactExports.useAllNodes).toBeTypeOf('function')
      expect(reactExports.usePageNodes).toBeTypeOf('function')
      expect(reactExports.useFindNodes).toBeTypeOf('function')
      expect(reactExports.useIsNodeActive).toBeTypeOf('function')
      expect(reactExports.useNodeBreadcrumbs).toBeTypeOf('function')
      expect(reactExports.useNodeToc).toBeTypeOf('function')
      expect(reactExports.useNodePagination).toBeTypeOf('function')
    })
  })

  describe('next.ts', () => {
    it('exports withSlugtree configuration wrapper', () => {
      expect(nextExports.withSlugtree).toBeTypeOf('function')
    })
  })
})
