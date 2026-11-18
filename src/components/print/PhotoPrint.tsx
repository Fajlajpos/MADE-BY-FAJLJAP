'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useContent } from '@/content/client'
import styles from './PhotoPrint.module.css'

type Props = {
  /** Media slot key (src/content/media.ts); its photo is the print. */
  slot: string
  /** The orange date the camera burned into the corner, e.g. "'26 1 31". */
  stamp?: string
  /** Written on the white strip under the photo. */
  note?: string
  /** What is written on the back (shown when the print is turned over). */
  back?: string[]
  /** An Instagram-style tag on the photo: who is in it and where it links. `at` in % of the photo. */
  tag?: { label: string; href: string; at: [number, number] }
  /** Something standing over the print's corner (the 3D mug). */
  children?: ReactNode
  sizes?: string
  className?: string
}

/**
 * A photo as a real print: lab paper with a white border and a wider strip at the bottom, taped
 * to the page, a little crooked, with the camera's orange date in the corner. Another print peeks
 * out under it, and the photo's own colours light the page around it (a tiny pre-blurred copy,
 * stretched). The print leans toward the cursor and lifts; a click (or Enter) turns it over to
 * what is written on the back. It drops onto the page once, the first time it comes into view.
 */
export function PhotoPrint({ slot, stamp, note, back, tag, children, sizes = '(min-width: 1024px) 40vw, 90vw', className }: Props) {
  const { getSlot, ui } = useContent()
  const t = ui.print
  const media = getSlot(slot)
  const root = useRef<HTMLDivElement>(null)
  const [flipped, setFlipped] = useState(false)
  const glow = media.src?.replace(/\.webp$/, '-glow.webp')
  const [fx, fy] = media.focal ?? [0.5, 0.5]

  // lean toward the cursor while it is over the print (CSS variables, set at most once a frame)
  useEffect(() => {
    const el = root.current
    if (!el) return
    let raf = 0
    let x = 0
    let y = 0
    const apply = () => {
      raf = 0
      el.style.setProperty('--px', x.toFixed(3))
      el.style.setProperty('--py', y.toFixed(3))
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || document.documentElement.hasAttribute('data-scrolling')) return
      const r = el.getBoundingClientRect()
      x = ((e.clientX - r.left) / r.width - 0.5) * 2
      y = ((e.clientY - r.top) / r.height - 0.5) * 2
      if (!raf) raf = requestAnimationFrame(apply)
    }
    const onLeave = () => {
      x = 0
      y = 0
      if (!raf) raf = requestAnimationFrame(apply)
    }
    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  if (!media.src) return null

  return (
    <div ref={root} className={[styles.print, className].filter(Boolean).join(' ')} data-flipped={flipped || undefined}>
      {glow && (
        // eslint-disable-next-line @next/next/no-img-element -- a 48 px blurred copy, stretched as light
        <img className={styles.glow} src={glow} alt="" aria-hidden="true" decoding="async" />
      )}

      {/* the print underneath, turned the other way */}
      <span className={styles.under} aria-hidden="true" />

      <button
        type="button"
        className={styles.card}
        onClick={() => setFlipped((f) => !f)}
        aria-pressed={flipped}
        aria-label={flipped ? t.flipBack : t.flip}
      >
        <span className={styles.front}>
          <span className={styles.photo}>
            <Image
              src={media.src}
              alt={media.alt}
              fill
              sizes={sizes}
              className={styles.img}
              style={{ objectPosition: `${fx * 100}% ${(1 - fy) * 100}%` }}
            />
            {stamp && (
              <span className={styles.stamp} aria-hidden="true">
                {stamp}
              </span>
            )}
          </span>
          {note && <span className={styles.note}>{note}</span>}
        </span>

        <span className={styles.back} aria-hidden={!flipped}>
          {back?.map((line) => (
            <span key={line} className={styles.backLine}>
              {line}
            </span>
          ))}
          <span className={styles.backMark}>{t.mark}</span>
        </span>
      </button>

      {/* the tag sits on the photo but outside the button, so it is its own link */}
      {tag && (
        <a
          className={styles.tag}
          href={tag.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ left: `${tag.at[0]}%`, top: `${tag.at[1]}%` }}
        >
          {tag.label}
          <span className="visually-hidden"> {t.onInstagram} {ui.newWindow}</span>
        </a>
      )}

      {/* two pieces of tape holding it to the page */}
      <span className={`${styles.tape} ${styles.tapeL}`} aria-hidden="true" />
      <span className={`${styles.tape} ${styles.tapeR}`} aria-hidden="true" />

      <span className={styles.hint} aria-hidden="true">
        {flipped ? t.hintBack : t.hint}
      </span>

      {children}
    </div>
  )
}
