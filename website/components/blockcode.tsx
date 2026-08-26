import { createHighlighter } from 'shiki'
import React from 'preact/compat'
import { cn } from '#/lib/cn'

const highlighter = await createHighlighter({
  themes: ['catppuccin-mocha'],
  langs: [
    'javascript',
    'typescript',
    'jsx',
    'tsx',
    'json',
    'bash',
    'sh',
    'html',
    'css',
    'markdown',
    'md',
    'mdx',
    'astro'
  ]
})

export interface BlockCodeProps extends Omit<
  React.ComponentProps<'div'>,
  'children' | 'dangerouslySetInnerHTML'
> {
  lang?: string
  copy?: boolean
  lineNumbers?: boolean
  children?: React.ReactNode
}

export default function BlockCode({
  children,
  lang = 'text',
  className,
  copy = true,
  lineNumbers = true,
  ...props
}: BlockCodeProps) {
  const codeContent =
    typeof children === 'string'
      ? children.trimEnd()
      : Array.isArray(children)
        ? children.join('').trimEnd()
        : String(children || '').trimEnd()

  let html: string
  try {
    const loadedLangs = highlighter.getLoadedLanguages()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const targetLang = loadedLangs.includes(lang as any) ? lang : 'text'

    html = highlighter.codeToHtml(codeContent, {
      lang: targetLang,
      themes: {
        light: 'catppuccin-mocha',
        dark: 'catppuccin-mocha'
      }
    })
  } catch {
    html = `<pre><code>${codeContent}</code></pre>`
  }

  return (
    <div
      className={cn(
        'outline-4 outline-offset-0 group outline-border bg-black dark:bg-border/50 text-sm relative rounded-2xl overflow-hidden overflow-x-auto',
        className
      )}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
    >
      <div className="overflow-x-auto">
        <div
          className={cn('[&>_pre]:bg-transparent! p-3', {
            lineNumbers: !!lineNumbers
          })}
          dangerouslySetInnerHTML={{ __html: String(html) }}
        />
        {copy && (
          <div className="absolute opacity-0 group-hover:opacity-100 z-10 top-2 right-2">
            <button
              data-code={codeContent}
              title="Copy code"
              className="flex blockcode__button text-white items-center opacity-60 hover:opacity-100 rounded-md p-0.5 font-medium text-xs text-nowrap"
            >
              Copy
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
