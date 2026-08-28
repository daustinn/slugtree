import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import type { FrontMatter, DirConfig, TocItem } from '../types.js'
import { slugify } from './slugify.js'
import { setCachedFileContent } from './cache.js'

export function parseFrontMatter(
  raw: string,
  fallbackTitle: string
): {
  frontMatter: FrontMatter
  content: string
} {
  if (typeof raw !== 'string') {
    return {
      frontMatter: { title: fallbackTitle },
      content: ''
    }
  }

  const cleanRaw = raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw
  let data: Record<string, unknown> = {}
  let content = cleanRaw

  try {
    const parsed = matter(cleanRaw)
    data = parsed.data || {}
    content = parsed.content ?? cleanRaw
  } catch {
    const match = cleanRaw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
    if (match) {
      const fmStr = match[1]
      content = match[2]
      const lines = fmStr.split(/\r?\n/)
      for (const line of lines) {
        const colonIdx = line.indexOf(':')
        if (colonIdx !== -1) {
          const key = line.slice(0, colonIdx).trim()
          let val = line.slice(colonIdx + 1).trim()
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1)
          }
          data[key] = val
        }
      }
    }
  }

  const title =
    typeof data.title === 'string' && data.title.trim() !== ''
      ? data.title
      : fallbackTitle
  const description =
    typeof data.description === 'string' ? data.description : undefined
  const icon = typeof data.icon === 'string' ? data.icon : undefined
  const href = typeof data.href === 'string' ? data.href : undefined

  return {
    frontMatter: { title, description, icon, href },
    content
  }
}

export function extractToc(content: string): TocItem[] {
  if (typeof content !== 'string') return []

  const items: TocItem[] = []
  let inCodeBlock = false
  const lines = content.split(/\r?\n/)

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue

    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (!match) continue

    const depth = match[1].length
    const text = match[2].trim().replace(/[*_`[\]]/g, '')

    const id = slugify(text)

    if (id) {
      items.push({ id, text, depth })
    }
  }
  return items
}

export function parseDirConfig(raw: string): DirConfig {
  if (typeof raw !== 'string' || !raw.trim()) return {}
  try {
    const clean = raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw
    const parsed = JSON.parse(clean)
    if (!parsed || typeof parsed !== 'object') return {}

    return {
      title: typeof parsed.title === 'string' ? parsed.title : undefined,
      icon: typeof parsed.icon === 'string' ? parsed.icon : undefined,
      nodes: Array.isArray(parsed.nodes)
        ? parsed.nodes.filter((p: unknown) => typeof p === 'string')
        : undefined
    }
  } catch {
    return {}
  }
}

export function readConfigFromDir(dir: string): DirConfig {
  try {
    const configPath = path.join(dir, 'config.json')
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf-8')
      setCachedFileContent(configPath, content)
      return parseDirConfig(content)
    }
  } catch {
    // ignore
  }
  return {}
}
