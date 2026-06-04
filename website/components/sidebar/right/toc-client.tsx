'use client'

import { cn } from '@/lib/cn'
import React from 'react'
import { TocItem } from 'slugtree'

export default function TocClient({ toc }: { toc: TocItem[] }) {
  const [activeId, setActiveId] = React.useState<string>('')
  const [indicatorStyle, setIndicatorStyle] = React.useState({
    top: 0,
    height: 0,
    opacity: 0
  })
  const navRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    const handleScroll = () => {
      if (!toc || toc.length === 0) return

      const headingElements = toc
        .map((item) => document.getElementById(item.id))
        .filter((el): el is HTMLElement => el !== null)

      if (headingElements.length === 0) return

      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      if (scrollPosition < 50) {
        setActiveId(headingElements[0].id)
        return
      }

      if (Math.ceil(scrollPosition + windowHeight) >= documentHeight - 20) {
        const lastEl = headingElements[headingElements.length - 1]
        if (lastEl.getBoundingClientRect().top < windowHeight) {
          setActiveId(lastEl.id)
          return
        }
      }

      let currentActiveId = headingElements[0].id
      const topOffset = 140

      for (const el of headingElements) {
        const top = el.getBoundingClientRect().top
        if (top <= topOffset) {
          currentActiveId = el.id
        } else {
          break
        }
      }

      setActiveId(currentActiveId)
    }

    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [toc])

  React.useEffect(() => {
    if (!activeId || !navRef.current) return
    const activeLink = navRef.current.querySelector(
      `a[href="#${activeId}"]`
    ) as HTMLElement
    if (activeLink) {
      setIndicatorStyle({
        top: activeLink.offsetTop,
        height: activeLink.offsetHeight,
        opacity: 1
      })
    }
  }, [activeId, toc])

  if (!toc || toc.length === 0) return null

  const minDepth = Math.min(...toc.map((item) => item.depth))

  return (
    <nav
      ref={navRef}
      className="flex flex-col relative border-border ml-1 mt-3"
    >
      <span
        className="absolute left-0 w-[3px] -ml-[2px] bg-foreground rounded-full transition-all duration-300 ease-out"
        style={{
          top: `${indicatorStyle.top + 2}px`,
          height: `${indicatorStyle.height - 4}px`,
          opacity: indicatorStyle.opacity
        }}
      />
      {toc.map((item) => {
        const isActive = activeId === item.id
        const paddingLeft = `${(item.depth - minDepth) * 0.75 + 1}rem`

        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            style={{ paddingLeft }}
            className={cn(
              `block py-1.5 font-sans text-xs transition-colors relative `,
              {
                'text-foreground font-medium': isActive,
                'text-foreground/60 hover:text-foreground/90': !isActive
              }
            )}
          >
            <span className="block" title={item.text}>
              {item.text}
            </span>
          </a>
        )
      })}
    </nav>
  )
}
