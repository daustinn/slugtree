'use client'

import {
  DocumentOnePage,
  DocumentPageBottomCenter,
  Search
} from '@/components/icons'
import * as Icons from '@/components/icons'
import { Command } from 'cmdk'
import { useDebounce, useKeyPress } from 'use-handler-hooks'
import React from 'react'
import { SearchResult, SearchResultChild } from 'slugtree/server'
import { cn } from '@/lib/cn'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DocsSearch() {
  const [open, setOpen] = React.useState(false)
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [, setValue, value] = useDebounce({
    onDebounced: async (q) => {
      const res = await fetch(
        '/api/slugtree/search?' + new URLSearchParams({ q })
      )
      if (res.ok) {
        const json = await res.json()
        setResults(json)
      }
    },
    delay: 100
  })

  useKeyPress('Ctrl+K', (e) => {
    e.preventDefault()
    setOpen(true)
  })

  useKeyPress('Escape', (e) => {
    e.preventDefault()
    setOpen(false)
  })

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-2.5 pl-1.5 py-1 hover:*:opacity-100 gap-1 items-center flex text-xs border rounded-xl"
      >
        <Search width={16} className="opacity-50" />
        <span className="opacity-50">⌘K</span>
      </button>
      {open && (
        <div
          className="fixed inset-0 px-2 lg:px-5 flex justify-center pt-2 lg:pt-40 font-sans text-sm bg-white/50 dark:bg-black/5"
          onClick={(e) => {
            if (e.currentTarget === e.target) {
              setOpen(false)
            }
          }}
        >
          <Command className="h-fit max-w-[700px] overflow-hidden w-[700px] relative flex flex-col dark:border-neutral-700/80 dark:bg-neutral-950 bg-background dark:shadow-[0_0_20px_5px_rgba(0,0,0,1),0_0_60px_10px_rgba(0,0,0,1)] shadow-[0_0_40px_10px_rgba(0,0,0,.05)] rounded-xl border ">
            <label className="flex relative items-center">
              <div className="absolute left-4 flex items-center gap-3">
                <Search width={18} className="opacity-50" />
                <span className="rounded-full bg-blue-700 text-white px-2 text-xs py-0.5">
                  Docs
                </span>
              </div>
              <input
                data-result={results.length > 0 ? '' : undefined}
                autoFocus
                defaultValue={value || ''}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Search in slugtree/docs"
                className="w-full pl-24 p-5 outline-none data-result:rounded-b-none data-result:border-b-transparent"
              />
              <div className="absolute right-4">
                <kbd className="rounded-full bg-border px-2 text-xs py-0.5">
                  ESC
                </kbd>
              </div>
            </label>
            <div
              hidden={results.length === 0}
              className="mx-auto w-[95%] h-px bg-border"
            ></div>

            <div
              hidden={results.length === 0}
              className="max-h-[400px] overflow-y-auto relative"
            >
              <Command.List className="p-1.5">
                {results.map((page) => (
                  <React.Fragment key={page.id}>
                    <Item
                      id={page.id}
                      setOpen={setOpen}
                      href={page.href}
                      label={page.title}
                      type="page"
                      icon={page.icon}
                    />
                    {page.children &&
                      page.children.map((child) => (
                        <Item
                          setOpen={setOpen}
                          key={child.id}
                          href={child.href}
                          id={child.id}
                          label={child.title}
                          type={child.type}
                          content={child.content}
                        />
                      ))}
                  </React.Fragment>
                ))}
              </Command.List>
            </div>
          </Command>
        </div>
      )}
      <button
        onClick={() => {
          document.documentElement.classList.remove('sidebar')
        }}
        className="px-3 flex lg:hidden"
      >
        <Icons.Xmark width={20} />
      </button>
    </>
  )
}

const icons = {
  page: DocumentOnePage,
  title: DocumentPageBottomCenter,
  subtitle: DocumentPageBottomCenter
}

const Item = ({
  label,
  type,
  content,
  href,
  setOpen,
  icon
}: {
  label: string
  id: string
  type: SearchResultChild['type'] | 'page'
  content?: string
  href: string
  icon?: string
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const InternalIcon = icon ? Icons[icon as keyof typeof Icons] : null
  const Icon = InternalIcon || icons[type]
  const router = useRouter()
  return (
    <Command.Item
      onSelect={() => {
        router.push(href)
        setOpen(false)
      }}
      value={href}
      className="aria-selected:[&>a]:bg-stone-500/10 aria-selected:[&>a]:dark:bg-stone-500/20"
    >
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className={cn('h-9 px-4 flex items-center gap-3 rounded-lg', {
          'pl-10': type !== 'page'
        })}
      >
        <Icon className="min-w-[18px]" width={18} />
        <div className="flex flex-col">
          <p>{label}</p>
          <p className="text-xs opacity-50 line-clamp-1">{content}</p>
        </div>
      </Link>
    </Command.Item>
  )
}
