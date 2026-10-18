'use client'

import { useEffect } from 'react'
import { prefersReducedMotion } from '@/lib/ascii/env'

/**
 * Parallax for the objects lying on the world: every `[data-depth="0.1"]` element drifts by that
 * share of its distance from the middle of the viewport. Positive floats nearer (moves faster),
 * negative sinks back. One rAF for the whole page; off under reduced motion.
 */
export function Depth() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    let els: HTMLElement[] = []
    let raf = 0
    const collect = () => {
      els = Array.from(document.querySelectorAll<HTMLElement>('[data-depth]'))
    }
    const update = () => {
      raf = 0
      const mid = window.innerHeight / 2
      for (const el of els) {
        const depth = Number(el.dataset.depth) || 0
        const rect = el.getBoundingClientRect()
        // measure without our own offset, so it never feeds back
        const current = Number(el.dataset.depthY) || 0
        const center = rect.top - current + rect.height / 2
        if (center < -window.innerHeight || center > window.innerHeight * 2) continue
        const y = (mid - center) * depth
        el.dataset.depthY = String(y)
        el.style.translate = `0 ${y.toFixed(1)}px`
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    collect()
    update()
    const mo = new MutationObserver(collect)
    mo.observe(document.body, { childList: true, subtree: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      mo.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      for (const el of els) el.style.translate = ''
    }
  }, [])
  return null
}
