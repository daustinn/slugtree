import { getTree } from 'slugtree'
import Tree from './tree'
import Link from 'next/link'
import DocsSearch from './search'
import ThemeToggle from './theme-toggle'
import { Github, Menu, Npm } from '../icons'
import { GITHUB_URL, NPM_URL } from '@/const'
import { cn } from '@/lib/cn'

export default function Sidebar() {
  const tree = getTree()
  return (
    //  max-lg:hidden
    //  max-lg:sidebar:fixed
    <aside
      className={cn(
        'h-svh sticky z-50 top-0 overflow-auto flex flex-col min-w-[250px]',
        'max-lg:bg-background max-lg:w-full max-lg:ml-0 max-lg:border-r max-lg:fixed',
        'transition-transform max-lg:-translate-x-full max-lg:sidebar:translate-x-0'
      )}
    >
      <header className="py-6 flex px-4 lg:px-6 items-center">
        <h3 className="font-pixel text-xl grow">
          <Link href="/">slugtree</Link>
          <span className="font-pixel opacity-40"> Docs</span>
        </h3>
        <DocsSearch />
      </header>
      <nav className="p-4 lg:p-6 pt-0 grow overflow-y-auto">
        <Tree tree={tree} />
      </nav>
      <footer className="px-3 py-4 flex items-center">
        <ul className="flex grow [&>a]:p-1 [&>a]:px-2">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            <Github width={20} />
          </a>
          <a href={NPM_URL} target="_blank" rel="noopener noreferrer">
            <Npm width={20} />
          </a>
        </ul>
        <ThemeToggle />
      </footer>
    </aside>
  )
}
