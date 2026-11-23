'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './Pricing.module.css'

const FRAME_MS = 110

/**
 * A banknote with my face for a price (public/prices/<id>-1…5.webp: flat, then crumpling into a
 * ball). A click crumples it frame by frame; another click smooths it out again. All frames are
 * stacked and only one shows, so nothing reloads mid-animation. Reduced motion: it jumps.
 */
export function PriceNote({ id, frames = 5, label }: { id: string; frames?: number; label: string }) {
  const [frame, setFrame] = useState(1)
  const [crumpled, setCrumpled] = useState(false)
  const timer = useRef<number>(0)

  useEffect(() => () => window.clearInterval(timer.current), [])

  const toggle = () => {
    window.clearInterval(timer.current)
    const target = crumpled ? 1 : frames
    setCrumpled(!crumpled)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFrame(target)
      return
    }
    const step = target > frame ? 1 : -1
    timer.current = window.setInterval(() => {
      setFrame((f) => {
        const next = f + step
        if (next === target) window.clearInterval(timer.current)
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
    </button>
  )
}
