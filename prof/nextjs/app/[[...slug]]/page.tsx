import {
  getNodeData,
  getNodeBreadcrumbs,
  getNodePagination,
  getNodeSection,
  getNodeLabel,
  getSlugs
} from 'slugtree'
import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/breadcrumbs'
import TableOfContents from '@/components/toc'
import Pagination from '@/components/pagination'

export async function generateStaticParams() {
  return getSlugs().map((slug) => ({
    slug
  }))
}

export default async function SlugPage({
  params
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const resolvedParams = await params
  const slug = resolvedParams.slug || []
  const data = getNodeData(slug)

  if (!data) {
    notFound()
  }

  const breadcrumbs = getNodeBreadcrumbs(slug)
  const pagination = getNodePagination(slug)
  const section = getNodeSection(slug)
  const label = getNodeLabel(slug)
  const toc = data.toc || []

  return (
    <div className="flex-1 flex justify-between min-w-0 py-8 px-8 lg:px-12">
      <article className="flex-1 flex flex-col max-w-3xl min-w-0">
        <Breadcrumbs items={breadcrumbs} />

        <div className="flex items-center gap-2 mb-4">
          {section && (
            <span className="px-2 py-0.5 text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md">
              {section.title}
            </span>
          )}
          {label && (
            <span className="px-2 py-0.5 text-[11px] font-medium bg-foreground/5 text-foreground/60 rounded-md uppercase tracking-wider">
              {label.label}
            </span>
          )}
        </div>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {data.frontMatter.title}
          </h1>
          {data.frontMatter.description && (
            <p className="mt-2 text-base text-foreground/70 leading-relaxed">
              {data.frontMatter.description}
            </p>
          )}
        </header>

        <div className="prose grow dark:prose-invert max-w-none text-foreground/90 space-y-6">
          <div className="p-4 rounded-xl border border-foreground/10 bg-foreground/2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-2">
              MDX Document Content
            </h3>
            <pre className="text-xs font-mono bg-foreground/5 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {data.rawContent}
            </pre>
          </div>
        </div>

        <Pagination pagination={pagination} />
      </article>

      <TableOfContents items={toc} />
    </div>
  )
}
