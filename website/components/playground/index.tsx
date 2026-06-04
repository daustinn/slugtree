'use client'

import { cn } from '@/lib/cn'
import React from 'react'

const items = {
  tree: 'getTree()',
  nodeData: 'getNodeData(slug)',
  tableOfContents: 'getTableOfContents(slug)',
  breadcrumbs: 'getBreadcrumbs(slug)',
  pagination: 'getPagination(slug)',
  slugs: 'getSlugs()',
  node: 'getNode(slug)',
  getAllPages: 'getAllPages()',
  getNodesData: 'getNodesData()',
  searchContent: 'searchContent(query)'
} as const

export default function Playground() {
  const [tab, setTab] = React.useState<keyof typeof items>('tree')
  return (
    <>
      <div className="text-sm text-left px-16 py-3">
        <span className="font-medium uppercase opacity-50">Playground </span>
        <span className="font-sans">/docs/guides/routing</span>
      </div>
      <div className="flex overflow-auto grow">
        <nav className="flex flex-col min-w-[220px] w-[220px] overflow-x-auto px-16">
          {Object.entries(items).map(([key, value]) => (
            <button
              className={cn(
                'relative opacity-70 text-left text-sm font-medium p-2 px-4',
                {
                  'opacity-100': key === tab
                }
              )}
              key={key}
              onClick={() => {
                setTab(key as typeof tab)
              }}
            >
              {key === tab && (
                <span className="absolute inline-block inset-y-1 left-0 w-0.5 rounded-full bg-foreground" />
              )}
              {value}
            </button>
          ))}
        </nav>
        {/* <div className="overflow-auto grow px-16 max-lg:max-h-[450px] ">
          <ClientPre
            copy={false}
            lang="json"
            className="bg-transparent border-none mt-0"
          >
            {JSON.stringify(contentJson, null, 2)}
          </ClientPre>
        </div> */}
      </div>
    </>
  )
}
