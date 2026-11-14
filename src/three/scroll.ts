import type Lenis from 'lenis'

/**
 * Shared scroll state. Lenis (smooth scroll) is created once by <SmoothScroll /> in the site
 * layout; everything else asks for it here, so links, the command palette and the 3D hero
 * move the page the same way. Without Lenis (reduced motion) the native scroll is used.
 */

let lenis: Lenis | null = null

export function setLenis(instance: Lenis | null) {
  lenis = instance
}

export function getLenis(): Lenis | null {
  return lenis
}

/** Scroll to a y offset or an element. Smooth with Lenis, native otherwise. */
export function scrollToTarget(target: number | HTMLElement, options: { immediate?: boolean } = {}) {
  if (lenis) {
    lenis.scrollTo(target, { immediate: options.immediate, duration: 1.2 })
    return
  }
  const top =
    typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top, behavior: options.immediate || reduce ? 'auto' : 'smooth' })
}

/**
 * The hero's scroll progress, 0 at its top and 1 where it lets go. Written by the hero stage
 * (smoothed), read by the 3D scene inside its frame loop — kept outside React so scrolling
 * never re-renders anything.
 */
export const deskProgress = {
  /** Raw progress from the scroll position. */
  target: 0,
  /** Damped progress everything animates by. */
  value: 0,
}
