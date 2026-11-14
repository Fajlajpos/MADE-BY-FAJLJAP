'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/lib/dom'
import { detectTier, type Tier } from '@/three/quality'
import styles from './Hero.module.css'

const HeroCanvas = dynamic(() => import('@/three/hero/HeroCanvas'), { ssr: false })

/**
 * Runs the chrome cluster behind the hero: decides whether this device gets 3D, loads the canvas
 * after the first paint, tells it how far the hero has scrolled away (a ref, no re-renders) and
 * stops it while the hero is off screen. Without 3D the hero keeps its quiet gradient.
 */
export function HeroStage() {
  const root = useRef<HTMLDivElement>(null)
  const progress = useRef(0)
  const [tier, setTier] = useState<Tier | null>(null)
  const [running, setRunning] = useState(true)
  const [ready, setReady] = useState(false)
  const [still] = useState(prefersReducedMotion)
  const [shift, setShift] = useState(1.6)

  useEffect(() => {
    let cancelled = false
    void (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (!cancelled) setTier(detectTier())
    })
    const section = root.current?.closest('section')
    if (!section) return
    const io = new IntersectionObserver(([e]) => setRunning(e?.isIntersecting ?? false), { rootMargin: '80px' })
    io.observe(section)
    let raf = 0
    const measure = () => {
      raf = 0
      const r = section.getBoundingClientRect()
      progress.current = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    const onResize = () => {
      const w = window.innerWidth
      setShift(w < 760 ? 0 : w < 1100 ? 1.1 : 1.55)
      onScroll()
    }
    onResize()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      cancelled = true
      io.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const live = tier === 'low' || tier === 'high'
  return (
    <div ref={root} className={styles.scene} data-ready={ready || undefined}>
      {live && (
        <HeroCanvas
          className={styles.canvas}
          tier={tier}
          running={running}
          still={still}
          progress={progress}
          shift={shift}
          onReady={() => setReady(true)}
        />
      )}
    </div>
  )
}
