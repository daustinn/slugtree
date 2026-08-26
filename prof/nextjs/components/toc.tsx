'use client'

import Link from 'next/link'
import type { TocItem } from 'slugtree'

export default function TableOfContents({ items }: { items: TocItem[] }) {
  if (!items || items.length === 0) return null

  return (
    <aside className="hidden xl:block w-60 shrink-0 pl-6 text-sm">
      <div className="sticky top-20">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-3">
          On this page
        </h4>
        <ul className="space-y-1.5 border-l border-foreground/10 pl-3">
          {items.map((item) => (
            <li
              key={item.id}
              style={{
                paddingLeft: `${Math.max(0, item.depth - 1) * 0.75}rem`
              }}
            >
              <Link
                href={`#${item.id}`}
                className="block text-foreground/70 hover:text-blue-500 transition-colors py-0.5 text-xs leading-relaxed"
              >
                {item.text}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
