'use client'

import { Check, Copy } from '@/components/icons'
import React from 'react'

export default function BlockCodeCopyButton({
  children
}: {
  children: string
}) {
  const [copied, setCopied] = React.useState(false)
  async function handleClick() {
    setCopied(true)
    await navigator.clipboard.writeText(children)
    setTimeout(() => setCopied(false), 1000)
  }
  return (
    <button
      title="Copy code"
      onClick={handleClick}
      className="flex items-center opacity-60 hover:opacity-100 rounded-md p-0.5 aspect-square font-medium text-xs"
    >
      {copied ? <Check width={14} /> : <Copy width={14} />}
    </button>
  )
}
