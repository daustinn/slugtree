import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

export const siteConfig = {
  name: 'slugtree',
  description: 'Write in MDX. Let Slugtree build the tree.',
  url: baseUrl,
  ogImage: '/og.png',
  ogImageDocs: '/og-docs.png',
  links: {
    twitter: 'https://twitter.com/daustinndev',
    github: 'https://github.com/daustinn/slugtree'
  }
}

export const sharedMetadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: [
    'Next.js',
    'React',
    'MDX',
    'Documentation',
    'Builder',
    'Static Site Generator',
    'Slugtree'
  ],
  authors: [
    {
      name: 'Daustinn',
      url: 'https://daustinn.com'
    }
  ],
  creator: 'Daustinn',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@daustinn'
  },
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/'
  }
}
