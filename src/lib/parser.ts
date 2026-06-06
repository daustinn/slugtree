import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import type { FrontMatter, DirConfig, TocItem } from '../types.js'

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

  let data: Record<string, unknown> = {}
  let content = raw

  try {
    const parsed = matter(raw)
    data = parsed.data || {}
    content = parsed.content ?? raw
  } catch {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
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

  return {
    frontMatter: { title, description, icon },
    content
  }
}

export function extractToc(content: string): TocItem[] {
  if (typeof content !== 'string') return []

  const items: TocItem[] = []
  let inCodeBlock = false
  const lines = content.split('\n')

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
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    if (id) {
      items.push({ id, text, depth })
    }
  }
  return items
}

export function parseDirConfig(raw: string): DirConfig {
  if (typeof raw !== 'string' || !raw.trim()) return {}
  try {
    const parsed = JSON.parse(raw)
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
      return parseDirConfig(content)
    }
  } catch {
    // ignore
  }
  return {
    // ignore
  }
}
