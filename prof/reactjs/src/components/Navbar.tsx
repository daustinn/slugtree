import { useState } from 'react'
import { useBasePath, useSearchContent } from 'slugtree/react'

export interface NavbarProps {
  onSelectSlug: (slug: string[]) => void
}

export function Navbar({ onSelectSlug }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const basePath = useBasePath()
  const searchResults = useSearchContent(searchQuery)

  return (
    <header
      style={{
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        zIndex: 100
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 2rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            slugtree React Demo
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              background: '#f3f4f6',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              color: '#6b7280'
            }}
          >
            {basePath}
          </span>
        </div>

        <div style={{ position: 'relative', width: '320px' }}>
          <input
            type="text"
            placeholder="Search docs (title, content, headings)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />

          {searchQuery && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '0.35rem',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                maxHeight: '350px',
                overflowY: 'auto',
                zIndex: 200
              }}
            >
              {searchResults.length === 0 ? (
                <div
                  style={{
                    padding: '1rem',
                    color: '#9ca3af',
                    fontSize: '0.85rem'
                  }}
                >
                  No results found
                </div>
              ) : (
                searchResults.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => {
                      onSelectSlug(res.id ? res.id.split('/') : [])
                      setSearchQuery('')
                    }}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer'
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: '#4f46e5'
                      }}
                    >
                      {res.title}
                    </div>
                    {res.description && (
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: '#6b7280',
                          marginTop: '0.15rem'
                        }}
                      >
                        {res.description}
                      </div>
                    )}
                    {res.children.map((child) => (
                      <div
                        key={child.id}
                        style={{
                          fontSize: '0.75rem',
                          color: '#4b5563',
                          marginTop: '0.25rem',
                          paddingLeft: '0.5rem',
                          borderLeft: '2px solid #e5e7eb'
                        }}
                      >
                        <strong>{child.title}:</strong> {child.content}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
