'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { loadKit, monoFamily } from '@/lib/ascii/env'

type Props = {
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  id?: string
  className?: string
  /** Character cell height in CSS px; smaller draws finer letters. */
  cellSize?: number
  /** Ms the words take to condense out of the drift. */
  duration?: number
  children: ReactNode
}

/**
 * Type drawn in characters (asciify kit `decode`, settled in glyphs): the words condense out of a
 * drifting field when they scroll into view, replay on hover, and stay drawn in characters. The
 * real text stays in the DOM for selection and screen readers; without a GPU it simply shows.
 */
export function Glyphs({
  as: Tag = 'h2',
  id,
  className,
  cellSize,
  duration = 900,
  children,
}: Props) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let cancelled = false
    let cleanup = () => {}
    void (async () => {
      const [kit] = await Promise.all([loadKit(), document.fonts?.ready])
      if (cancelled || !kit) return
      // small type has too few cells per letter to read as characters: on a phone the words
      // condense out of the drift, then hand back to the crisp text
      const roomy =
        el.getBoundingClientRect().height / Math.max(1, el.innerText.split('\n').length) > 64
      const handle = kit.decode(el, {
        duration,
        settle: roomy ? 'glyphs' : 'text',
        replayOnHover: true,
        look: { font: monoFamily(), cellAspect: 0.62, ...(cellSize ? { cellSize } : {}) },
      })
      cleanup = () => handle.destroy()
    })()
    return () => {
      cancelled = true
      cleanup()
    }
  }, [cellSize, duration])

  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  )
}
