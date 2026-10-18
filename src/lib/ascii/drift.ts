/**
 * The page's ground: a field of characters printed onto the page itself. The pattern comes from
 * seeded noise at each cell's position on the page, so it is the same on every load and stays
 * where it is printed. Each section has its own variety of the pattern and the varieties blend
 * across section borders. Ground.tsx draws it on canvases that scroll with the page.
 */

/** The varieties of the ground, one per section (`data-ground` on the section). */
export type GroundStyle = 'smear' | 'lobes' | 'contour' | 'diagonal' | 'rain' | 'rings'

export type GroundSpan = { top: number; bottom: number; style: GroundStyle }

const fract = (v: number) => v - Math.floor(v)

/** The kit's hash: stable, so the same cell always gets the same value. */
function hash(x: number, y: number) {
  let px = fract(x * 123.34)
  let py = fract(y * 456.21)
  const d = px * (px + 45.32) + py * (py + 45.32)
  px += d
  py += d
  return fract(px * py)
}

function noise(x: number, y: number) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)
  const a = hash(ix, iy)
  const b = hash(ix + 1, iy)
  const c = hash(ix, iy + 1)
  const d = hash(ix + 1, iy + 1)
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy
}

function fbm(x: number, y: number) {
  let v = 0
  let a = 0.5
  for (let i = 0; i < 5; i++) {
    v += a * noise(x, y)
    x = x * 2.03 + 1.7
    y = y * 2.03 + 9.2
    a *= 0.5
  }
  return v
}

const smooth = (a: number, b: number, v: number) => {
  const k = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return k * k * (3 - 2 * k)
}

/** The kit's Drift, frozen: two warping fbm fields, then one more. */
function lobes(x: number, y: number, s = 1.15) {
  const qx = x * s
  const qy = y * s
  const wx = fbm(qx * 0.7, qy * 0.7)
  const wy = fbm(qx * 0.7 + 4.3, qy * 0.7 + 1.7)
  return fbm(qx + wx * 1.3, qy + wy * 1.3)
}

/** The section a point lies in, in viewport heights, and the viewport's width in the same unit. */
type Place = { top: number; bottom: number; aspect: number }

/** Each variety returns a density 0–1 for a point on the page (in viewport heights). */
const STYLES: Record<GroundStyle, (x: number, y: number, at: Place) => number> = {
  // hero: the asciify hero — full drifting lobes with a fine grain in them, densest along the
  // edges and thinning softly round the name, so it frames the opening instead of covering it
  smear: (x, y, at) => {
    const n = lobes(x, y, 1.05)
    const grain = fbm(x * 11, y * 11)
    const field = smooth(0.24, 0.64, n * 0.82 + grain * 0.28)
    const wide = at.aspect > 1
    const cx = at.aspect * (wide ? 0.34 : 0.5)
    const rx = at.aspect * (wide ? 0.42 : 0.62)
    const cy = at.top + (at.bottom - at.top) * 0.4
    const ry = (at.bottom - at.top) * 0.42
    const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
    const frame = 0.12 + 0.88 * smooth(0.45, 1.45, d)
    return Math.min(1, field * frame * 1.4)
  },
  // the kit's drift: broad soft lobes
  lobes: (x, y) => smooth(0.38, 0.76, lobes(x, y)),
  // survey lines over a gentle terrain
  contour: (x, y) => {
    const n = lobes(x, y, 0.9)
    const line = 1 - smooth(0.035, 0.09, Math.abs(fract(n * 7) - 0.5) * 0.5)
    return Math.max(smooth(0.5, 0.8, n) * 0.55, line * smooth(0.25, 0.45, n) * 0.9)
  },
  // the same lobes combed along a diagonal
  diagonal: (x, y) => {
    const u = x * 0.82 + y * 0.57
    const v = -x * 0.57 + y * 0.82
    return smooth(0.4, 0.76, lobes(u * 0.45, v * 1.9, 1.2))
  },
  // streaks falling down the page
  rain: (x, y) => smooth(0.44, 0.8, lobes(x * 2.6, y * 0.32, 1.1)),
  // rings opening from the middle of the section, broken by the lobes
  rings: (x, y, at) => {
    const r = Math.hypot(x - 0.9, y - (at.top + at.bottom) / 2)
    const ring = smooth(0.55, 0.95, 0.5 + 0.5 * Math.sin(r * 22))
    return ring * smooth(0.3, 0.6, lobes(x, y)) * smooth(0.05, 0.35, r)
  },
}

/** The ceiling: the ground stops below the heaviest glyphs, those stay for the content. */
export const PEAK = 0.78

export type PrintLayout = {
  /** Character cell in CSS px. */
  cellW: number
  cellH: number
  /** Columns across the page. */
  cols: number
  /** Viewport height and width in CSS px: the height is one unit of the pattern. */
  unit: number
  width: number
  /** Section spans in page px, in order. */
  spans: GroundSpan[]
}

function density(x: number, yPx: number, l: PrintLayout) {
  const { spans, unit } = l
  const aspect = l.width / unit
  if (spans.length === 0) return STYLES.lobes(x, yPx / unit, { top: 0, bottom: 1, aspect })
  const zone = unit * 0.35
  let sum = 0
  let weight = 0
  for (const s of spans) {
    const first = s === spans[0]
    const last = s === spans[spans.length - 1]
    const win =
      (first ? 1 : smooth(s.top - zone, s.top + zone, yPx)) *
      (last ? 1 : 1 - smooth(s.bottom - zone, s.bottom + zone, yPx))
    if (win <= 0.001) continue
    const at = { top: s.top / unit, bottom: s.bottom / unit, aspect }
    sum += win * STYLES[s.style](x, yPx / unit, at)
    weight += win
  }
  return weight > 0 ? sum / weight : 0
}

/** One page row's densities, from its position on the page alone (pure: runs in a worker too). */
export function printRow(l: PrintLayout, row: number, out = new Float32Array(l.cols)) {
  const yPx = (row + 0.5) * l.cellH
  for (let c = 0; c < l.cols; c++) out[c] = density(((c + 0.5) * l.cellW) / l.unit, yPx, l)
  return out
}

/** Everything that shapes the pattern; rows printed under the same key stay valid. */
export function layoutKey(l: PrintLayout) {
  return [l.cols, l.cellW.toFixed(3), l.cellH, l.unit, l.width].join(':')
}

/**
 * The first page row a change of sections can reach: rows above it keep their pattern (the
 * sections above did not move), rows from it down are printed again. -1 when nothing changed.
 */
export function firstChangedRow(prev: GroundSpan[], next: GroundSpan[], l: PrintLayout) {
  const n = Math.max(prev.length, next.length)
  for (let i = 0; i < n; i++) {
    const a = prev[i]
    const b = next[i]
    if (
      a &&
      b &&
      a.style === b.style &&
      Math.round(a.top) === Math.round(b.top) &&
      Math.round(a.bottom) === Math.round(b.bottom)
    )
      continue
    // a span's style and the blend zone above its top reach back 0.35 of a unit
    const top = Math.min(a?.top ?? Infinity, b?.top ?? Infinity) - l.unit * 0.35
    return Math.max(0, Math.floor(top / l.cellH))
  }
  return -1
}

/** A stable per-cell value 0–1, for each glyph's own shimmer phase. */
export const cellPhase = (col: number, row: number) => hash(col, row)
