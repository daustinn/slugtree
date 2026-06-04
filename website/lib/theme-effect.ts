const themeEffect = () => {
  const pref = localStorage.getItem('theme')

  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'

  const prefTheme = pref === 'dark' ? 'dark' : pref === 'light' ? 'light' : null

  document.documentElement.setAttribute('data-theme', prefTheme || 'system')

  document.documentElement.setAttribute(
    'data-theme-resolved',
    prefTheme || systemTheme
  )

  document.documentElement.style.setProperty(
    'color-scheme',
    prefTheme || systemTheme
  )

  return {
    theme: prefTheme || 'system',
    resolvedTheme: prefTheme || systemTheme
  }
}

export default themeEffect
