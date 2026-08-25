import { $$, $ } from '#/lib/dom'
const $menus = $$('.menu')

$menus.forEach(($menu) => {
  const $trigger = $('.menu__trigger', $menu)
  const $content = $('.menu__content', $menu)

  if (!$content) return

  $trigger?.setAttribute('aria-haspopup', 'menu')
  $trigger?.setAttribute('aria-expanded', 'false')
  $content.setAttribute('aria-expanded', 'false')
  $content.setAttribute('role', 'menu')

  const $menuItems = $$('.menu__item', $content)
  $menuItems.forEach(($item) => {
    $item.setAttribute('role', 'menuitem')
  })

  function close(restoreFocus = false) {
    $content?.classList.remove('open')
    $content?.setAttribute('aria-expanded', 'false')
    $trigger?.setAttribute('aria-expanded', 'false')
    if (restoreFocus) {
      $trigger?.focus()
    }
  }

  function open(focusTarget: 'first' | 'last' | 'none' = 'first') {
    $content?.classList.add('open')
    $content?.setAttribute('aria-expanded', 'true')
    $trigger?.setAttribute('aria-expanded', 'true')

    if (!$content) return

    const items = $$<HTMLElement>('.menu__item', $content)
    if (items.length > 0) {
      if (focusTarget === 'first') {
        items[0].focus()
      } else if (focusTarget === 'last') {
        items[items.length - 1].focus()
      }
    }
  }

  $trigger?.addEventListener('click', (e) => {
    e.stopPropagation()
    const isOpen = $content.getAttribute('aria-expanded') === 'true'
    if (isOpen) {
      close()
    } else {
      open('first')
    }
  })

  $trigger?.addEventListener('keydown', (e) => {
    const isOpen = $content.getAttribute('aria-expanded') === 'true'
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!isOpen) open('first')
      else close()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!isOpen) open('last')
      else close()
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault()
      close(true)
    }
  })

  $menu.addEventListener('click', () => {
    open('first')
  })

  $menu.addEventListener('keydown', (e) => {
    const isOpen = $content.getAttribute('aria-expanded') === 'true'
    if (!isOpen) return

    const items = $$<HTMLElement>('.menu__item', $content)
    if (items.length === 0) return

    const activeElement = document.activeElement as HTMLElement
    const currentIndex = items.indexOf(activeElement)

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIndex =
        currentIndex === -1 ? 0 : (currentIndex + 1) % items.length
      items[nextIndex]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prevIndex =
        currentIndex === -1
          ? items.length - 1
          : (currentIndex - 1 + items.length) % items.length
      items[prevIndex]?.focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      items[0]?.focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      items[items.length - 1]?.focus()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close(true)
    } else if (e.key === 'Tab') {
      close()
    }
  })

  $menu.addEventListener('focusout', (e) => {
    const related = e.relatedTarget as Node | null
    if (related && !$menu.contains(related)) {
      close()
    }
  })

  document.addEventListener('click', (e) => {
    const isOpen = $content.getAttribute('aria-expanded') === 'true'
    if (isOpen && !$menu.contains(e.target as Node)) {
      close()
    }
  })
})
