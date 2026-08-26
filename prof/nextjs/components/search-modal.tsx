'use client'

import React from 'react'
import Link from 'next/link'
import { useSlugtree } from 'slugtree/react'

export default function SearchModal() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const { searchContent } = useSlugtree()

  const results = React.useMemo(() => {
    return searchContent(query)
  }, [query, searchContent])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs text-foreground/50 border border-foreground/10 rounded-lg hover:border-foreground/20 hover:bg-foreground/0.2 transition-colors mb-4"
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-3.5 h-3.5 opacity-60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Search docs...
        </span>
        <kbd className="px-1.5 py-0.5 text-[10px] bg-foreground/5 rounded border border-foreground/10 font-mono">
          ⌘K
        </kbd>
      </button>

      {isOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen(false)
          }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-background border border-foreground/10 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="p-3 border-b border-foreground/10 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-foreground/40 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search documentation, guides, APIs..."
                className="w-full bg-transparent outline-hidden text-sm placeholder:text-foreground/40"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-foreground/40 hover:text-foreground px-1.5 py-0.5 rounded"
              >
                ESC
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {query && results.length === 0 && (
                <div className="p-6 text-center text-xs text-foreground/50">
                  No results found for &ldquo;{query}&rdquo;
                </div>
              )}

              {results.map((res) => (
                <div key={res.id} className="mb-2">
                  <Link
                    href={res.href}
                    onClick={() => setIsOpen(false)}
                    className="block p-2.5 rounded-lg hover:bg-foreground/4 transition-colors"
                  >
                    <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <span>{res.title}</span>
                      <span className="text-[10px] text-foreground/40 font-normal">
                        {res.href}
                      </span>
                    </div>
                    {res.description && (
                      <p className="text-[11px] text-foreground/60 mt-0.5 line-clamp-1">
                        {res.description}
                      </p>
                    )}
                  </Link>

                  {res.children && res.children.length > 0 && (
                    <div className="pl-4 space-y-1 mt-1 border-l-2 border-foreground/10 ml-3">
                      {res.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.href}
                          onClick={() => setIsOpen(false)}
                          className="block p-1.5 rounded hover:bg-foreground/4 text-[11px] text-foreground/70"
                        >
                          <span className="font-medium text-foreground">
                            {child.title}:
                          </span>{' '}
                          <span className="text-foreground/50">
                            {child.content}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
