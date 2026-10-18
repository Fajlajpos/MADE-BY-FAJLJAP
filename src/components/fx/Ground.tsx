'use client'

import { useEffect, useRef } from 'react'
import { mountCpuField } from '@/lib/ascii/cpu'
import { createGround, type GroundSpan, type GroundStyle, type GroundView } from '@/lib/ascii/drift'
import { loadKit, monoFamily, prefersReducedMotion } from '@/lib/ascii/env'
import styles from './Ground.module.css'

/** Cell height in CSS px (the kit's Drift). */
const CELL = 11
const CELL_W = CELL * 0.62
/** The kit's Drift ramp. */
const CHARSET = ' .:-=+*#'

/**
 * The ground of characters, printed onto the page: it scrolls with the content and shows new
 * ground as you go, the same on every load. Sections choose their variety with `data-ground`;
 * the varieties blend across the borders. The glyphs shimmer in place, the cursor smears them
 * and a click sends a ring.
 *
 * The canvas is fixed and a couple of cells taller than the screen; it slides up by the part of
 * the scroll that is less than one cell, and the pattern is read from whole page rows, so the
 * characters travel with the page instead of flickering in place.
 */
export function Ground() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = ref.current
    if (!host) return
    let cancelled = false
    let cleanup = () => {}
    const paintGround = createGround()
    let spans: GroundSpan[] = []

    const measure = () => {
      const list: GroundSpan[] = []
      for (const el of document.querySelectorAll<HTMLElement>('[data-ground]')) {
        const r = el.getBoundingClientRect()
        const top = r.top + window.scrollY
        list.push({ top, bottom: top + r.height, style: el.dataset.ground as GroundStyle })
      }
      spans = list
    }

    /** Slides the canvas by the sub-cell part of the scroll; returns the first page row. */
    const place = () => {
      const offset = window.scrollY % CELL
      host.style.transform = `translate3d(0, ${-offset}px, 0)`
      return Math.floor(window.scrollY / CELL)
    }

    const view = (w: number): GroundView => ({
      row0: place(),
      cellW: host.clientWidth / Math.max(1, w),
      cellH: CELL,
      unit: window.innerHeight,
      width: window.innerWidth,
      spans,
    })

    let refresh = () => {}
    let pulse: (x: number, y: number) => void = () => {}
    const onScroll = () => {
      place()
      if (prefersReducedMotion()) refresh()
    }
    const onClick = (event: MouseEvent) => pulse(event.clientX, event.clientY)
    const ro = new ResizeObserver(measure)

    void (async () => {
      const [kit] = await Promise.all([loadKit(), document.fonts?.ready])
      if (cancelled) return
      measure()

      const surface = kit?.mountSurface({
        host,
        kit: { current: { lazy: false } },
        layer: 'under',
        // one sample per character cell, rows exactly one cell tall
        resolution: (w, h) => [
          Math.max(16, Math.round(w / CELL_W)),
          Math.max(16, Math.round(h / CELL)),
        ],
        look: () => ({
          charset: CHARSET,
          cellSize: CELL,
          cellAspect: 0.62,
          font: monoFamily(),
          fontWeight: 500,
          glyphScale: 0.9,
          levels: 'none',
          blend: 'auto',
          contrast: 1,
          shade: 0.5,
          hover: 'trail',
          trail: { strength: 0.9, radius: 0.32 },
        }),
        ink: () => '--ascii-ground',
        reducedMotion: () => undefined,
        paint: ({ pen, width, height, now, still }) => {
          paintGround(pen, width, height, still ? 0 : now / 1000, view(width))
          return !still
        },
      })

      if (surface) {
        host.dataset.ascii = 'gpu'
        refresh = () => surface.kick()
        pulse = (x, y) => surface.field.pulse({ x, y: y + (window.scrollY % CELL), strength: 1.3 })
        cleanup = () => surface.destroy()
        return
      }

      const cpu = mountCpuField({
        host,
        paint: (ctx, w, h, t) => paintGround(ctx, w, h, t, view(w)),
        cellSize: CELL,
        charset: CHARSET,
        ink: '--ascii-ground',
        fps: 16,
        under: true,
      })
      host.dataset.ascii = 'cpu'
      refresh = () => cpu.refresh()
      pulse = (x, y) => cpu.pulse(x, y)
      cleanup = () => cpu.destroy()
    })()

    place()
    ro.observe(document.body)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('click', onClick)

    return () => {
      cancelled = true
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('click', onClick)
      cleanup()
      delete host.dataset.ascii
    }
  }, [])

  return <div ref={ref} className={styles.ground} aria-hidden="true" />
}
