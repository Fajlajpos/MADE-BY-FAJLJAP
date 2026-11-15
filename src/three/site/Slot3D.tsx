'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { ServiceObject } from '@/content/home'
import { prefersReducedMotion } from '@/lib/dom'
import type { ObjectKind } from './ChromeObject'
import { useThreeEnabled } from './context'
import styles from './Slot3D.module.css'

// three.js lives only in this chunk; the page loads it once 3D is switched on
const Slot3DView = dynamic(() => import('./Slot3DView'), { ssr: false })

export type RingProps = {
  objects: ServiceObject[]
  active: { current: number }
  land: { current: number }
}

type Props = {
  object: ObjectKind
  /** What the object shows, for screen readers. Empty = decorative. */
  label?: string
  className?: string
  style?: CSSProperties
  /** The card around it is hovered, focused or being read: the object lifts and turns faster. */
  active?: boolean
  scale?: number
  /** Which ink prints its shadow: orange, blue, or both slightly out of register. */
  tone?: 'warm' | 'cold' | 'dusk'
  /** The services ring instead of a single object. */
  ring?: RingProps
  /** Read every frame: >0 sends the object flying off (the paper plane after sending). */
  launch?: { current: number }
}

/** Where the lamp (cursor) is, relative to the slot: x, y in half-widths/heights from its centre (y down). */
export type LampRef = { current: { x: number; y: number } }

/** Until a mouse moves, the lamp hangs above left of every object. */
const LAMP_REST = { x: -0.9, y: -1.1 }

/**
 * A place on the page where a 3D object stands. With 3D on, a drei View draws it here in the
 * shared canvas; without (no WebGL, software renderer, before the canvas is up) the still render
 * from /public/objects shows instead. Under it the shadow is printed in halftone (plain CSS
 * either way) and slides away from the lamp.
 */
export function Slot3D({ object, label, className, style, active = false, scale = 1, tone = 'dusk', ring, launch }: Props) {
  const enabled = useThreeEnabled()
  const wrap = useRef<HTMLDivElement>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const lamp = useRef({ ...LAMP_REST })
  const [still] = useState(prefersReducedMotion)

  // the object leans toward the cursor wherever it is on the page, and the lamp (the cursor)
  // lights it from where it is; the printed shadow slides the other way
  useEffect(() => {
    if (still) return
    const onMove = (e: PointerEvent) => {
      const el = wrap.current
      // nothing to measure while the page scrolls (Interactions.tsx sets the flag)
      if (!el || e.pointerType === 'touch' || document.documentElement.hasAttribute('data-scrolling')) return
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      pointer.current.x = Math.max(-1, Math.min(1, dx / (window.innerWidth / 2)))
      pointer.current.y = Math.max(-1, Math.min(1, dy / (window.innerHeight / 2)))
      lamp.current.x = Math.max(-5, Math.min(5, dx / (r.width / 2)))
      lamp.current.y = Math.max(-5, Math.min(5, dy / (r.height / 2)))
      // only slots near the cursor need their shadow moved
      if (Math.abs(lamp.current.y) < 4) el.style.setProperty('--lamp-x', (Math.max(-1.5, Math.min(1.5, lamp.current.x)) / 1.5).toFixed(3))
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [still])

  return (
    <div
      ref={wrap}
      className={[styles.slot, className].filter(Boolean).join(' ')}
      style={style}
      data-tone={tone}
      data-object={ring ? 'ring' : object}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      <span className={styles.shadow} aria-hidden="true" />
      {enabled ? (
        <Slot3DView
          className={styles.view}
          object={object}
          pointer={pointer}
          lamp={lamp}
          active={active}
          still={still}
          scale={scale}
          ring={ring}
          launch={launch}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- a fixed still of the 3D object, sized by its slot
        <img className={styles.still} src={`/objects/${ring ? 'ring' : object}.webp`} alt="" loading="lazy" decoding="async" />
      )}
    </div>
  )
}
