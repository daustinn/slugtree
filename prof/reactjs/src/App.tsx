import { useState } from 'react'
import { useNodeData } from 'slugtree/react'
import { Navbar } from './components/Navbar.tsx'
import { Sidebar } from './components/Sidebar.tsx'
import { Breadcrumbs } from './components/Breadcrumbs.tsx'
import { Toc } from './components/Toc.tsx'
import { Pagination } from './components/Pagination.tsx'

export default function App() {
  const [selectedSlug, setSelectedSlug] = useState<string[]>([])
  const activeData = useNodeData(selectedSlug)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#111827',
        background: '#fff'
      }}
    >
      <Navbar onSelectSlug={setSelectedSlug} />

      <div
        style={{
          display: 'flex',
          flex: 1,
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%'
        }}
      >
        <Sidebar currentSlug={selectedSlug} onSelectSlug={setSelectedSlug} />

        <main style={{ flex: 1, padding: '2rem 3rem', maxWidth: '800px' }}>
          <Breadcrumbs slug={selectedSlug} />

          <article>
            <h1
              style={{
                fontSize: '2.25rem',
                fontWeight: 800,
                margin: '0 0 0.5rem 0',
                letterSpacing: '-0.025em'
              }}
            >
              {activeData?.frontMatter.title || 'Documentation'}
            </h1>
            {activeData?.frontMatter.description && (
              <p
                style={{
                  fontSize: '1.15rem',
                  color: '#4b5563',
                  margin: '0 0 2rem 0',
                  lineHeight: 1.5
                }}
              >
                {activeData.frontMatter.description}
              </p>
            )}

            <div
              style={{
                lineHeight: 1.7,
                fontSize: '0.95rem',
                color: '#374151',
                whiteSpace: 'pre-wrap',
                background: '#f9fafb',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontFamily: 'ui-monospace, monospace'
              }}
            >
              {activeData?.rawContent || '# No content found'}
            </div>
          </article>

          <Pagination slug={selectedSlug} onSelectSlug={setSelectedSlug} />
        </main>

        <Toc slug={selectedSlug} />
      </div>
    </div>
  )
}
