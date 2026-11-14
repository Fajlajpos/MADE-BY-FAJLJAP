import type { ReactNode } from 'react'
import styles from './print.module.css'

type Mark = 'circle' | 'underline' | 'strike' | 'arrow'

const PATHS: Record<Mark, { d: string; viewBox: string }> = {
  // a ballpoint ellipse drawn in one go, overshooting where it closes
  circle: {
    viewBox: '0 0 200 80',
    d: 'M108 6C58 2 10 14 8 40c-2 26 52 36 104 34 50-2 84-14 82-36C192 16 150 4 96 8c-22 2-40 6-52 12',
  },
  underline: { viewBox: '0 0 200 20', d: 'M3 12c40-6 84-8 128-5 22 1 44 4 66 1M20 17c50-4 100-4 150 0' },
  strike: { viewBox: '0 0 200 20', d: 'M2 11c60-3 130-5 196-2' },
  arrow: { viewBox: '0 0 120 60', d: 'M4 48C30 20 64 10 108 14M92 4l16 10-14 14' },
}

/**
 * Inline text with a pen mark over it — circled, underlined, struck through, or an arrow pointing
 * at it. The mark is drawn in blue ballpoint and draws itself in when it scrolls into view
 * (data-reveal). Decorative: the text stays plain for screen readers.
 */
export function Marked({ mark = 'circle', children, className }: { mark?: Mark; children: ReactNode; className?: string }) {
  const p = PATHS[mark]
  return (
    <span className={[styles.marked, className].filter(Boolean).join(' ')} data-mark={mark}>
      {children}
      <svg className={styles.mark} viewBox={p.viewBox} preserveAspectRatio="none" aria-hidden="true" data-reveal="">
        <path d={p.d} pathLength={1} />
      </svg>
    </span>
  )
}
