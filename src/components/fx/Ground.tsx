'use client'

import { useEffect, useRef } from 'react'
import { mountCpuField } from '@/lib/ascii/cpu'
import { loadKit, monoFamily, RAMP_QUIET } from '@/lib/ascii/env'
import { createScene } from '@/lib/ascii/scenes'
import styles from './Ground.module.css'

export type GroundPreset =
  | 'drift'
  | 'halo'
  | 'contour'
  | 'constellation'
  | 'cascade'
  | 'ripple'
  | 'interference'
  | 'caustics'

/**
 * One ground of characters behind the whole page, in graphite. Every section names its pattern
 * with `data-ground="contour"`; when a section reaches the middle of the screen the ground
 * cross-fades into it, so each section has its own texture and they still run into each other.
 * The section's `[data-clear]` block is kept clear. A click anywhere sends a ring through it.
 */
export function Ground() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = ref.current
    if (!host) return
    let cancelled = false
    let cleanup = () => {}

    void (async () => {
      const [kit] = await Promise.all([loadKit(), document.fonts?.ready])
      if (cancelled) return
      const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-ground]'))
      const first = sections[0]
      const presetOf = (el: HTMLElement | undefined) =>
        (el?.dataset.ground ?? 'drift') as GroundPreset
      const clearOf = (el: HTMLElement | undefined) =>
        el?.querySelector<HTMLElement>('[data-clear]') ?? false

      if (kit) {
        const handle = kit.background(host, {
          preset: kit[presetOf(first)],
          ink: '--ascii-ink',
          clear: clearOf(first),
          lazy: false,
          look: { font: monoFamily(), cellAspect: 0.62 },
        })
        if (handle.supported) {
          host.dataset.ascii = 'gpu'
          let current = presetOf(first)
          const io = new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (!entry.isIntersecting) continue
                const section = entry.target as HTMLElement
                const next = presetOf(section)
                if (next !== current) {
                  current = next
                  handle.setPreset(kit[next])
                }
                handle.update({ clear: clearOf(section) })
              }
            },
            // a section counts once it crosses the middle line of the screen
            { rootMargin: '-50% 0px -50% 0px' },
          )
          for (const s of sections) io.observe(s)
          const onClick = (event: MouseEvent) =>
            handle.field?.pulse({ x: event.clientX, y: event.clientY, strength: 1.3 })
          window.addEventListener('click', onClick)
          cleanup = () => {
            io.disconnect()
            window.removeEventListener('click', onClick)
            handle.destroy()
          }
          return
        }
        handle.destroy()
      }

      const cpu = mountCpuField({
        host,
        paint: createScene('ground', { seed: 3 }),
        cellSize: 12,
        charset: RAMP_QUIET,
        ink: '--ascii-ink',
        gain: 0.7,
        fps: 16,
        under: true,
      })
      host.dataset.ascii = 'cpu'
      cleanup = () => cpu.destroy()
    })()

    return () => {
      cancelled = true
      cleanup()
      delete host.dataset.ascii
    }
  }, [])

  return <div ref={ref} className={styles.ground} aria-hidden="true" />
}
