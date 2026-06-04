import { getTree } from 'slugtree'
import Tree from './tree'
import Link from 'next/link'
import DocsSearch from './search'
import ThemeToggle from './theme-toggle'
import { Github, Npm } from '../icons'
import { GITHUB_URL, NPM_URL } from '@/const'

export default function Sidebar() {
  const tree = getTree()
  return (
    <aside className="h-svh sticky z-50 top-0 overflow-auto flex flex-col min-w-[250px]">
      <header className="py-6 flex px-6 items-center">
        <h3 className="font-pixel text-xl grow">
          <Link href="/">slugtree</Link>
          <span className="font-pixel opacity-40"> Docs</span>
        </h3>
        <DocsSearch />
      </header>
      <nav className="p-6 pt-0 grow overflow-y-auto">
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
