'use client'

import { useEffect } from 'react'

/**
 * Magnetic buttons, for a mouse only (never on touch, never with reduced motion): anything with
 * `[data-magnetic]` (the main buttons) leans toward the cursor while it is over it, and settles
 * back when it leaves. One pointermove listener for the page.
 *
 * Also marks the page `data-scrolling` while it scrolls (and ~150 ms after). Then the content
 * ignores the pointer (globals.css): the cards passing under a resting cursor do not flip into
 * their hover state on every frame, and the pointer handlers skip their work.
 */
export function Interactions() {
  useEffect(() => {
    const html = document.documentElement
    let t = 0
    const onScroll = () => {
      if (!t) html.setAttribute('data-scrolling', '')
      else window.clearTimeout(t)
      t = window.setTimeout(() => {
        t = 0
        html.removeAttribute('data-scrolling')
      }, 150)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.clearTimeout(t)
      html.removeAttribute('data-scrolling')
    }
  }, [])

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || calm.matches) return

    let pulled: HTMLElement | null = null
    const release = (el: HTMLElement | null) => {
      if (el) el.style.translate = ''
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || document.documentElement.hasAttribute('data-scrolling')) return
      const target = e.target instanceof Element ? e.target : null
      const mag = target?.closest<HTMLElement>('[data-magnetic]') ?? null
      if (mag !== pulled) {
        release(pulled)
        pulled = mag
      }
      if (!mag) return
      const r = mag.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
      mag.style.translate = `${(dx * 6).toFixed(1)}px ${(dy * 5).toFixed(1)}px`
    }
    const onLeave = () => {
      release(pulled)
      pulled = null
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      release(pulled)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return null
}
