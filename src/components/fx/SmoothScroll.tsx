'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { setLenis } from '@/three/scroll'
import 'lenis/dist/lenis.css'

/**
 * Smooth scroll for the whole site: Lenis, driven by GSAP's ticker so ScrollTrigger and Lenis
 * read the same frame. In-page anchors (#prace, #kontakt) glide too. Off under reduced motion,
 * where the page scrolls natively and nothing is pinned or scrubbed.
 */
export function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      autoRaf: false,
      anchors: { offset: -64 },
      lerp: 0.11,
      // the command palette and the mobile menu scroll on their own
      prevent: (node) => node.closest('[role="dialog"]') !== null,
    })
    setLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
    }
  }, [])
  return null
}
