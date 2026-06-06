import { getNodeToc } from 'slugtree'
import TocClient from './toc-client'

export default function RootRightSidebar({ slug }: { slug: string[] }) {
  const toc = getNodeToc(slug)
  return (
    <aside className="p-4 max-lg:hidden w-[220px] sticky top-0 h-svh overflow-auto">
      {toc.length > 0 && (
        <>
          <p className="text-xs pb-2 opacity-40 font-medium">ON THIS PAGE</p>
          <TocClient toc={toc} />
        </>
      )}
    </aside>
  )
}
