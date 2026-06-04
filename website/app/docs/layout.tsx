import Sidebar from '@/components/sidebar'

export default function DocsLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex">
      <Sidebar />
      {children}
    </main>
  )
}
