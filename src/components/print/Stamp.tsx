import type { CSSProperties, ReactNode } from 'react'
import styles from './print.module.css'

/**
 * A rubber stamp in orange ink: a bordered block of typewriter text, slightly rotated, with
 * worn edges (the #rough filter from <PrintFilters/>). Multiplied over whatever is under it.
 */
export function Stamp({ children, rotate = -6, className }: { children: ReactNode; rotate?: number; className?: string }) {
  return (
    <span className={[styles.stamp, className].filter(Boolean).join(' ')} style={{ '--rot': `${rotate}deg` } as CSSProperties}>
      {children}
    </span>
  )
}
