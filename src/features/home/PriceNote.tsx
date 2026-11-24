'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './Pricing.module.css'

const FRAME_MS = 110

/**
 * A banknote with my face for a price (public/prices/<id>-1…5.webp: flat, then crumpling into a
 * ball). A click crumples it frame by frame; another click smooths it out again. All frames are
 * stacked and only one shows, so nothing reloads mid-animation. Reduced motion: it jumps.
 */
/** Sends the visitor to the inquiry form with this service picked (ContactForm listens for it). */
export const PICK_SERVICE = 'fajlajp:pick-service'

export function PriceNote({ id, frames = 5, label, service }: { id: string; frames?: number; label: string; service?: number }) {
  const [frame, setFrame] = useState(1)
  const [crumpled, setCrumpled] = useState(false)
  const timer = useRef<number>(0)

  useEffect(() => () => window.clearInterval(timer.current), [])

  // crumpled all the way: on to the form, the service ticked, and the note smooths out again
  const toContact = () => {
    if (service === undefined) return
    window.dispatchEvent(new CustomEvent(PICK_SERVICE, { detail: service }))
    document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => {
      setFrame(1)
      setCrumpled(false)
    }, 900)
  }

  const toggle = () => {
    window.clearInterval(timer.current)
    const target = crumpled ? 1 : frames
    setCrumpled(!crumpled)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFrame(target)
      if (target === frames) toContact()
      return
    }
    const step = target > frame ? 1 : -1
    timer.current = window.setInterval(() => {
      setFrame((f) => {
        const next = f + step
        if (next === target) {
          window.clearInterval(timer.current)
          if (target === frames) window.setTimeout(toContact, 350)
        }
        return next
      })
    }, FRAME_MS)
  }

  return (
    <button
      type="button"
      className={styles.note}
      onClick={toggle}
      aria-pressed={crumpled}
      aria-label={label}
      // tilt toward the cursor: --rx / --ry from where the pointer is on the note
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return
        const r = e.currentTarget.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        e.currentTarget.style.setProperty('--ry', `${(x * 14).toFixed(2)}deg`)
        e.currentTarget.style.setProperty('--rx', `${(-y * 14).toFixed(2)}deg`)
        e.currentTarget.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`)
        e.currentTarget.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`)
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.setProperty('--ry', '0deg')
        e.currentTarget.style.setProperty('--rx', '0deg')
      }}
    >
      {Array.from({ length: frames }, (_, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- frames of one animation, stacked
        <img
          key={i}
          src={`/prices/${id}-${i + 1}.webp`}
          alt=""
          width={1300}
          height={724}
          className={styles.noteFrame}
          data-on={i + 1 === frame || undefined}
          loading="lazy"
        />
      ))}
      <span
        className={styles.noteSheen}
        style={{ WebkitMaskImage: `url(/prices/${id}-1.webp)`, maskImage: `url(/prices/${id}-1.webp)` }}
        data-gone={frame > 1 || undefined}
        aria-hidden="true"
      />
    </button>
  )
}
