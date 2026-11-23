'use client'

import { useEffect, useRef } from 'react'

type Stop = { y: number; x: number; top: number; w: number }

/**
 * The hero photo (me on the cloud) taking off: at the top of the page it sits exactly over its
 * place in the hero; scrolling, it detaches and travels down the page with you. At each section's
 * heading it grows and stands beside it (sides alternating), between sections it shrinks and
 * drifts along the edge, so it never sits over the text or the buttons. The hero's own image is
 * hidden while this one flies. Off under reduced motion (the hero photo then just stays put).
 */
export function CloudBuddy() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    const slot = document.querySelector<HTMLElement>('[data-cloud-slot]')
    if (!el || !slot || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    document.documentElement.dataset.cloudFlying = ''

    let stops: Stop[] = []
    const build = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const sy = window.scrollY
      const r = slot.getBoundingClientRect()
      const big = Math.min(300, vw * 0.24)
      const small = Math.min(150, vw * 0.13)
      const edge = 16
      // the start: exactly over the hero slot
      stops = [{ y: 0, x: r.left, top: r.top + sy, w: r.width }]
      // not every section: it shows up beside some headings and slips off the edge in between
      const heads = [...document.querySelectorAll<HTMLElement>('main > section:not(:first-child) h2')]
      const visits = heads.filter((_, i) => i % 2 === 1)
      visits.forEach((h, i) => {
        const hy = h.getBoundingClientRect().top + sy
        const right = i % 2 === 0
        const prev = stops[stops.length - 1]!
        // out of sight off the edge it will come in from
        stops.push({ y: (prev.y + hy - vh * 0.3) / 2, x: right ? vw + 60 : -big - 60, top: vh * 0.4, w: small })
        // in, big, beside the heading
        stops.push({ y: hy - vh * 0.3, x: right ? vw - big - edge : edge, top: vh * 0.3 - big * 0.35, w: big })
        // and away off the same edge
        stops.push({ y: hy + vh * 0.25, x: right ? vw + 60 : -big - 60, top: vh * 0.45, w: small })
      })
    }

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const ease = (t: number) => t * t * (3 - 2 * t)
    let raf = 0
    const update = () => {
      raf = 0
      const y = window.scrollY
      let i = 0
      while (i < stops.length - 1 && stops[i + 1]!.y <= y) i++
      const a = stops[i]!
      const b = stops[Math.min(i + 1, stops.length - 1)]!
      const t = b === a ? 0 : ease(Math.min(1, Math.max(0, (y - a.y) / (b.y - a.y))))
      // the first stop is in page coordinates (it scrolls with the hero); the others are on screen
      const aTop = i === 0 ? a.top - y : a.top
      const x = lerp(a.x, b.x, t)
      const top = lerp(aTop, b.top, t)
      const w = lerp(a.w, b.w, t)
      el.style.width = `${w.toFixed(1)}px`
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${top.toFixed(1)}px, 0)`
      el.style.opacity = '1'
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    const onResize = () => {
      build()
      onScroll()
    }
    build()
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    // the page settles (fonts, images): measure again
    const t = window.setTimeout(onResize, 1200)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      delete document.documentElement.dataset.cloudFlying
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{ position: 'fixed', left: 0, top: 0, zIndex: 30, width: 0, opacity: 0, pointerEvents: 'none', willChange: 'transform, width' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- the hero photo, flying */}
      <img
        src="/photos/cloud-me-v4.webp"
        alt=""
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          
          animation: 'cloudFloat 5s ease-in-out infinite',
        }}
      />
    </div>
  )
}
