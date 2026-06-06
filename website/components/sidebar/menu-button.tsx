'use client'

import Link from 'next/link'
import { Menu } from '../icons'

export const className = 'sidebar'

export default function MenuButton() {
  return (
    <>
      <div
        onClick={() => {
          document.documentElement.classList.remove(className)
        }}
        className="bg-background/80 sidebar:pointer-events-auto pointer-events-none opacity-0 sidebar:opacity-100 z-30 fixed inset-0"
      ></div>
      <div className="h-12 z-20 gap-4 flex lg:hidden items-center px-3 bg-background inset-x-0 top-0 fixed pointer-events-none">
        <button
          className="pointer-events-auto"
          onClick={() => {
            document.documentElement.classList.toggle(className)
          }}
        >
          <Menu width={25} />
        </button>
        <Link
          href="/docs"
          className="grow pointer-events-auto text-right text-lg font-pixel"
        >
          slugtree <span className="font-pixel opacity-40"> Docs</span>
        </Link>
      </div>
    </>
  )
}
