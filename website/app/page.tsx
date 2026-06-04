import { ArrowBack } from '@/components/icons'
import PixelBlast from '@/components/pixel-blast'
import BlockCode from '@/components/ui/block-code'
import { links } from '@/const'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="overflow-auto flex flex-col min-h-svh">
      <div className="fixed inset-0">
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <PixelBlast
            variant="circle"
            pixelSize={4}
            color="blue"
            patternScale={1}
            patternDensity={0.6}
            enableRipples={false}
            rippleSpeed={0.15}
            rippleThickness={0.05}
            rippleIntensityScale={1}
            speed={0.2}
            transparent
            edgeFade={0.25}
          />
        </div>
      </div>
      <header className="px-7 lg:px-16 space-y-7 pt-6 lg:pt-10 grow flex flex-col">
        <h1 className="text-5xl relative tracking-tight sm:text-7xl lg:text-[8rem]">
          slugtree
        </h1>
        <h2 className="font-pixel text-xl relative">
          Write in MDX. Let Slugtree build the tree
        </h2>
        <Link
          href="/docs"
          className="inline-flex w-fit relative hover:[&>svg]:translate-x-[2px] rounded-full bg-foreground text-background font-medium font-sans items-center gap-2 p-2 px-4"
        >
          Get started
          <ArrowBack width={20} className="rotate-180 transition-transform" />
        </Link>
        <BlockCode
          lineNumbers={false}
          lang="bash"
          copy={false}
          className="mx-1 my-0! p-0! relative border-0! bg-transparent!"
        >
          ~ pnpm add slugtree@latest
        </BlockCode>
      </header>
      <footer className="px-7 lg:px-16 relative space-y-5 pt-6 lg:pt-10 pb-10">
        <p className="max-w-[60ch] relative [&>span]:text-foreground/90 [&>a]:underline">
          <span>
            Slugtree is a content layer that reads your MDX files and turns them
            into a strongly-typed navigation tree — with sidebar data,
            breadcrumbs, pagination, table of contents, and full-text search,
            ready to use. You own the UI, Slugtree owns the data.
          </span>
        </p>
        <ul className="flex gap-2">
          {Object.entries(links).map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="underline relative"
              target="_blank"
              rel="noopener noreferrer"
            >
              {label}
            </a>
          ))}
        </ul>
        <p className="opacity-90 text-sm relative">
          © {new Date().getFullYear()} slugtree and Daustinn. All rights
          reserved.
        </p>
      </footer>
    </main>
  )
}
