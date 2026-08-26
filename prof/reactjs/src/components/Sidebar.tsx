import { useTree } from 'slugtree/react'

type TreeNode = ReturnType<typeof useTree>[number]

function SidebarNodeItem({
  node,
  currentSlug,
  onSelect
}: {
  node: TreeNode
  currentSlug: string[]
  onSelect: (slug: string[]) => void
}) {
  if (node.type === 'label') {
    return (
      <div
        style={{
          fontWeight: 700,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#9ca3af',
          marginTop: '1.25rem',
          marginBottom: '0.4rem',
          paddingLeft: '0.5rem'
        }}
      >
        {node.label}
      </div>
    )
  }

  const isActive = JSON.stringify(node.slug) === JSON.stringify(currentSlug)

  if (node.type === 'folder') {
    return (
      <div style={{ marginBottom: '0.5rem' }}>
        <button
          onClick={() => node.href && onSelect(node.slug)}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'left',
            fontWeight: 600,
            fontSize: '0.85rem',
            color: isActive ? '#4f46e5' : '#4b5563',
            background: 'transparent',
            border: 'none',
            borderRadius: '4px',
            padding: '0.35rem 0',
            cursor: 'pointer'
          }}
        >
          {node.title}
        </button>
        <div
          style={{
            paddingLeft: '0.5rem',
            marginLeft: '0.5rem',
            borderLeft: '1px solid #e5e7eb'
          }}
        >
          {node.children.map((child: TreeNode, i: number) => (
            <SidebarNodeItem
              key={child.type === 'label' ? `label-${i}` : child.slug.join('/')}
              node={child}
              currentSlug={currentSlug}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => onSelect(node.slug)}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '0.4rem 0',
        margin: '0.15rem 0',
        borderRadius: '4px',
        border: 'none',
        background: 'transparent',
        color: isActive ? '#4f46e5' : '#374151',
        fontWeight: isActive ? 600 : 400,
        fontSize: '0.875rem',
        cursor: 'pointer'
      }}
    >
      {node.title}
    </button>
  )
}

export interface SidebarProps {
  currentSlug: string[]
  onSelectSlug: (slug: string[]) => void
}

export function Sidebar({ currentSlug, onSelectSlug }: SidebarProps) {
  const tree = useTree()

  return (
    <aside
      style={{
        width: '260px',
        padding: '1.5rem 1rem',
        borderRight: '1px solid #e5e7eb',
        position: 'sticky',
        top: '57px',
        height: 'calc(100vh - 57px)',
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          marginBottom: '0.75rem',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#9ca3af',
          letterSpacing: '0.05em'
        }}
      >
        DOCUMENTATION
      </div>
      {tree.map((node: TreeNode, i: number) => (
        <SidebarNodeItem
          key={node.type === 'label' ? `label-${i}` : node.slug.join('/')}
          node={node}
          currentSlug={currentSlug}
          onSelect={onSelectSlug}
        />
      ))}
    </aside>
  )
}
