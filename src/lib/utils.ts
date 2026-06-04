export function slugToHref(slug: string[], basePath: string): string {
  const normalizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath
  const joined = slug.filter(Boolean).join('/')
  if (!joined) return normalizedBase || '/'
  return `${normalizedBase}/${joined}`
}

export function isLabel(entry: string): boolean {
  if (typeof entry !== 'string') return false
  return entry.startsWith('---') && entry.endsWith('---')
}

export function extractLabelText(entry: string): string {
  if (typeof entry !== 'string') return ''
  return entry
    .replace(/^-+\s*/, '')
    .replace(/\s*-+$/, '')
    .trim()
}

export function capitalize(str: string): string {
  if (typeof str !== 'string' || !str) return ''
  return str
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
