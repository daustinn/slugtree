import fs from 'node:fs'

const fileContentCache = new Map<string, string>()

export function setCachedFileContent(filePath: string, content: string): void {
  fileContentCache.set(filePath, content)
}

export function hasFileContentChanged(filePath: string): boolean {
  try {
    if (!fs.existsSync(filePath)) {
      if (fileContentCache.has(filePath)) {
        fileContentCache.delete(filePath)
        return true
      }
      return true
    }

    const currentContent = fs.readFileSync(filePath, 'utf-8')
    const previousContent = fileContentCache.get(filePath)

    if (previousContent !== undefined && previousContent === currentContent) {
      return false
    }

    fileContentCache.set(filePath, currentContent)
    return true
  } catch {
    return true
  }
}

export function clearFileCache(): void {
  fileContentCache.clear()
}
