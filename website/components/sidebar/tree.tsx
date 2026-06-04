'use client'

import type { Node, NodeFolder, Tree } from 'slugtree'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import * as Slot from '@radix-ui/react-slot'
import { cn } from '@/lib/cn'
import { ChevronRight } from '@/components/icons'
import * as Icons from '@/components/icons'

export default function Tree({ tree }: { tree: Tree }) {
  return (
    <ul>
      {tree.map((node, i) => (
        <Node key={i} node={node} index={i} />
      ))}
    </ul>
  )
}

function Node({ node, index }: { node: Node; index: number }) {
  if (node.type === 'label') {
    return (
      <li
        className={cn('font-pixel font-semibold uppercase text-xs pb-1', {
          'mt-6': index !== 0
        })}
      >
        {node.label}
      </li>
    )
  }

  if (node.type === 'folder') {
    return <NodeExpandible folder={node} index={index} />
  }

  if (node.type === 'page') {
    const Icon = node.icon ? (Icons as any)[node.icon] : null

    return (
      <li>
        <NodeComp href={node.href} asChild>
          <Link href={node.href}>
            <div className="w-[20px] flex justify-center items-center">
              {Icon && <Icon width={17} />}
            </div>
            <span className="inline-block grow"> {node.title}</span>
          </Link>
        </NodeComp>
      </li>
    )
  }

  return null
}

function NodeExpandible({
  folder,
  index
}: {
  folder: NodeFolder
  index: number
}) {
  const [expanded, setExpanded] = React.useState(false)
  const Icon = folder.icon ? (Icons as any)[folder.icon] : null

  return (
    <li>
      <NodeComp
        onClick={() => {
          setExpanded(!expanded)
        }}
      >
        <div className="w-[20px] flex justify-center items-center">
          {Icon && <Icon width={17} />}
        </div>
        <span className="inline-block grow"> {folder.title}</span>
        <ChevronRight
          data-expanded={expanded ? '' : undefined}
          className="data-expanded:rotate-90 transition"
          width={12}
        />
      </NodeComp>
      <div
        style={{
          display: 'grid',
          gridTemplateRows: expanded ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.2s ease-in-out'
        }}
        className="overflow-hidden pl-1 w-full transition-all relative"
      >
        <ul className="overflow-hidden pl-2">
          {folder.children.map((subNode, i) => (
            <Node key={`${index}-${i}`} index={i} node={subNode} />
          ))}
        </ul>
      </div>
    </li>
  )
}

function NodeComp({
  asChild,
  className,
  href,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean
  label?: React.ReactNode
  href?: string
}) {
  const pathname = usePathname()

  const isCurrent = pathname.endsWith(String(href))

  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      data-current={isCurrent ? '' : undefined}
      className={cn(
        'cursor-pointer w-full text-left py-2 gap-2 font-pixel text-sm data-current:text-foreground text-foreground/60 rounded-lg hover:text-foreground/80 flex items-center',
        className
      )}
      {...props}
    />
  )
}
