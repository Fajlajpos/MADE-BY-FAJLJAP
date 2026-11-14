'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/** The header element: transparent at the top of the page, `data-scrolled` once it has moved. */
export function HeaderShell({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let last = false
    const onScroll = () => {
      const now = window.scrollY > 24
      if (now !== last) {
        last = now
        el.toggleAttribute('data-scrolled', now)
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header ref={ref} className={className}>
      {children}
    </header>
  )
}
