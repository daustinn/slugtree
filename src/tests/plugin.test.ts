import { describe, it, expect, vi } from 'vitest'
import { withSlugtree } from '../plugin.js'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

describe('plugin', () => {
  it('wraps nextConfig and generates content', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-test-'))
    const contentDir = path.join(tmpDir, 'content')
    const outputDir = path.join(tmpDir, 'generated')

    fs.mkdirSync(contentDir)
    fs.writeFileSync(path.join(contentDir, 'index.mdx'), '# Hello')

    const nextConfig = { reactStrictMode: true }

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const wrappedConfig = withSlugtree(nextConfig, {
      contentDir,
      outputDir,
      basePath: '/docs'
    })

    expect(wrappedConfig).toBe(nextConfig)
    expect(wrappedConfig.reactStrictMode).toBe(true)

    expect(fs.existsSync(outputDir)).toBe(true)
    expect(fs.existsSync(path.join(outputDir, 'tree.ts'))).toBe(true)

    consoleSpy.mockRestore()

    fs.rmSync(tmpDir, { recursive: true, force: true })
  })
})
