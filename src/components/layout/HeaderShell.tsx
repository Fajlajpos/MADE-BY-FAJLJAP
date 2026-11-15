'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/** The header element: transparent at the top of the page, `data-scrolled` once it has moved. */
export function HeaderShell({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // a 1 px sentinel at the top of the page: no scroll handler, nothing read while scrolling
    const sentinel = document.createElement('div')
    sentinel.setAttribute('aria-hidden', 'true')
    sentinel.style.cssText = 'position:absolute;top:24px;left:0;width:1px;height:1px;pointer-events:none'
    document.body.prepend(sentinel)
    const io = new IntersectionObserver(([e]) => el.toggleAttribute('data-scrolled', !(e?.isIntersecting ?? true)))
    io.observe(sentinel)
    return () => {
      io.disconnect()
      sentinel.remove()
    }
  }, [])
  return (
    <header ref={ref} className={className}>
      {children}
    </header>
  )
}
