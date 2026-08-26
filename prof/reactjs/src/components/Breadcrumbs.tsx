import { useNodeBreadcrumbs } from 'slugtree/react'

export interface BreadcrumbsProps {
  slug: string[]
}

export function Breadcrumbs({ slug }: BreadcrumbsProps) {
  const breadcrumbs = useNodeBreadcrumbs(slug)

  return (
    <nav
      style={{
        fontSize: '0.85rem',
        color: '#6b7280',
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '0.4rem',
        alignItems: 'center'
      }}
    >
      <span>Docs</span>
      {breadcrumbs.map((crumb, idx) => (
        <span key={crumb.href || idx}>
          {' / '}
          <span
            style={{
              color: idx === breadcrumbs.length - 1 ? '#111827' : '#6b7280',
              fontWeight: idx === breadcrumbs.length - 1 ? 600 : 400
            }}
          >
            {crumb.title}
          </span>
        </span>
      ))}
    </nav>
  )
}
