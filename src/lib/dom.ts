/** Small browser helpers shared by components and the 3D scenes. */

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** A CSS custom property as a string, read from `from` (default <html>). */
export function readToken(name: string, from?: Element): string {
  if (typeof document === 'undefined') return ''
  return getComputedStyle(from ?? document.documentElement)
    .getPropertyValue(name)
    .trim()
}

/** The font-family list next/font generated for a `--font-*` variable, with a fallback. */
export function fontFamily(variable: string, fallback = 'sans-serif'): string {
  return readToken(variable) || fallback
}
