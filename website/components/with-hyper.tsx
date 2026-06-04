import React from 'react'
import { Link } from './icons'

export default function WithHyper({ id, children }: React.ComponentProps<'a'>) {
  return (
    <a
      href={`#${id}`}
      className="inline-flex hover:[&>svg]:opacity-50 items-center gap-2"
    >
      {children}
      <Link width={15} className="opacity-0 mt-1" />
    </a>
  )
}
