'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Media } from '@/components/media/Media'
import { home } from '@/content/home'
import { prefersReducedMotion } from '@/lib/dom'
import { typo } from '@/lib/typo/czech'
import shared from './home.module.css'
import styles from './Gallery.module.css'

/**
 * Mimo obrazovku — a horizontal strip of photos that runs off the right edge. Scrolls with touch,
 * trackpad, the arrow keys once the strip has focus, or the two buttons. Each photo is a media
 * slot (home.studio.*), captioned under it.
 */
export function Gallery() {
  const { gallery } = home
  const strip = useRef<HTMLUListElement>(null)
  const [edge, setEdge] = useState({ start: true, end: false })

  const update = useCallback(() => {
    const el = strip.current
    if (!el) return
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 })
  }, [])

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update])

  const move = (dir: 1 | -1) => {
    const el = strip.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  return (
    <section className={shared.section} aria-labelledby="mimo-title">
      <p className={shared.label} data-reveal="">
        <b>{gallery.index}</b> Fotky
      </p>

      <div className={styles.head}>
        <h2 id="mimo-title" className={`${shared.h2} ${styles.title}`} data-reveal="">
          {typo(gallery.label)}
        </h2>
        <p className={shared.lead} data-reveal="" style={{ '--reveal-i': 1 } as CSSProperties}>
          {typo(gallery.lead)}
        </p>
      </div>

      <div className={styles.controls}>
        <p className={styles.hint} aria-hidden="true">
          {gallery.hint}
        </p>
        <div className={styles.buttons}>
          <button type="button" className={styles.step} onClick={() => move(-1)} disabled={edge.start} aria-label="Předchozí fotky">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 12H6M11 6l-6 6 6 6" />
            </svg>
          </button>
          <button type="button" className={styles.step} onClick={() => move(1)} disabled={edge.end} aria-label="Další fotky">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h13M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      <ul
        ref={strip}
        className={styles.strip}
        role="list"
        tabIndex={0}
        aria-label={`${gallery.label}: fotky, ${gallery.hint} nebo šipkami`}
        onScroll={update}
        data-reveal=""
      >
        {gallery.frames.map((frame) => (
          <li key={frame.slot} className={styles.frame} style={{ '--ratio': frame.ratio } as CSSProperties}>
            <figure className={styles.figure}>
              <div className={styles.shot}>
                <Media slot={frame.slot} className={styles.media} sizes="(min-width: 1024px) 30vw, 72vw" />
              </div>
              <figcaption className={`label ${styles.caption}`}>{typo(frame.caption)}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}
