'use client'

import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/lib/ascii/env'

/**
 * Small live readouts in characters: they keep the page moving at the cost of a few text nodes.
 * Every one renders a stable placeholder on the server, so hydration never mismatches.
 */

const SPIN = ['|', '/', '-', '\\']

/** | / - \ turning. A still "*" under reduced motion. */
export function Spinner({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) {
      if (el) el.textContent = '*'
      return
    }
    let i = 0
    const id = window.setInterval(() => {
      i = (i + 1) % SPIN.length
      el.textContent = SPIN[i]!
    }, 130)
    return () => window.clearInterval(id)
  }, [])
  return (
    <span ref={ref} className={className} aria-hidden="true">
      |
    </span>
  )
}

const clockFormat = new Intl.DateTimeFormat('cs-CZ', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZone: 'Europe/Prague',
})

/** Local time in Prague, ticking. */
export function Clock({ className }: { className?: string }) {
  const [now, setNow] = useState<string | null>(null)
  useEffect(() => {
    const tick = () => setNow(clockFormat.format(new Date()))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <span className={className}>
      <span className="visually-hidden">Čas v Praze: </span>
      <time suppressHydrationWarning>{now ?? '--:--:--'}</time>
    </span>
  )
}

const BAR = 12

/** [####--------] 033 % — how far down the page you are. */
export function ScrollMeter({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      const filled = Math.round(p * BAR)
      el.textContent = `[${'#'.repeat(filled)}${'-'.repeat(BAR - filled)}] ${String(Math.round(p * 100)).padStart(3, '0')}%`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return (
    <span ref={ref} className={className} aria-hidden="true">
      [{'-'.repeat(BAR)}] 000%
    </span>
  )
}

/** X 0412 Y 0233 — where the cursor is (or the scroll offset on touch). */
export function CursorReadout({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const pad = (n: number) => String(Math.max(0, Math.round(n))).padStart(4, '0')
    const onMove = (event: PointerEvent) => {
      el.textContent = `X ${pad(event.clientX)}  Y ${pad(event.clientY)}`
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
  return (
    <span ref={ref} className={className} aria-hidden="true">
      X 0000 Y 0000
    </span>
  )
}
