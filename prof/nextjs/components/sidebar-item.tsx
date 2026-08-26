'use client'

import Link from 'next/link'
import React from 'react'
import { Node } from 'slugtree'
import { useSlugtree } from 'slugtree/react'
import { ChevronRightFilled, OpenRegular } from './icons'
import { usePathname } from 'next/navigation'

export default function Item({ node }: { node: Node }) {
  const pathname = usePathname()
  const { isNodeChildrenActive } = useSlugtree()

  const [expanded, setExpanded] = React.useState(
    node.type === 'folder' ? isNodeChildrenActive(node.slug, pathname) : false
  )

  if (node.type === 'label') {
    return (
      <li className="uppercase text-xs mt-8 mb-2 opacity-40 font-semibold">
        {node.label}
      </li>
    )
  }

  if (node.type === 'page') {
    const isCurrentPage = pathname === node.href
    return (
      <li>
        <Link
          data-current={isCurrentPage ? '' : undefined}
          className="py-1 w-full hover:opacity-70 data-current:text-blue-500 inline-flex"
          href={node.href}
          target={node.href?.startsWith('https') ? '_blank' : undefined}
          rel={
            node.href?.startsWith('https') ? 'noopener noreferrer' : undefined
          }
        >
          <span className="grow">{node.title}</span>
          {node.href.startsWith('https') && (
            <OpenRegular width={17} className="opacity-50" />
          )}
        </Link>
      </li>
    )
  }

  if (node.type === 'folder') {
    const isCurrentPage = node.href?.startsWith(pathname)
    return (
      <>
        <li>
          <Link
            data-current={isCurrentPage ? '' : undefined}
            className="py-1 hover:opacity-70 w-full inline-flex data-current:text-blue-500"
            onClick={() => setExpanded(!expanded)}
            href={node.href || '#'}
          >
            <span className="grow inline-block pr-4">{node.title}</span>
            <ChevronRightFilled
              style={{
                rotate: expanded ? '90deg' : '0deg'
              }}
              width={15}
            />
          </Link>
        </li>
        {expanded && node.children.length > 0 && (
          <ul className="pl-5 pt-1">
            {node.children.map((child, i) => (
              <Item key={i} node={child} />
            ))}
          </ul>
        )}
      </>
    )
  }
}
