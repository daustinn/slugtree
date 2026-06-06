import { MDXComponents } from 'mdx/types'
import Link from 'next/link'
import BlockCode from './ui/block-code'
import { cn } from '@/lib/cn'
import WithHyper from './with-hyper'

const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1 className="text-4xl font-bold pt-10 mt-8 mb-4tracking-tight" {...props}>
      <WithHyper {...props} />
    </h1>
  ),
  h2: (props) => (
    <h2
      className="text-2xl font-semibold pt-16 mt-8 mb-4 border-t pb-2 tracking-tight"
      {...props}
    >
      <WithHyper {...props} />
    </h2>
  ),
  h3: (props) => (
    <h3
      className="text-xl font-medium pt-14 mt-5 mb-3 tracking-tight"
      {...props}
    >
      <WithHyper {...props} />
    </h3>
  ),
  h4: (props) => (
    <h4 className="text-lg font-medium pt-8 mt-5 mb-3" {...props}>
      <WithHyper {...props} />
    </h4>
  ),
  p: (props) => <p className="leading-7 mb-4" {...props} />,
  ul: (props) => (
    <ul
      className="list-disc list-outside ml-6 mb-4 flex flex-col gap-2"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="list-decimal list-outside ml-6 mb-4 flex flex-col gap-2"
      {...props}
    />
  ),
  li: (props) => <li className="pl-1" {...props} />,
  a: (props) => {
    const href = props.href || ''
    if (href.startsWith('http')) {
      return (
        <a
          className="underline dark:text-blue-400 text-blue-700 underline-offset-4 transition font-medium"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        />
      )
    }
    return (
      <Link
        href={href}
        className="underline dark:text-blue-400 text-blue-700 underline-offset-4 transition font-medium"
        {...props}
      />
    )
  },
  table: (props) => (
    <div className="overflow-x-auto text-sm border rounded-lg">
      <table className="w-full" {...props} />
    </div>
  ),
  thead: (props) => <thead className="border-b bg-border/30" {...props} />,
  tbody: (props) => <tbody className="divide-y" {...props} />,
  tr: (props) => <tr {...props} />,
  th: (props) => (
    <th
      className="p-2 font-medium text-foreground/90 px-3 text-left"
      {...props}
    />
  ),
  td: (props) => <td className="p-2 px-3" {...props} />,
  strong: (props) => <strong className="font-semibold" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="border-l-4 pl-4 italic my-6 y-2 pr-4 rounded-r-lg"
      {...props}
    />
  ),
  video: (props) => (
    <video className="rounded-xl border my-6 w-full shadow-sm" {...props} />
  ),
  hr: (props) => <hr className="my-10" {...props} />,
  code: (props) => (
    <code
      className={cn(
        'text-sm dark:bg-blue-700/30 dark:text-blue-200 border dark:border-blue-400/20 rounded-md px-1 py-px',
        'bg-blue-100 text-blue-800 border border-blue-500/20',
        props.className
      )}
      {...props}
    />
  ),
  pre: (props) => {
    const lang = props.children?.props?.className?.replace('language-', '')
    const rawContent = props.children?.props?.children || ''

    let title = undefined
    let cleanContent = rawContent

    if (typeof rawContent === 'string') {
      const match = rawContent.match(
        /^\s*\[\[\[title:(['"])(.+?)\1\]\]\]\s*\r?\n?/
      )
      if (match) {
        title = match[2]
        cleanContent = rawContent.replace(match[0], '')
      }
    }

    return (
      <BlockCode lang={lang} title={title} className="my-5">
        {cleanContent}
      </BlockCode>
    )
  }
}

export default mdxComponents
