import { useNodeToc } from 'slugtree/react'

export interface TocProps {
  slug: string[]
}

export function Toc({ slug }: TocProps) {
  const toc = useNodeToc(slug)

  return (
    <aside
      style={{
        width: '220px',
        padding: '2rem 1rem',
        position: 'sticky',
        top: '57px',
        height: 'calc(100vh - 57px)',
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.75rem'
        }}
      >
        On this page
      </div>
      {toc.length === 0 ? (
        <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>No headings</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {toc.map((item) => (
            <li
              key={item.id}
              style={{
                paddingLeft: `${(item.depth - 1) * 0.75}rem`,
                margin: '0.4rem 0',
                fontSize: '0.85rem'
              }}
            >
              <a
                href={`#${item.id}`}
                style={{
                  color: '#4b5563',
                  textDecoration: 'none'
                }}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
