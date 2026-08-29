import fs from 'node:fs'
import path from 'node:path'
import type { Node, NodeData } from '../types.js'
import { parseFrontMatter, extractToc, readConfigFromDir } from './parser.js'
import { slugToHref, isLabel, extractLabelText, capitalize } from './utils.js'
import { setCachedFileContent } from './cache.js'

export function buildPageNode(
  filePath: string,
  slug: string[],
  basePath: string,
  allNodesData: NodeData[]
): Node {
  let raw = ''
  try {
    raw = fs.readFileSync(filePath, 'utf-8')
    setCachedFileContent(filePath, raw)
  } catch {
    // ignore
  }
  const ext = filePath.endsWith('.md') ? '.md' : '.mdx'
  const fileName = path.basename(filePath, ext)
  const fallbackTitle = capitalize(fileName)
  const { frontMatter, content } = parseFrontMatter(raw, fallbackTitle)
  const toc = extractToc(content)
  const href = frontMatter.href ?? slugToHref(slug, basePath)

  const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/')

  const nodeData: NodeData = {
    type: 'page',
    slug,
    href,
    filePath,
    relativePath,
    frontMatter,
    toc,
    rawContent: content
  }
  allNodesData.push(nodeData)

  return {
    ...frontMatter,
    type: 'page',
    slug,
    href,
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

  const mdxFiles = entries.filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
  const subDirs = entries.filter((f) =>
    fs.statSync(path.join(dir, f)).isDirectory()
  )

  const fileMap = new Map<string, string>()
  for (const f of mdxFiles) {
    const stem = f.replace(/\.(mdx|md)$/, '')
    if (!fileMap.has(stem)) fileMap.set(stem, path.join(dir, f))
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
  const indexPathMdx = path.join(dirPath, 'index.mdx')
  const indexPathMd = path.join(dirPath, 'index.md')
  const hasIndexMdx = fs.existsSync(indexPathMdx)
  const hasIndexMd = fs.existsSync(indexPathMd)
  const hasIndex = hasIndexMdx || hasIndexMd
  const indexPath = hasIndexMdx ? indexPathMdx : indexPathMd

  const folderHref: string | undefined = hasIndex
    ? slugToHref(slug, basePath)
    : undefined

  let folderTitle = dirConfig.title ?? capitalize(dirName)
  let folderFrontMatter: NodeData['frontMatter'] = {
    title: folderTitle,
    icon: dirConfig.icon
  }
  let folderRawContent = ''
  let folderToc: NodeData['toc'] = []
  const folderFilePath = hasIndex ? indexPath : dirPath

  if (hasIndex) {
    let raw = ''
    try {
      raw = fs.readFileSync(indexPath, 'utf-8')
      setCachedFileContent(indexPath, raw)
    } catch {
      // ignore
    }
    const { frontMatter, content } = parseFrontMatter(raw, folderTitle)
    const toc = extractToc(content)

    folderTitle = dirConfig.title ?? frontMatter.title
    folderFrontMatter = { ...frontMatter, title: folderTitle }
    folderRawContent = content
    folderToc = toc
  }

  const childNodesData: NodeData[] = []
  const children = buildDirNodes(dirPath, slug, basePath, childNodesData)

  const folderRelativePath = path.relative(process.cwd(), folderFilePath).replace(/\\/g, '/')

  const folderNodeData: NodeData = {
    type: 'folder',
    slug,
    href: folderHref,
    filePath: folderFilePath,
    relativePath: folderRelativePath,
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
    ...folderFrontMatter,
    type: 'folder',
    title: folderTitle,
    description: folderFrontMatter.description,
    slug,
    href: folderHref,
    children,
    icon: dirConfig.icon ?? folderFrontMatter.icon
  }
}
