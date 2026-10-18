'use client'

import { useRef, type ReactNode } from 'react'
import styles from './Gallery.module.css'

/**
 * A horizontal strip that scrolls on its own axis: trackpad, touch and keyboard as usual, and a
 * mouse can grab it and throw it sideways.
 */
export function Strip({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null)
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null)

  return (
    <ul
      ref={ref}
      className={styles.strip}
      role="list"
      aria-label={label}
      tabIndex={0}
      onPointerDown={(event) => {
        if (event.pointerType !== 'mouse' || !ref.current) return
        drag.current = { x: event.clientX, left: ref.current.scrollLeft, moved: false }
        ref.current.dataset.dragging = 'true'
      }}
      onPointerMove={(event) => {
        const d = drag.current
        const el = ref.current
        if (!d || !el) return
        const dx = event.clientX - d.x
        if (Math.abs(dx) > 4) d.moved = true
        el.scrollLeft = d.left - dx
      }}
      onPointerUp={() => {
        drag.current = null
        if (ref.current) delete ref.current.dataset.dragging
      }}
      onPointerLeave={() => {
        drag.current = null
        if (ref.current) delete ref.current.dataset.dragging
      }}
    >
      {children}
    </ul>
  )
}
