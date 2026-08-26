import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  hasFileContentChanged,
  setCachedFileContent,
  clearFileCache
} from '../lib/cache.js'

describe('cache utilities', () => {
  let tmpDir: string

  beforeEach(() => {
    clearFileCache()
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slugtree-cache-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
    clearFileCache()
  })

  it('detects changes when a new file is created', () => {
    const file = path.join(tmpDir, 'test.mdx')
    fs.writeFileSync(file, '# Hello')

    expect(hasFileContentChanged(file)).toBe(true)
  })

  it('returns false when file content has not changed', () => {
    const file = path.join(tmpDir, 'test.mdx')
    fs.writeFileSync(file, '# Hello')

    hasFileContentChanged(file)
    expect(hasFileContentChanged(file)).toBe(false)
  })

  it('returns true when file content is modified', () => {
    const file = path.join(tmpDir, 'test.mdx')
    fs.writeFileSync(file, '# Hello')
    hasFileContentChanged(file)

    fs.writeFileSync(file, '# Hello World')
    expect(hasFileContentChanged(file)).toBe(true)
  })

  it('respects setCachedFileContent', () => {
    const file = path.join(tmpDir, 'test.mdx')
    fs.writeFileSync(file, '# Initial')

    setCachedFileContent(file, '# Initial')
    expect(hasFileContentChanged(file)).toBe(false)

    fs.writeFileSync(file, '# Changed')
    expect(hasFileContentChanged(file)).toBe(true)
  })

  it('detects deleted files', () => {
    const file = path.join(tmpDir, 'test.mdx')
    fs.writeFileSync(file, '# Hello')
    hasFileContentChanged(file)

    fs.unlinkSync(file)
    expect(hasFileContentChanged(file)).toBe(true)
  })
})
