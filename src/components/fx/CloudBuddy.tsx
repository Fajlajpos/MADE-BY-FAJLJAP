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
      // a loose flight down the page, not a pattern: sometimes big beside a heading, sometimes it
      // crosses the screen to the other side, sometimes it slips off the edge and comes back later
      const heads = [...document.querySelectorAll<HTMLElement>('main > section:not(:first-child) h2')]
      const hy = (n: number) => (heads[n] ? heads[n]!.getBoundingClientRect().top + sy : sy + vh * (n + 1))
      const off = (right: boolean) => (right ? vw + 60 : -big - 60)
      const huge = Math.min(380, vw * 0.3)
      const plan: [number, (y: number) => Stop][] = [
        // 1st heading: comes in big on the right
        [hy(0) - vh * 0.3, (y) => ({ y, x: vw - big - edge, top: vh * 0.28 - big * 0.35, w: big })],
        // drifts across, small, to the left
        [hy(0) + vh * 0.5, (y) => ({ y, x: edge, top: vh * 0.6, w: small })],
        // off the left edge
        [hy(1) - vh * 0.2, (y) => ({ y, x: off(false), top: vh * 0.5, w: small })],
        // 3rd heading: back in from the right, really big
        [hy(2) - vh * 0.35, (y) => ({ y, x: vw - huge - edge, top: vh * 0.25 - huge * 0.3, w: huge })],
        // a lazy swing over to the left, middle size
        [hy(2) + vh * 0.6, (y) => ({ y, x: edge + 20, top: vh * 0.5, w: (big + small) / 2 })],
        // gone again
        [hy(3) - vh * 0.1, (y) => ({ y, x: off(false), top: vh * 0.4, w: small })],
        // 5th heading: on the left, big
        [hy(4) - vh * 0.3, (y) => ({ y, x: edge, top: vh * 0.3 - big * 0.35, w: big })],
        // crosses all the way to the right, shrinking
        [hy(4) + vh * 0.7, (y) => ({ y, x: vw - small - edge, top: vh * 0.65, w: small })],
        // last heading: grows on the right
        [hy(heads.length - 1) - vh * 0.3, (y) => ({ y, x: vw - big - edge, top: vh * 0.3 - big * 0.35, w: big })],
        // and away
        [hy(heads.length - 1) + vh * 0.5, (y) => ({ y, x: off(true), top: vh * 0.45, w: small })],
      ]
      let last = 0
      for (const [y, make] of plan) {
        if (y <= last) continue
        stops.push(make(y))
        last = y
      }
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
        src="/photos/cloud-me-v5.webp"
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
