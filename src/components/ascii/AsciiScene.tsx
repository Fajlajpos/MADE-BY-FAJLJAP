'use client'

import { useRef, type ReactNode } from 'react'
import { getSlot } from '@/content/media'
import { createScene } from '@/lib/ascii/scenes'
import styles from './AsciiScene.module.css'
import { useAsciiField } from './useAsciiField'

type Props = {
  /** Media slot key (src/content/media.ts): its photo, or its generative placeholder. */
  slot: string
  seed?: number
  /** Cell height in CSS px. */
  cellSize?: number
  /** Mount at once instead of near the viewport (the hero). */
  eager?: boolean
  /** Hidden from assistive tech (when a real <img> beside it already says what it shows). */
  decorative?: boolean
  className?: string
  children?: ReactNode
}

/**
 * A media slot drawn in characters: the slot's photo when it has one, else its generative
 * placeholder. Before the field is up, and without JS, a dotted ground holds the space.
 */
export function AsciiScene({
  slot,
  seed = 1,
  cellSize = 9,
  eager = false,
  decorative = false,
  className,
  children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const media = getSlot(slot)

  useAsciiField(
    ref,
    async () => {
      const image = media.src ? await loadImage(media.src) : null
      return createScene(media.placeholder, { seed, image })
    },
    { cellSize, eager },
    [media.src, media.placeholder, seed, cellSize, eager],
  )

  return (
    <div
      ref={ref}
      className={[styles.scene, className].filter(Boolean).join(' ')}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : media.alt}
      aria-hidden={decorative || undefined}
    >
      {children}
    </div>
  )
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = src
  })
}
