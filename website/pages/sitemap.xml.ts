import type { APIRoute } from 'astro'
import { getSlugs, getNodeData } from 'slugtree'
import { seo } from '#/const/seo'
import getModifiedDate from '#/lib/get-modified-date'

export const GET: APIRoute = async ({ site }) => {
  const siteOrigin = site
    ? site.toString().replace(/\/$/, '')
    : seo.siteUrl.replace(/\/$/, '')

  const slugs = getSlugs()
  const pages: {
    loc: string
    lastmod?: string
    changefreq: string
    priority: string
  }[] = [
    {
      loc: `${siteOrigin}/`,
      changefreq: 'daily',
      priority: '1.0'
    }
  ]

  for (const slug of slugs) {
    const slugStr = Array.isArray(slug) ? slug.join('/') : slug
    const nodeData = getNodeData(slug)
    const modifiedTime = nodeData ? getModifiedDate(nodeData.filePath) : null

    pages.push({
      loc: `${siteOrigin}/${slugStr}`,
      lastmod: modifiedTime ? modifiedTime.toISOString() : undefined,
      changefreq: 'weekly',
      priority: '0.8'
    })
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${page.loc}</loc>${page.lastmod ? `\n    <lastmod>${page.lastmod}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  })
}
