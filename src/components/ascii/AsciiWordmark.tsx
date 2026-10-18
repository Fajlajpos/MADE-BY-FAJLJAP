'use client'

import { useEffect, useRef } from 'react'
import { mountCpuField } from '@/lib/ascii/cpu'
import { FLUID_WAKE, loadKit, monoFamily, onSpotChange, RAMP } from '@/lib/ascii/env'
import { createTextScene } from '@/lib/ascii/scenes'
import styles from './AsciiWordmark.module.css'

type Props = {
  text: string
  /** Cell height in CSS px. */
  cellSize?: number
  /** Height of the 1800 px wide art canvas (kit `artHeight`); lower sets the word larger. */
  artHeight?: number
  eager?: boolean
  className?: string
  /** Rendered element; the word itself stays in it for selection and screen readers. */
  as?: 'p' | 'div' | 'span'
  /** Hide it from assistive tech when the same name is already said nearby. */
  decorative?: boolean
}

/**
 * The name set large in characters, with the trail under the cursor (asciify kit `wordmark`).
 * Without a GPU the CPU renderer draws the same word; without JS the HTML word shows.
 */
export function AsciiWordmark({
  text,
  cellSize = 10,
  artHeight = 380,
  eager = false,
  className,
  as: Tag = 'p',
  decorative = false,
}: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const host = ref.current
    if (!host) return
    let cancelled = false
    let cleanup = () => {}

    void (async () => {
      const [kit] = await Promise.all([loadKit(), document.fonts?.ready])
      if (cancelled) return
      const family = monoFamily()
      // a phone gets finer cells so the letters keep enough rows to read (never under 6 px)
      const cell = host.clientWidth < 640 ? Math.max(6, Math.round(cellSize * 0.66)) : cellSize

      if (kit) {
        const look = () => ({
          charset: RAMP,
          font: family,
          fontWeight: 500,
          cellSize: cell,
          cellAspect: 0.62,
          glyphScale: 0.92,
          contrast: 1,
          shade: 0.45,
          drift: 0.35,
          ...FLUID_WAKE,
          highlight: kit.resolveColor('--ascii-wake', host) ?? 'auto',
        })
        const handle = kit.wordmark(host, {
          font: family,
          fontWeight: 800,
          artHeight,
          ink: '--ascii-ink-strong',
          lazy: !eager,
          look: look(),
        })
        if (handle.supported) {
          host.dataset.ascii = 'gpu'
          const offSpot = onSpotChange(() => handle.update({ look: look() }))
          cleanup = () => {
            offSpot()
            handle.destroy()
          }
          return
        }
        handle.destroy()
      }

      const cpu = mountCpuField({
        host,
        paint: createTextScene(text, family),
        cellSize: cell,
        fps: 20,
      })
      host.dataset.ascii = 'cpu'
      cleanup = () => cpu.destroy()
    })()

    return () => {
      cancelled = true
      cleanup()
      delete host.dataset.ascii
    }
  }, [text, cellSize, artHeight, eager])

  return (
    <Tag
      ref={ref as React.Ref<HTMLParagraphElement>}
      className={[styles.word, className].filter(Boolean).join(' ')}
      aria-hidden={decorative || undefined}
    >
      {text}
    </Tag>
  )
}
