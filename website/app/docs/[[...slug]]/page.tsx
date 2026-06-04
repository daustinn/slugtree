import {
  getNodeData,
  getNode,
  getSlugs,
  getNodeBreadcrumbs,
  getNodePagination
} from 'slugtree'

import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { siteConfig } from '@/const/metadata'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import mdxComponents from '@/components/mdx'
import RootRightSidebar from '@/components/sidebar/right'
import Link from 'next/link'
import React from 'react'
import { cn } from '@/lib/cn'
import { ChevronLeft, ChevronRight } from '@/components/icons'
import * as Icons from '@/components/icons'

interface PageProps {
  params: Promise<{ slug?: string[] }>
}

export default async function DocPage({ params }: PageProps) {
  const { slug = [] } = await params

  const data = getNodeData(slug)
  const breadcrumbs = getNodeBreadcrumbs(slug).slice(0, -1)
  const pagination = getNodePagination(slug)

  if (!data) notFound()
  const Icon = data.frontMatter.icon
    ? (Icons as any)[data.frontMatter.icon]
    : null

  return (
    <>
      <section className="grow flex flex-col font-sans">
        <header className="pt-10 pb-10">
          {breadcrumbs.length > 0 && (
            <nav className="max-w-2xl px-3 flex pb-4 text-sm w-full mx-auto">
              {breadcrumbs.map((b, i) => (
                <React.Fragment key={b.href + 'breadcrumb'}>
                  <Link
                    href={i === breadcrumbs.length - 1 ? b.href || '#' : '#'}
                    className="data-last:cursor-text data-last:dark:text-blue-500"
                    data-last={i === breadcrumbs.length - 1 ? '' : undefined}
                  >
                    {b.title}
                  </Link>
                  {i !== breadcrumbs.length - 1 && (
                    <div className="mx-1 font-pixel">/</div>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
          <nav className="max-w-2xl px-3 mx-auto w-full">
            <h1 className="text-3xl font-pixel font-bold pb-2 flex items-center">
              {Icon && <Icon width={30} className="mr-4" />}
              {data.frontMatter.title}
            </h1>
            <p className="text-lg pb-3 font-pixel opacity-70">
              {data.frontMatter.description}
            </p>
          </nav>
        </header>
        <article className="grow max-w-2xl px-3 mx-auto w-full">
          <MDXRemote
            source={data.rawContent}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeSlug]
              }
            }}
          />
        </article>
        <footer className="border-t py-4 mt-10">
          <div className="max-w-2xl px-3 justify-between mx-auto w-full flex">
            {[pagination?.prev, pagination?.next].map(
              (p, i) =>
                p && (
                  <Link
                    key={p.href}
                    href={p.href}
                    className={cn('w-full py-5', {
                      'text-right [&>div]:flex-row-reverse hover:[&>div>div>svg]:translate-x-1':
                        i === 1,
                      'hover:[&>div>div>svg]:-translate-x-1': i === 0
                    })}
                  >
                    <div className="flex gap-2 items-center">
                      <div className="flex items-center gap-2">
                        {i === 1 ? (
                          <ChevronRight
                            width={18}
                            className="transition-transform"
                          />
                        ) : (
                          <ChevronLeft
                            width={18}
                            className="transition-transform"
                          />
                        )}
                      </div>
                      <p>{p.title}</p>
                    </div>
                    <p className="text-xs line-clamp-1 pt-1 opacity-50 px-6.5">
                      {p.description}
                    </p>
                  </Link>
                )
            )}
          </div>
        </footer>
      </section>
      <RootRightSidebar slug={slug} />
    </>
  )
}

export function generateStaticParams() {
  return getSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { slug = [] } = await params

  const node = getNode(slug)

  if (!node || node.type === 'label')
    return {
      title: siteConfig.name,
      description: siteConfig.description
    }

  const url = `${siteConfig.url}${node.href || '/docs'}`

  return {
    title: `${node.title} | slugtree Docs`,
    description: node.description || siteConfig.description,
    alternates: {
      canonical: url
    },
    openGraph: {
      title: node.title,
      description: node.description || siteConfig.description,
      url,
      images: [
        {
          url: siteConfig.ogImageDocs,
          width: 1200,
          height: 630,
          alt: node.title
        }
      ]
    },
    twitter: {
      title: node.title,
      description: node.description || siteConfig.description,
      images: [siteConfig.ogImageDocs]
    }
  }
}
