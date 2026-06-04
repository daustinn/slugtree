import { describe, it, expect, vi } from 'vitest'
import { generateContent } from '../lib/generator.js'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

describe('generator', () => {
  it('generates content files correctly', () => {
    const tmpContent = fs.mkdtempSync(path.join(os.tmpdir(), 'content-'))
    const tmpOutput = fs.mkdtempSync(path.join(os.tmpdir(), 'output-'))

    fs.writeFileSync(
      path.join(tmpContent, 'index.mdx'),
      '---\ntitle: Home\n---\n# Home'
    )

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    generateContent(tmpContent, tmpOutput, '/docs')

    expect(fs.existsSync(path.join(tmpOutput, 'tree.ts'))).toBe(true)
    expect(fs.existsSync(path.join(tmpOutput, 'nodes.ts'))).toBe(true)
    expect(fs.existsSync(path.join(tmpOutput, 'meta.ts'))).toBe(true)
    expect(fs.existsSync(path.join(tmpOutput, 'slugs.ts'))).toBe(true)

    const treeContent = fs.readFileSync(
      path.join(tmpOutput, 'tree.ts'),
      'utf-8'
    )
    expect(treeContent).toContain('Home')

    consoleSpy.mockRestore()

    // Cleanup
    fs.rmSync(tmpContent, { recursive: true, force: true })
    fs.rmSync(tmpOutput, { recursive: true, force: true })
  })
})
