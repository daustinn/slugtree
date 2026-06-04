'use client'

import { Moon, Sun } from '../icons'
import { useTheme } from '@/hooks/use-theme'

export default function ThemeToggle() {
  const { toggleTheme } = useTheme()

  return (
    <button
      suppressHydrationWarning
      onClick={toggleTheme}
      className="flex items-center gap-2 text-sm rounded-full bg-border/20 p-0.5 px-2 border justify-center"
    >
      <span className="hidden system:inline-block">System</span>
      <span className="hidden system:hidden dark:inline-block">Dark</span>
      <span className="hidden system:hidden light:inline-block">Light</span>
      <Sun width={18} className="dark:hidden inline-block" />
      <Moon width={18} className="hidden dark:block" />
    </button>
  )
}
