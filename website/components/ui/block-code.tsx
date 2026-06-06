import { codeToHtml } from 'shiki'
import BlockCodeCopyButton from './block-code-copy-button'
import { cn } from '@/lib/cn'
import React from 'react'
import { Code, Javascript, Json, Mdx, Typescript } from '../icons'

const icons = {
  json: [Json, 'dark:text-yellow-400 text-yellow-600'],
  mdx: [Mdx, 'dark:text-amber-400 text-amber-600'],
  ts: [Typescript, 'dark:text-blue-400 text-blue-600'],
  tsx: [Typescript, 'dark:text-blue-400 text-blue-600'],
  js: [Javascript, 'dark:text-blue-400 text-blue-600'],
  jsx: [Javascript, 'dark:text-blue-400 text-blue-600'],
  text: [Code, '']
} as const

export default async function BlockCode({
  children,
  lang = 'text',
  className,
  copy = true,
  lineNumbers = true,
  title,
  ...props
}: Omit<React.ComponentProps<'div'>, 'children'> & {
  lang?: string
  copy?: boolean
  lineNumbers?: boolean
  title?: string
  children?: string
}) {
  const codeContent = (children as string)?.trimEnd() || ''

  const html = await codeToHtml(codeContent, {
    lang,
    themes: {
      light: 'vitesse-light',
      dark: 'kanagawa-dragon'
    }
  })

  const Icon = icons[lang as keyof typeof icons]?.[0] ?? icons.text[0]
  const iconColor = icons[lang as keyof typeof icons]?.[1] ?? icons.text[1]

  return (
    <div
      className={cn(
        'bg-border/10 text-sm relative rounded-2xl overflow-hidden overflow-x-auto border',
        className
      )}
    >
      {title && (
        <div className="px-3 flex items-center gap-2 py-2.5 border-b">
          <Icon width={18} className={iconColor} />
          <div className="">{title}</div>
        </div>
      )}
      <div className="overflow-x-auto">
        <div
          className={cn('[&>_pre]:bg-transparent! p-3', {
            lineNumbers: !!lineNumbers
          })}
          dangerouslySetInnerHTML={{ __html: html }}
          {...props}
        />
        {copy && (
          <div className="absolute z-10 top-3.5 right-3">
            <BlockCodeCopyButton>{codeContent}</BlockCodeCopyButton>
          </div>
        )}
      </div>
    </div>
  )
}
