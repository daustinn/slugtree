import Link from 'next/link'
import type { Pagination as PaginationType } from 'slugtree'

export default function Pagination({
  pagination
}: {
  pagination: PaginationType | null
}) {
  if (!pagination || (!pagination.prev && !pagination.next)) return null

  return (
    <div className="mt-14 pt-8 border-t border-foreground/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {pagination.prev ? (
        <Link
          href={pagination.prev.href}
          className="group flex flex-col p-4 rounded-xl border border-foreground/10 hover:border-blue-500/50 hover:bg-foreground/2 transition-all"
        >
          <span className="text-xs text-foreground/50 flex items-center gap-1 group-hover:text-blue-500 font-medium">
            &larr; Previous
          </span>
          <span className="text-base font-semibold mt-1 group-hover:text-blue-500 transition-colors">
            {pagination.prev.title}
          </span>
          {pagination.prev.description && (
            <span className="text-xs text-foreground/60 mt-1 line-clamp-1">
              {pagination.prev.description}
            </span>
          )}
        </Link>
      ) : (
        <div />
      )}

      {pagination.next ? (
        <Link
          href={pagination.next.href}
          className="group flex flex-col p-4 rounded-xl border border-foreground/10 hover:border-blue-500/50 hover:bg-foreground/2 transition-all sm:text-right"
        >
          <span className="text-xs text-foreground/50 flex items-center justify-end gap-1 group-hover:text-blue-500 font-medium">
            Next &rarr;
          </span>
          <span className="text-base font-semibold mt-1 group-hover:text-blue-500 transition-colors">
            {pagination.next.title}
          </span>
          {pagination.next.description && (
            <span className="text-xs text-foreground/60 mt-1 line-clamp-1">
              {pagination.next.description}
            </span>
          )}
        </Link>
      ) : null}
    </div>
  )
}
