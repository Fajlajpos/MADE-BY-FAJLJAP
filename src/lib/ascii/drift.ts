/**
 * The page's ground: a field of characters printed onto the page itself. The pattern comes from
 * seeded noise at each cell's position on the page, so it is the same on every load, stays where
 * it is printed and scrolls with the content — new ground keeps arriving as you scroll. Each
 * section has its own variety of the pattern and the varieties blend across section borders.
 * The motion stays in place: glyphs shimmer and a slow swell of light passes through them.
 */

/** The varieties of the ground, one per section (`data-ground` on the section). */
export type GroundStyle = 'smear' | 'lobes' | 'contour' | 'diagonal' | 'rain' | 'rings'

export type GroundSpan = { top: number; bottom: number; style: GroundStyle }

export type GroundView = {
  /** Page row of the first source row (the canvas starts on a whole cell). */
  row0: number
  /** Character cell in CSS px. */
  cellW: number
  cellH: number
  /** Viewport height in CSS px: one unit of the pattern. */
  unit: number
  /** Section spans in page px, in order. */
  spans: GroundSpan[]
}

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

/**
 * Each variety returns a density 0–1 for a point on the page (in viewport heights), `cy` being
 * the middle of its section, for the rings.
 */
const STYLES: Record<GroundStyle, (x: number, y: number, cy: number) => number> = {
  // hero: the identity smeared sideways — long horizontal bands
  smear: (x, y) => {
    const bands = smooth(0.3, 0.66, lobes(x * 0.35, y * 2.2, 1.3))
    // thin streaks of light run through the bands, like a scan dragged sideways
    const streak = smooth(0.62, 0.8, lobes(x * 0.12, y * 6.5, 1.1)) * 0.6
    return Math.max(bands, streak)
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
  rings: (x, y, cy) => {
    const r = Math.hypot(x - 0.9, y - cy)
    const ring = smooth(0.55, 0.95, 0.5 + 0.5 * Math.sin(r * 22))
    return ring * smooth(0.3, 0.6, lobes(x, y)) * smooth(0.05, 0.35, r)
  },
}

/** The ceiling: the ground stops below the heaviest glyphs, those stay for the content. */
const PEAK = 0.78

export function createGround() {
  let image: ImageData | null = null
  /** Printed rows, keyed by page row: computed once, then only the shimmer changes. */
  const rows = new Map<number, Float32Array>()
  let key = ''

  const density = (x: number, yPx: number, view: GroundView) => {
    const { spans, unit } = view
    if (spans.length === 0) return STYLES.lobes(x, yPx / unit, 0)
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
      sum += win * STYLES[s.style](x, yPx / unit, (s.top + s.bottom) / 2 / unit)
      weight += win
    }
    return weight > 0 ? sum / weight : 0
  }

  return (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, view: GroundView) => {
    if (!image || image.width !== w || image.height !== h) image = ctx.createImageData(w, h)
    // a new width or a new layout reprints the page
    const k = `${w}:${view.cellW}:${view.unit}:${view.spans.map((s) => `${s.top | 0}-${s.style}`).join(',')}`
    if (k !== key) {
      rows.clear()
      key = k
    }
    const data = image.data

    for (let py = 0; py < h; py++) {
      const row = view.row0 + py
      let printed = rows.get(row)
      if (!printed) {
        printed = new Float32Array(w)
        const yPx = (row + 0.5) * view.cellH
        for (let px = 0; px < w; px++) {
          printed[px] = density(((px + 0.5) * view.cellW) / view.unit, yPx, view)
        }
        rows.set(row, printed)
      }
      // a slow swell of light travelling down the page, and each glyph shimmering on its own
      const swell = 0.88 + 0.12 * Math.sin(row * 0.11 - t * 0.55)
      for (let px = 0; px < w; px++) {
        const base = printed[px]!
        let level = 0
        if (base > 0.004) {
          const shimmer = 0.8 + 0.2 * Math.sin(t * 0.9 + hash(px, row) * 6.2832)
          level = Math.min(1, (base * PEAK + 0.03) * shimmer * swell)
        }
        const o = (py * w + px) * 4
        const g = level * 255
        data[o] = g
        data[o + 1] = g
        data[o + 2] = g
        data[o + 3] = 255
      }
    }
    ctx.putImageData(image, 0, 0)
  }
}
