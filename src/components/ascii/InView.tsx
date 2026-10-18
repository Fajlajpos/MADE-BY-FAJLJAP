'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { prefersReducedMotion } from '@/lib/ascii/env'

type Props = {
  className?: string
  children: ReactNode
  as?: 'div' | 'section'
}

/**
 * Sets data-view="armed" on mount when the block starts below the fold, then "shown" once it
 * scrolls in, so CSS can print its content in. Without JS or under reduced motion the attribute
 * never arms and everything simply shows.
 */
export function InView({ className, children, as: Tag = 'div' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
      el.dataset.view = 'shown'
      return
    }
    el.dataset.view = 'armed'
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        el.dataset.view = 'shown'
        io.disconnect()
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      el.dataset.view = 'shown'
    }
  }, [])

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
