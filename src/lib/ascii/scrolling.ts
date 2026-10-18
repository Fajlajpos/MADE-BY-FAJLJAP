/**
 * Is the page scrolling right now? While it is, the character fields hold their last frame and
 * let the browser move them: the scroll gets the whole frame budget, the shimmer resumes after.
 */

/** Quiet time after the last scroll event before the page counts as still. */
const SETTLE_MS = 140

let lastScroll = -Infinity
let listening = false

export function isScrolling(now = performance.now()): boolean {
  if (!listening && typeof window !== 'undefined') {
    listening = true
    window.addEventListener(
      'scroll',
      () => {
        lastScroll = performance.now()
      },
      { passive: true, capture: true },
    )
  }
  return now - lastScroll < SETTLE_MS
}
