import Link from 'next/link'
import { NextJs, Slugtree, SlugtreeIcon } from './icons'

export default function Nav() {
  return (
    <nav className="h-15 min-h-15 container flex items-center gap-5">
      <Link href="/slugtree" className="flex items-center">
        <SlugtreeIcon width={25} />
        <Slugtree width={80} />
      </Link>
      <span className="inline-flex h-5 rotate-14 w-px bg-foreground/30"></span>
      <a
        className="font-medium text-lg flex items-center gap-2"
        href="https://nextjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        <NextJs width={70} />
      </a>
    </nav>
  )
}
