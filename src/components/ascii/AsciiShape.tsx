'use client'

import { useRef } from 'react'
import { createShape, type ShapeKind } from '@/lib/ascii/shapes'
import styles from './AsciiScene.module.css'
import { useAsciiField } from './useAsciiField'

type Props = {
  shape: ShapeKind
  seed?: number
  /** Cell height in CSS px. */
  cellSize?: number
  eager?: boolean
  className?: string
}

/**
 * A solid shape turning in characters — the site's recurring form. Decorative: it says nothing
 * the text beside it does not.
 */
export function AsciiShape({ shape, seed = 0, cellSize = 8, eager = false, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useAsciiField(ref, () => createShape(shape, seed), { cellSize, eager, detail: 0.4 }, [
    shape,
    seed,
    cellSize,
    eager,
  ])
  return (
    <div
      ref={ref}
      className={[styles.scene, styles.shape, className].filter(Boolean).join(' ')}
      aria-hidden="true"
    />
  )
}
