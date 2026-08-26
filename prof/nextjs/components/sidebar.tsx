import { getTree } from 'slugtree'
import Item from './sidebar-item'
import SearchModal from './search-modal'

export default function Sidebar() {
  const tree = getTree()

  return (
    <aside className="w-64 shrink-0 pr-6 min-h-[calc(100vh-3.75rem)] py-6">
      <SearchModal />
      <nav>
        <ul className="text-sm space-y-0.5">
          {tree.map((node, i) => (
            <Item key={i} node={node} />
          ))}
        </ul>
      </nav>
    </aside>
  )
}
