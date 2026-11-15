'use client'

import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/lib/dom'

/**
 * A screen recording of a live site, looping without sound. It loads nothing until it is near
 * the screen, plays only while visible, and with reduced motion stays on its poster.
 */
export function ShotVideo({ src, poster, label, className }: { src: string; poster: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [still] = useState(prefersReducedMotion)

  useEffect(() => {
    const v = ref.current
    if (!v || still) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          if (v.preload !== 'auto') v.preload = 'auto'
          void v.play().catch(() => undefined)
        } else v.pause()
      },
      { rootMargin: '200px 0px' },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [still])

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
    />
  )
}
