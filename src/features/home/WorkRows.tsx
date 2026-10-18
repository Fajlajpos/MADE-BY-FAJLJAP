'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Glyphs } from '@/components/ascii/Glyphs'
import { Photo } from '@/components/media/Photo'
import styles from './Work.module.css'

export type WorkRow = {
  slug: string
  index: string
  title: string
  summary: string
  field: string
  year: number
  slot: string
}

/**
 * Projects as huge names drawn in characters. The row you point at (or focus) opens and shows a
 * wide preview of the project; on a touch screen every row stays open.
 */
export function WorkRows({ rows, open }: { rows: WorkRow[]; open: string }) {
  const [active, setActive] = useState(0)

  return (
    <ol className={styles.rows} role="list">
      {rows.map((row, i) => (
        <li
          key={row.slug}
          className={styles.row}
          data-open={active === i}
          onPointerEnter={() => setActive(i)}
          onFocusCapture={() => setActive(i)}
        >
          <Link href={`/prace/${row.slug}`} className={styles.link}>
            <span className={`meta ${styles.meta}`}>
              <span>{row.index}</span>
              <span>{row.field}</span>
              <span>{row.year}</span>
            </span>
            <Glyphs as="h3" className={styles.title} cellSize={6}>
              {row.title}
            </Glyphs>
          </Link>
          <div className={styles.reveal}>
            <div className={styles.revealInner}>
              <Photo slot={row.slot} ratio="21 / 9" no={row.index} seed={i + 3} cellSize={7} />
              <div className={styles.detail}>
                <p className={styles.summary}>{row.summary}</p>
                <Link
                  href={`/prace/${row.slug}`}
                  className={styles.open}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {open} <span>-&gt;</span>
                </Link>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
