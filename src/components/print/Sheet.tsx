import type { ElementType, ReactNode } from 'react'
import styles from './print.module.css'

type Props = {
  as?: ElementType
  className?: string
  /** Printed in the corner like a page number, e.g. "str. 04". */
  folio?: string
  /** Crop marks at the four corners. */
  marks?: boolean
  /** A darker sheet (the second colour of paper). */
  shade?: boolean
  children: ReactNode
  id?: string
  'aria-labelledby'?: string
}

/**
 * A printed sheet: a block of paper with crop marks at its corners and a page number. Use it
 * instead of a "card" — no radius, no border, no shadow; the edges are the marks.
 */
export function Sheet({ as: Tag = 'div', className, folio, marks = true, shade = false, children, ...rest }: Props) {
  return (
    <Tag className={[styles.sheet, className].filter(Boolean).join(' ')} data-marks={marks || undefined} data-shade={shade || undefined} {...rest}>
      {children}
      {folio && (
        <span className={`note ${styles.folio}`} aria-hidden="true">
          {folio}
        </span>
      )}
    </Tag>
  )
}
