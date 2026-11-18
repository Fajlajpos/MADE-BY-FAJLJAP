'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { useContent } from '@/content/client'
import { prefersReducedMotion } from '@/lib/dom'
import { typo } from '@/lib/typo/czech'
import { detectTier, type Tier } from '@/three/quality'
import styles from './Depth.module.css'

const DepthCanvas = dynamic(() => import('@/three/depth/DepthCanvas'), { ssr: false })

/**
 * Between what I do and how it goes: a tall section that holds the screen while you scroll and
 * flies you down a corridor of chrome. Three lines come and go on the way. Without 3D (or with
 * reduced motion) it is just the three lines on a dark backdrop.
 */
export function Depth() {
  const { depth } = useContent().home
  const root = useRef<HTMLElement>(null)
  const lines = useRef<(HTMLParagraphElement | null)[]>([])
  const progress = useRef(0)
  const [tier, setTier] = useState<Tier | null>(null)
  const [running, setRunning] = useState(false)
  const [ready, setReady] = useState(false)
  const [still] = useState(prefersReducedMotion)

  useEffect(() => {
    const id = window.setTimeout(() => setTier(detectTier()), 0)
    const el = root.current
    if (!el) return () => window.clearTimeout(id)
    const io = new IntersectionObserver(([e]) => setRunning(e?.isIntersecting ?? false), { rootMargin: '120px' })
    io.observe(el)
    let raf = 0
    const n = depth.lines.length
    const measure = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)))
      progress.current = p
      if (still) return
      // each line owns a third of the way: it fades in, holds, and fades out
      lines.current.forEach((line, i) => {
        if (!line) return
        const local = p * n - i
        const o = Math.max(0, Math.min(1, local * 4, (1 - local) * 4))
        line.style.opacity = o.toFixed(3)
        line.style.transform = `translate3d(0, ${((0.5 - local) * 40).toFixed(1)}px, 0)`
      })
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.clearTimeout(id)
      io.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [depth.lines.length, still])

  const live = tier === 'low' || tier === 'high'
  return (
    <section
      ref={root}
      className={styles.depth}
      aria-label={depth.label}
      data-still={still || undefined}
    >
      <div className={styles.sticky}>
        <div className={styles.scene} data-ready={ready || undefined}>
          {live && (
            <DepthCanvas
              className={styles.canvas}
              tier={tier}
              running={running}
              still={still}
              progress={progress}
              onReady={() => setReady(true)}
            />
          )}
        </div>
        <div className={styles.lines}>
          {depth.lines.map((line, i) => (
            <p
              key={line}
              ref={(el) => {
                lines.current[i] = el
              }}
              className={styles.line}
            >
              <span className={styles.num}>0{i + 1}</span>
              {typo(line)}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
