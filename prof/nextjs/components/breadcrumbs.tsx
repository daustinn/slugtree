import Link from 'next/link'
import type { BreadcrumbItem } from 'slugtree'

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (!items || items.length === 0) return null

  return (
    <nav className="flex items-center gap-1.5 text-xs text-foreground/60 mb-6 flex-wrap">
      <Link href="/" className="hover:text-foreground transition-colors">
        Docs
      </Link>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1
        return (
          <span key={idx} className="flex items-center gap-1.5">
            <span className="opacity-40">/</span>
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.title}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.title}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
