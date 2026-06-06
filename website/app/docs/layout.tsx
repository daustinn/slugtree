import Sidebar from '@/components/sidebar'
import MenuButton from '@/components/sidebar/menu-button'

export default function DocsLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-svh max-lg:pt-12">
      <MenuButton />
      <Sidebar />
      {children}
    </main>
  )
}
