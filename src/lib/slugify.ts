/**
 * Generates a URL-friendly slug (ID) from a given text string.
 *
 * @param text - The raw string to be converted into a slug.
 * @returns A normalized string containing only lowercase letters, numbers, and hyphens.
 */

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
