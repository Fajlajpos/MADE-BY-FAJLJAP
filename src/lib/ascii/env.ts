/**
 * Browser helpers shared by every character field: the lazily loaded asciify kit, theme tokens
 * read from CSS, the mono family next/font generated, and the visitor's motion preference.
 */

type Kit = typeof import('asciify-engine/kit')

let kitPromise: Promise<Kit | null> | null = null

/** asciify-engine/kit, loaded once on first use so it never weighs on the first paint. */
export function loadKit(): Promise<Kit | null> {
  kitPromise ??= import('asciify-engine/kit').catch((error: unknown) => {
    console.warn('[ascii] kit failed to load, using the CPU renderer', error)
    return null
  })
  return kitPromise
}

/** The glyph ramps. Pure ASCII, so the self-hosted subset of Martian Mono draws every one. */
export const RAMP = ' .:-=+*#%@'
export const RAMP_QUIET = ' .:+*#'
export const SCRAMBLE_GLYPHS = '#%*+=-:./\\|<>[]{}01'

/**
 * Moving the cursor leaves no trail in the character fields (the wordmark, media slots and
 * shapes): they keep their own motion and only the shapes lean toward the cursor.
 */
export const NO_TRAIL = { hover: 'none' } as const

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** A CSS custom property resolved to a colour string, read from `from` (default <html>). */
export function readToken(name: string, from: Element = document.documentElement): string {
  return getComputedStyle(from).getPropertyValue(name).trim()
}

/** The Martian Mono family list next/font generated (e.g. "'Martian Mono', 'Martian Mono Fallback'"). */
export function monoFamily(): string {
  return readToken('--font-martian') || 'ui-monospace, monospace'
}

/** Calls `onChange` whenever the print colour (html[data-spot]) changes. Returns the cleanup. */
export function onSpotChange(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-spot'] })
  return () => observer.disconnect()
}
