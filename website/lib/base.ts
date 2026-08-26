export default (to: string) => {
  let base: string
  try {
    const { pathname } = new URL(
      import.meta.env.SITE + (import.meta.env.SITE_BASE ?? '')
    )

    base = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  } catch {
    base = ''
  }

  const cleanTo = to?.startsWith('/') ? to : `/${to}`

  if (base && cleanTo === '/') return base

  return `${base}${cleanTo}`
}
