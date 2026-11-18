'use client'

import { useEffect, useRef, useState } from 'react'
import { useContent } from '@/content/client'
import styles from './Header.module.css'

const CLICKS = 5
const WINDOW_MS = 2000

/**
 * Easter egg: click the logo five times quickly and it pulses like a heartbeat while a ring of light ripples out; a note pops up with a 5 % discount: write „kaves“ in the inquiry and I
 * know. Listens on the logo link (its parent) without stopping navigation for normal clicks.
 */
export function LogoEgg() {
  const ref = useRef<HTMLSpanElement>(null)
  const [found, setFound] = useState(false)
  const { egg } = useContent().ui

  useEffect(() => {
    const link = ref.current?.closest('a')
    if (!link) return
    let times: number[] = []
    const onClick = (e: MouseEvent) => {
      const now = Date.now()
      times = [...times.filter((t) => now - t < WINDOW_MS), now]
      // the clicks after the first one stay on the page (no jump to the top)
      if (times.length > 1) e.preventDefault()
      if (times.length >= CLICKS) {
        times = []
        link.removeAttribute('data-melt')
        void link.offsetWidth // restart the animation
        link.setAttribute('data-melt', '')
        setFound(true)
      }
    }
    const onEnd = (e: AnimationEvent) => {
      if (e.animationName.includes('eggPulse')) link.removeAttribute('data-melt')
    }
    // any click elsewhere on the page closes the note
    const onDocClick = (e: MouseEvent) => {
      if (!link.contains(e.target as Node)) setFound(false)
    }
    document.addEventListener('click', onDocClick)
    link.addEventListener('click', onClick)
    link.addEventListener('animationend', onEnd)
    return () => {
      document.removeEventListener('click', onDocClick)
      link.removeEventListener('click', onClick)
      link.removeEventListener('animationend', onEnd)
    }
  }, [])

  return (
    <span ref={ref} className={styles.eggAnchor}>
      {found && (
        <span className={styles.egg} role="status">
          <span>
            <strong>{egg.found} <em>5 %</em>.</strong> {egg.write} <code>kaves</code> {egg.yours}
          </span>
          <button
            type="button"
            className={styles.eggClose}
            aria-label={egg.close}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setFound(false)
            }}
          >
            ×
          </button>
        </span>
      )}
    </span>
  )
}
