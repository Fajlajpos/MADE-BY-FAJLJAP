'use client'

import { useEffect, useRef } from 'react'
import { scramble } from '@/lib/ascii/scramble'

type Props = {
  text: string
  className?: string
  /** Also scramble once when it first scrolls into view. */
  onView?: boolean
  /** Scramble once on mount, after `delay` ms (a menu re-keys its list to replay it). */
  autoplay?: boolean
  delay?: number
}

/**
 * Text that rolls through characters when its link or button is hovered or focused.
 * The animated copy is aria-hidden; screen readers get the real text once.
 */
export function Scramble({ text, className, onView = false, autoplay = false, delay = 0 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const trigger = el.closest<HTMLElement>('a, button, [data-scramble-trigger]') ?? el
    const play = () => scramble(el, text)
    trigger.addEventListener('pointerenter', play)
    trigger.addEventListener('focus', play)

    let io: IntersectionObserver | undefined
    if (onView) {
      io = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting) return
        play()
        io?.disconnect()
      })
      io.observe(el)
    }
    const timer = autoplay ? window.setTimeout(() => scramble(el, text, 600), delay) : 0
    return () => {
      trigger.removeEventListener('pointerenter', play)
      trigger.removeEventListener('focus', play)
      io?.disconnect()
      window.clearTimeout(timer)
    }
  }, [text, onView, autoplay, delay])

  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true">
        {text}
      </span>
      <span className="visually-hidden">{text}</span>
    </span>
  )
}
