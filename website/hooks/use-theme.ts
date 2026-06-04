'use client'

import themeEffect from '@/lib/theme-effect'
import React from 'react'

export const useTheme = () => {
  React.useEffect(() => {
    const handleChange = () => {
      themeEffect()
    }
    const matchMedia = window.matchMedia('(prefers-color-scheme: dark)')
    matchMedia.addEventListener('change', handleChange)
    return () => matchMedia.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    const prefTheme = localStorage.getItem('theme')
    handleTheme(!prefTheme ? 'light' : prefTheme === 'light' ? 'dark' : null)
  }

  const handleTheme = (newTheme: string | null) => {
    if (newTheme) localStorage.setItem('theme', newTheme)
    else localStorage.removeItem('theme')
    themeEffect()
  }

  return { toggleTheme }
}
