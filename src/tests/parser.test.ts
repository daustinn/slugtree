import { describe, it, expect } from 'vitest'
import { parseFrontMatter, extractToc, parseDirConfig } from '../lib/parser.js'

describe('parser', () => {
  describe('parseFrontMatter', () => {
    it('parses valid yaml frontmatter', () => {
      const raw = `---\ntitle: "Test"\ndescription: "A test"\n---\n# Content`
      const result = parseFrontMatter(raw, 'Fallback')
      expect(result.frontMatter.title).toBe('Test')
      expect(result.frontMatter.description).toBe('A test')
      expect(result.content.trim()).toBe('# Content')
    })
    it('falls back to title if missing', () => {
      const raw = `# Content`
      const result = parseFrontMatter(raw, 'Fallback')
      expect(result.frontMatter.title).toBe('Fallback')
      expect(result.content.trim()).toBe('# Content')
    })
    it('handles malformed yaml frontmatter safely', () => {
      const raw = `---\ntitle: "Test\n---\n# Content`
      const result = parseFrontMatter(raw, 'Fallback')
      expect(result.frontMatter.title).toBe('"Test')
    })
  })

  describe('extractToc', () => {
    it('extracts headers', () => {
      const content = `# Header 1\nSome text\n## Header 2\n### Header 3`
      const toc = extractToc(content)
      expect(toc).toHaveLength(3)
      expect(toc[0]).toEqual({ id: 'header-1', text: 'Header 1', depth: 1 })
      expect(toc[1]).toEqual({ id: 'header-2', text: 'Header 2', depth: 2 })
      expect(toc[2]).toEqual({ id: 'header-3', text: 'Header 3', depth: 3 })
    })
    it('ignores code blocks that look like headers', () => {
      const content = `\`\`\`bash\n# comment\n\`\`\``
      const toc = extractToc(content)
      expect(toc).toHaveLength(0)
    })
  })

  describe('parseDirConfig', () => {
    it('parses valid config', () => {
      const raw = `{"title": "My Folder", "nodes": ["index", "other"]}`
      const config = parseDirConfig(raw)
      expect(config.title).toBe('My Folder')
      expect(config.nodes).toEqual(['index', 'other'])
    })
    it('handles invalid json', () => {
      const raw = `{title: "My Folder"`
      const config = parseDirConfig(raw)
      expect(config).toEqual({})
    })
  })
})
