import { MetadataRoute } from 'next'
import { siteConfig } from '@/const/metadata'
import { getSlugs } from 'slugtree'

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getSlugs()

  const docsRoutes = slugs.map((slug) => ({
    url: `${siteConfig.url}/docs/${slug.join('/')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8
  }))

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1
    },
    {
      url: `${siteConfig.url}/docs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9
    },
    ...docsRoutes
  ]
}
