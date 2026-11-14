import { Path, Shape } from 'three'

/**
 * A handful of letters drawn by hand for the chrome pieces (there is no font in three.js, and
 * none is downloaded). Cap height 1, baseline 0. They borrow the display face's manners: thick
 * stems and thin hairlines, wedge serifs with a small bracket, a beak on the arms.
 * Each glyph is one or more outlines (overlaps are fine — they are extruded as solids).
 */

export type Glyph = { shapes: Shape[]; width: number }

type Pt = [number, number]

const poly = (pts: Pt[], holes: Pt[][] = []): Shape => {
  const s = new Shape()
  pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)))
  s.closePath()
  for (const h of holes) {
    const p = new Path()
    h.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y)))
    p.closePath()
    s.holes.push(p)
  }
  return s
}

/** Serif height and the bracket that joins it to the stem. */
const SERIF = 0.06
const BRACKET = 0.035

function F(): Glyph {
  return {
    width: 0.8,
    shapes: [
      poly([
        [0, 0], [0.42, 0], [0.42, BRACKET], [0.31, SERIF], [0.28, 0.1],
        [0.28, 0.45], [0.55, 0.45], [0.6, 0.36], [0.635, 0.36], [0.635, 0.64], [0.6, 0.64], [0.55, 0.545],
        [0.28, 0.545], [0.28, 0.915], [0.66, 0.915], [0.76, 0.69], [0.8, 0.69], [0.8, 1],
        [0, 1], [0, 1 - BRACKET], [0.06, 1 - SERIF - 0.01], [0.06, SERIF + 0.01], [0, BRACKET],
      ]),
    ],
  }
}

function A(): Glyph {
  // thin left leg, thick right leg (stress of a broad pen), pointed counter
  const k = 0.32 / 0.94
  const lo = (y: number) => 0.1 + k * (y - 0.06)
  const li = (y: number) => 0.18 + k * (y - 0.06)
  const ri = (y: number) => 0.68 - k * (y - 0.06)
  const ro = (y: number) => 0.88 - k * (y - 0.06)
  const bar0 = 0.3
  const bar1 = 0.37
  const apexY = 0.06 + (0.68 - 0.18) / (2 * k)
  return {
    width: 0.98,
    shapes: [
      poly(
        [
          [0, 0], [0.3, 0], [0.3, BRACKET], [0.22, 0.05], [li(0.1), 0.1],
          [li(bar0), bar0], [ri(bar0), bar0],
          [ri(0.1), 0.1], [0.65, 0.05], [0.58, BRACKET], [0.58, 0], [0.98, 0], [0.98, BRACKET], [0.91, 0.05], [ro(0.1), 0.1],
          [0.56, 1], [0.42, 1],
          [lo(0.1), 0.1], [0.08, 0.05], [0, BRACKET],
        ],
        [[[li(bar1), bar1], [ri(bar1), bar1], [li(apexY), apexY]]],
      ),
    ],
  }
}

function J(): Glyph {
  // a stem that hooks under the baseline and ends in a ball
  const s = new Shape()
  s.moveTo(0.14, 1)
  s.lineTo(0.74, 1)
  s.lineTo(0.74, 1 - BRACKET)
  s.lineTo(0.58, 0.94)
  s.lineTo(0.54, 0.9)
  s.lineTo(0.54, 0.14)
  s.bezierCurveTo(0.54, -0.07, 0.4, -0.17, 0.22, -0.17)
  s.bezierCurveTo(0.07, -0.17, -0.04, -0.09, -0.04, 0.03)
  s.bezierCurveTo(-0.04, 0.12, 0.02, 0.18, 0.1, 0.18)
  s.bezierCurveTo(0.18, 0.18, 0.22, 0.12, 0.22, 0.07)
  s.bezierCurveTo(0.22, 0.03, 0.2, 0.0, 0.18, -0.02)
  s.bezierCurveTo(0.26, -0.07, 0.32, -0.02, 0.32, 0.1)
  s.lineTo(0.32, 0.9)
  s.lineTo(0.28, 0.94)
  s.lineTo(0.14, 1 - BRACKET)
  s.closePath()
  return { width: 0.74, shapes: [s] }
}

function L(): Glyph {
  return {
    width: 0.8,
    shapes: [
      poly([
        [0, 0], [0.76, 0], [0.8, 0.31], [0.76, 0.31], [0.65, 0.085],
        [0.28, 0.085], [0.28, 0.9], [0.31, 0.94], [0.42, 1 - BRACKET], [0.42, 1],
        [0, 1], [0, 1 - BRACKET], [0.06, 1 - SERIF - 0.01], [0.06, SERIF + 0.01], [0, BRACKET],
      ]),
    ],
  }
}

function P(): Glyph {
  const s = new Shape()
  s.moveTo(0, 0)
  s.lineTo(0.42, 0)
  s.lineTo(0.42, BRACKET)
  s.lineTo(0.31, SERIF)
  s.lineTo(0.28, 0.1)
  s.lineTo(0.28, 0.42)
  s.lineTo(0.47, 0.42)
  s.bezierCurveTo(0.7, 0.42, 0.81, 0.54, 0.81, 0.71)
  s.bezierCurveTo(0.81, 0.88, 0.7, 1, 0.47, 1)
  s.lineTo(0, 1)
  s.lineTo(0, 1 - BRACKET)
  s.lineTo(0.06, 1 - SERIF - 0.01)
  s.lineTo(0.06, SERIF + 0.01)
  s.lineTo(0, BRACKET)
  s.closePath()
  const bowl = new Path()
  bowl.moveTo(0.28, 0.495)
  bowl.lineTo(0.44, 0.495)
  bowl.bezierCurveTo(0.56, 0.495, 0.61, 0.58, 0.61, 0.71)
  bowl.bezierCurveTo(0.61, 0.84, 0.56, 0.925, 0.44, 0.925)
  bowl.lineTo(0.28, 0.925)
  bowl.closePath()
  s.holes.push(bowl)
  return { width: 0.81, shapes: [s] }
}

function K(): Glyph {
  return {
    width: 0.94,
    shapes: [
      // stem
      poly([
        [0, 0], [0.4, 0], [0.4, BRACKET], [0.3, SERIF], [0.27, 0.1], [0.27, 0.9], [0.3, 0.94], [0.4, 1 - BRACKET], [0.4, 1],
        [0, 1], [0, 1 - BRACKET], [0.06, 1 - SERIF - 0.01], [0.06, SERIF + 0.01], [0, BRACKET],
      ]),
      // the thin arm up to the right, with its serif
      poly([[0.25, 0.36], [0.31, 0.36], [0.76, 0.965], [0.68, 0.965]]),
      poly([[0.56, 0.965], [0.88, 0.965], [0.88, 1], [0.56, 1]]),
      // the thick leg down to the right, with its serif
      poly([[0.3, 0.55], [0.43, 0.63], [0.88, BRACKET], [0.65, BRACKET]]),
      poly([[0.58, 0], [0.94, 0], [0.94, BRACKET], [0.58, BRACKET]]),
    ],
  }
}

function cHacek(): Glyph {
  // lowercase c (x-height 0.62) with a háček
  const cx = 0.31
  const cy = 0.31
  const s = new Shape()
  const a0 = 0.62
  const a1 = Math.PI * 2 - 0.55
  s.absellipse(cx, cy, 0.31, 0.32, a0, a1, false, 0)
  s.absellipse(cx + 0.03, cy, 0.19, 0.25, a1 - 0.08, a0 + 0.12, true, 0)
  s.closePath()
  // ball on the upper terminal
  const ball = new Shape()
  ball.absarc(0.5, 0.47, 0.08, 0, Math.PI * 2, false)
  const hacek = poly([[0.08, 0.84], [0.2, 0.84], [0.29, 0.73], [0.38, 0.84], [0.5, 0.84], [0.33, 0.67], [0.25, 0.67]])
  return { width: 0.62, shapes: [s, ball, hacek] }
}

const GLYPHS: Record<string, () => Glyph> = { F, A, J, L, P, K, č: cHacek }

/** Lays the letters of `text` out on the baseline; `gap` is the space between letters. */
export function setText(text: string, gap = 0.09): { glyphs: { glyph: Glyph; x: number }[]; width: number } {
  let x = 0
  const glyphs: { glyph: Glyph; x: number }[] = []
  for (const ch of text) {
    const make = GLYPHS[ch]
    if (!make) {
      x += 0.4
      continue
    }
    const glyph = make()
    glyphs.push({ glyph, x })
    x += glyph.width + gap
  }
  return { glyphs, width: Math.max(0, x - gap) }
}
