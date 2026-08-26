import { useNodePagination } from 'slugtree/react'

export interface PaginationProps {
  slug: string[]
  onSelectSlug: (slug: string[]) => void
}

export function Pagination({ slug, onSelectSlug }: PaginationProps) {
  const pagination = useNodePagination(slug)

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '3rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid #e5e7eb'
      }}
    >
      {pagination?.prev ? (
        <button
          onClick={() => onSelectSlug(pagination.prev!.slug)}
          style={{
            padding: '0.65rem 1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            background: '#fff',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Previous</div>
          <div
            style={{ fontWeight: 600, color: '#4f46e5', marginTop: '0.2rem' }}
          >
            ← {pagination.prev.title}
          </div>
        </button>
      ) : (
        <div />
      )}

      {pagination?.next && (
        <button
          onClick={() => onSelectSlug(pagination.next!.slug)}
          style={{
            padding: '0.65rem 1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            background: '#fff',
            cursor: 'pointer',
            textAlign: 'right'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Next</div>
          <div
            style={{ fontWeight: 600, color: '#4f46e5', marginTop: '0.2rem' }}
          >
            {pagination.next.title} →
          </div>
        </button>
      )}
    </nav>
  )
}
