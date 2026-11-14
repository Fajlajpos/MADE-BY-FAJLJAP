import { Color } from 'three'
import { readToken } from '@/lib/dom'

/**
 * The scenes' colours, read from tokens.css so that file stays the only place they live.
 */

const TOKENS = {
  night: ['--scene-night', '#080a10'],
  wall: ['--scene-wall', '#1a1d24'],
  wood: ['--scene-wood', '#4a3426'],
  lamp: ['--scene-lamp', '#ffa24c'],
  screen: ['--scene-screen', '#bcd4ff'],
  sodium: ['--scene-sodium', '#ff7a1f'],
  sky: ['--scene-sky', '#0e1830'],
  windowWarm: ['--scene-window-warm', '#ffb46a'],
  windowCold: ['--scene-window-cold', '#a9c8ff'],
  paint: ['--scene-paint', '#2f3d33'],
  cardboard: ['--scene-cardboard', '#a77d52'],
  // the site's two fluo inks, the white ink, the black stock and the cursor lamp
  orange: ['--c-orange', '#ff7a2f'],
  blue: ['--c-blue', '#3d9be9'],
  blueDeep: ['--c-blue-deep', '#0d4f86'],
  /** The second light of the night desk; the same blue ink (the token was --c-ultra before). */
  ultra: ['--c-blue', '#3d9be9'],
  ink: ['--c-ink', '#ece6da'],
  paper: ['--c-paper', '#08080a'],
  cursorLamp: ['--c-lamp', '#ffb067'],
} as const

export type PaletteKey = keyof typeof TOKENS
export type ScenePalette = Record<PaletteKey, Color>

/** A token as a CSS colour string, with a fallback (server, or a token that is not set). */
export function tokenColor(key: PaletteKey): string {
  const [name, fallback] = TOKENS[key]
  return readToken(name) || fallback
}

export function readPalette(): ScenePalette {
  const entries = (Object.keys(TOKENS) as PaletteKey[]).map((key) => [key, new Color(tokenColor(key))] as const)
  return Object.fromEntries(entries) as ScenePalette
}
