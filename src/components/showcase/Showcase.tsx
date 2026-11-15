'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ShotWindow, UiMock, type MockKind } from '@/components/ui/UiMock'
import type { ObjectKind } from '@/three/site/ChromeObject'
import { Slot3D } from '@/three/site/Slot3D'
import styles from './Showcase.module.css'

/** A small piece of UI that floats in front of the picture, closer to you. */
const CHIPS: Record<MockKind, string> = {
  web: 'Načteno za 0,8 s',
  shop: 'Nová objednávka · 578 Kč',
  redesign: 'Načítání 6,2 s → 0,9 s',
  app: 'Kolo je hotové',
}

export type Hue = 'warm' | 'cold' | 'violet' | 'green'
export type Corner = 'tr' | 'tl' | 'br' | 'bl'

type Props = {
  /** The drawn picture of the work. */
  mock: MockKind
  /** The chrome object that stands on the corner of the card. */
  object: ObjectKind
  /** The colour of the light inside the card. */
  hue?: Hue
  /** Which corner the object sits on, half out of the card. */
  corner?: Corner
  /** A real photo (or anything else) instead of the drawn mock. */
  children?: ReactNode
  /** A real screenshot of the live site, shown in a browser window instead of the drawn mock. */
  shot?: { src: string; alt: string; url: string }
  /** The text of the floating chip (defaults to one that fits the mock). */
  chip?: string
  /** A wide plate (16:9 from tablet up) for the one project across the page. */
  wide?: boolean
  className?: string
}

/**
 * A dark metal plate with a picture of the work on it and a chrome object sitting on its
 * corner, half outside, like a paperweight. A soft light follows the cursor across the plate,
 * the picture leans toward it, and the object lifts while the cursor is on the card.
 */
export function Showcase({ mock, object, hue = 'warm', corner = 'tr', children, shot, chip, wide, className }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    const el = root.current
    if (!el) return
    let raf = 0
    let x = 0.5
    let y = 0.5
    const apply = () => {
      raf = 0
      el.style.setProperty('--mx', x.toFixed(3))
      el.style.setProperty('--my', y.toFixed(3))
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const r = el.getBoundingClientRect()
      x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
      y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
      if (!raf) raf = requestAnimationFrame(apply)
    }
    const onEnter = (e: PointerEvent) => e.pointerType !== 'touch' && setHover(true)
    const onLeave = () => {
      x = 0.5
      y = 0.5
      if (!raf) raf = requestAnimationFrame(apply)
      setHover(false)
    }
    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div
      ref={root}
      className={[styles.showcase, className].filter(Boolean).join(' ')}
      data-hue={hue}
      data-corner={corner}
      data-kind={children ? 'photo' : shot ? 'shot' : mock}
      data-hover={hover || undefined}
      data-wide={wide || undefined}
    >
      {/* two more plates under this one, like prints in a stack */}
      <span className={styles.sheet} aria-hidden="true" />
      <span className={styles.sheet} aria-hidden="true" />
      <div className={`${styles.plate} glow-card`}>
        <span className={styles.glow} aria-hidden="true" />
        <span className={styles.spot} aria-hidden="true" />
        <div className={styles.tilt}>
          {children ??
            (shot ? (
              <ShotWindow src={shot.src} alt={shot.alt} url={shot.url} sizes={wide ? '(min-width: 768px) 60vw, 90vw' : '(min-width: 768px) 40vw, 90vw'} />
            ) : (
              <UiMock kind={mock} className={styles.mock} />
            ))}
          {!children && (
            <span className={styles.chip} aria-hidden="true">
              <i />
              {chip ?? CHIPS[mock]}
            </span>
          )}
        </div>
        <span className={styles.sheen} aria-hidden="true" />
      </div>
      <Slot3D object={object} className={styles.object} active={hover} scale={1.35} tone={hue === 'warm' ? 'warm' : 'cold'} />
    </div>
  )
}
