'use client'

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { prefersReducedMotion } from '@/lib/dom'

/**
 * A printed sheet that reacts to the desk lamp (the cursor). Wherever the lamp is on the page,
 * `--mx` / `--my` (in %, unclamped — the light can come from outside the sheet) say where its
 * light falls relative to the element, so the CSS can light the sheet's edge from that side.
 * While the cursor is over it, the sheet also leans toward it a little: `--rx` / `--ry` in deg.
 * Touch and reduced motion: no lean, no light tracking (the CSS default stands).
 */
export function Tilt({
  className,
  children,
  max = 3,
  style,
}: {
  className?: string
  children: ReactNode
  max?: number
  style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    let visible = false
    let raf = 0
    let px = -1
    let py = -1

    const update = () => {
      raf = 0
      if (!visible || px < 0) return
      const r = el.getBoundingClientRect()
      const x = (px - r.left) / r.width
      const y = (py - r.top) / r.height
      el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
      el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1
      el.style.setProperty('--ry', inside ? `${((x - 0.5) * 2 * max).toFixed(2)}deg` : '0deg')
      el.style.setProperty('--rx', inside ? `${((0.5 - y) * 2 * max).toFixed(2)}deg` : '0deg')
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      px = e.clientX
      py = e.clientY
      schedule()
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
      if (visible) schedule()
    })
    io.observe(el)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', schedule, { passive: true })
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', schedule)
    }
  }, [max])

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}
