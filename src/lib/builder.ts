import fs from 'node:fs'
import path from 'node:path'
import type { Node, NodeData } from '../types.js'
import { parseFrontMatter, extractToc, readConfigFromDir } from './parser.js'
import { slugToHref, isLabel, extractLabelText, capitalize } from './utils.js'

export function buildPageNode(
  filePath: string,
  slug: string[],
  basePath: string,
  allNodesData: NodeData[]
): Node {
  let raw = ''
  try {
    raw = fs.readFileSync(filePath, 'utf-8')
  } catch {
    // ignore
  }
  const fileName = path.basename(filePath, '.mdx')
  const fallbackTitle = capitalize(fileName)
  const { frontMatter, content } = parseFrontMatter(raw, fallbackTitle)
  const toc = extractToc(content)

  const nodeData: NodeData = {
    type: 'page',
    slug,
    href: slugToHref(slug, basePath),
    filePath,
    frontMatter,
    toc,
    rawContent: content
  }
  allNodesData.push(nodeData)

  return {
    type: 'page',
    slug,
    href: slugToHref(slug, basePath),
    title: frontMatter.title,
    description: frontMatter.description,
    icon: frontMatter.icon
  }
}

export function buildDirNodes(
  dir: string,
  parentSlug: string[],
  basePath: string,
  allNodesData: NodeData[]
): Node[] {
  const config = readConfigFromDir(dir)
  let entries: string[] = []
  try {
    if (fs.existsSync(dir)) {
      entries = fs.readdirSync(dir)
    }
  } catch {
    // ignore
  }

  const mdxFiles = entries.filter((f) => f.endsWith('.mdx'))
  const subDirs = entries.filter((f) =>
    fs.statSync(path.join(dir, f)).isDirectory()
  )

  const fileMap = new Map<string, string>()
  for (const f of mdxFiles) {
    const stem = f.replace(/\.mdx$/, '')
    fileMap.set(stem, path.join(dir, f))
  }

  const dirMap = new Map<string, string>()
  for (const d of subDirs) {
    dirMap.set(d, path.join(dir, d))
  }

  const nodes: Node[] = []

  if (config.nodes && config.nodes.length > 0) {
    for (const entry of config.nodes) {
      if (isLabel(entry)) {
        nodes.push({ type: 'label', label: extractLabelText(entry) })
        continue
      }
      if (fileMap.has(entry)) {
        const slug = entry === 'index' ? parentSlug : [...parentSlug, entry]
        nodes.push(
          buildPageNode(fileMap.get(entry)!, slug, basePath, allNodesData)
        )
        fileMap.delete(entry)
        continue
      }
      if (dirMap.has(entry)) {
        const dirPath = dirMap.get(entry)!
        const slug = [...parentSlug, entry]
        nodes.push(
          buildFolderNode(dirPath, slug, entry, basePath, allNodesData)
        )
        dirMap.delete(entry)
        continue
      }
    }
  }

  for (const [stem, filePath] of fileMap) {
    const slug = stem === 'index' ? parentSlug : [...parentSlug, stem]
    nodes.push(buildPageNode(filePath, slug, basePath, allNodesData))
  }

  for (const [name, dirPath] of dirMap) {
    const slug = [...parentSlug, name]
    nodes.push(buildFolderNode(dirPath, slug, name, basePath, allNodesData))
  }

  return nodes
}

export function buildFolderNode(
  dirPath: string,
  slug: string[],
  dirName: string,
  basePath: string,
  allNodesData: NodeData[]
): Node {
  const dirConfig = readConfigFromDir(dirPath)
  const indexPath = path.join(dirPath, 'index.mdx')
  const hasIndex = fs.existsSync(indexPath)

  const folderHref: string | undefined = hasIndex
    ? slugToHref(slug, basePath)
    : undefined

  const folderTitle = dirConfig.title ?? capitalize(dirName)
  let folderFrontMatter: NodeData['frontMatter'] = {
    title: folderTitle,
    icon: dirConfig.icon
  }
  let folderRawContent = ''
  let folderToc: NodeData['toc'] = []
  const folderFilePath = indexPath

  if (hasIndex) {
    let raw = ''
    try {
      raw = fs.readFileSync(indexPath, 'utf-8')
    } catch {
      // ignore
    }
    const { frontMatter, content } = parseFrontMatter(raw, folderTitle)
    const toc = extractToc(content)

    folderFrontMatter = { ...frontMatter, title: folderTitle }
    folderRawContent = content
    folderToc = toc
  }

  const childNodesData: NodeData[] = []
  const children = buildDirNodes(dirPath, slug, basePath, childNodesData)

  const folderNodeData: NodeData = {
    type: 'folder',
    slug,
    href: folderHref,
    filePath: folderFilePath,
    frontMatter: folderFrontMatter,
    toc: folderToc,
    rawContent: folderRawContent,
    children: childNodesData
  }

  allNodesData.push(folderNodeData)
  for (const p of childNodesData) {
    if (p.type === 'page' && p.slug.join('/') === slug.join('/')) continue
    allNodesData.push(p)
  }

  return {
    type: 'folder',
    title: folderTitle,
    description: folderFrontMatter.description,
    slug,
    href: folderHref,
    children,
    icon: dirConfig.icon ?? folderFrontMatter.icon
  }
}
