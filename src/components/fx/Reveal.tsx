'use client'

import { useEffect } from 'react'

/**
 * Gentle reveals: every `[data-reveal]` fades and rises 12 px the first time it enters the
 * viewport (globals.css). Optional `--reveal-i` staggers siblings. Without JS — and with reduced
 * motion, where durations are ~0 — everything is simply there.
 */
export function Reveal() {
  useEffect(() => {
    const seen = new WeakSet<Element>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.setAttribute('data-in', '')
          io.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    const collect = () => {
      for (const el of document.querySelectorAll('[data-reveal]:not([data-in])')) {
        if (seen.has(el)) continue
        seen.add(el)
        io.observe(el)
      }
    }
    collect()
    const mo = new MutationObserver(collect)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
  return null
}
