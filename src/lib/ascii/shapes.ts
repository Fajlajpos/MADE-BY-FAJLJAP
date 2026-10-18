/**
 * Solid shapes for the character fields: a torus, a sphere, a cube, a ring and a rolling wave,
 * and four objects from the trade — </>, { }, a vector pen nib and a cursor — extruded from a
 * flat drawing. Lit from the top front and drawn into a small canvas as grey (brightness =
 * glyph density).
 * Points are sampled on the surface, rotated, projected with a z-buffer — the donut.c way.
 * They turn on their own and lean toward the cursor.
 */

import { monoFamily } from './env'
import { clamp } from './paint'
import type { Pointer, ScenePainter } from './scenes'

type ModelKind = 'code' | 'braces' | 'pen' | 'cursor'
export type ShapeKind = 'torus' | 'sphere' | 'cube' | 'ring' | 'wave' | ModelKind

const MODELS: ModelKind[] = ['code', 'braces', 'pen', 'cursor']

/** The flat drawings the objects are extruded from, on a 100 × 100 square. */
const DRAWINGS: Record<ModelKind, (ctx: CanvasRenderingContext2D) => void> = {
  code: (ctx) => glyphs(ctx, '</>'),
  braces: (ctx) => glyphs(ctx, '{}'),
  pen: (ctx) => {
    // a vector pen nib: the body, the breather hole and the slit
    const nib = new Path2D('M50 4 L82 52 L66 96 L34 96 L18 52 Z')
    ctx.fill(nib)
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(50, 58, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(48, 4, 4, 50)
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillRect(30, 88, 40, 8)
  },
  cursor: (ctx) => {
    ctx.fill(new Path2D('M24 4 L24 84 L42 67 L55 96 L68 90 L55 62 L80 62 Z'))
  },
}

function glyphs(ctx: CanvasRenderingContext2D, text: string) {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  let size = 70
  ctx.font = `800 ${size}px ${monoFamily()}`
  const width = ctx.measureText(text).width
  if (width > 96) size *= 96 / width
  ctx.font = `800 ${size}px ${monoFamily()}`
  ctx.fillText(text, 50, 52)
}

type Mask = { n: number; on: Uint8Array }
const masks = new Map<string, Mask>()

/** The drawing rasterised to an n × n grid of filled cells, once per size. */
function maskFor(kind: ModelKind, n: number): Mask {
  const key = `${kind}:${n}`
  const cached = masks.get(key)
  if (cached) return cached
  const canvas = document.createElement('canvas')
  canvas.width = n
  canvas.height = n
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  const on = new Uint8Array(n * n)
  if (ctx) {
    ctx.scale(n / 100, n / 100)
    ctx.fillStyle = '#fff'
    DRAWINGS[kind](ctx)
    const px = ctx.getImageData(0, 0, n, n).data
    for (let i = 0; i < n * n; i++) on[i] = px[i * 4 + 3]! > 110 ? 1 : 0
  }
  const mask = { n, on }
  masks.set(key, mask)
  return mask
}

/** Front and back faces from every filled cell, side walls along every edge, as a die-cut block. */
function extrude(kind: ModelKind): Sample {
  return (emit, d) => {
    const n = Math.max(24, Math.round(d * 0.95))
    const { on } = maskFor(kind, n)
    const S = 2.8
    const step = S / n
    const depth = 0.34
    const filled = (i: number, j: number) =>
      i >= 0 && j >= 0 && i < n && j < n && on[j * n + i] === 1
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        if (!filled(i, j)) continue
        const x = (i + 0.5) * step - S / 2
        const y = S / 2 - (j + 0.5) * step
        emit(x, y, -depth, 0, 0, -1)
        emit(x, y, depth, 0, 0, 1)
        let nx = 0
        let ny = 0
        if (!filled(i - 1, j)) nx -= 1
        if (!filled(i + 1, j)) nx += 1
        if (!filled(i, j - 1)) ny += 1
        if (!filled(i, j + 1)) ny -= 1
        if (nx === 0 && ny === 0) continue
        const len = Math.hypot(nx, ny)
        for (let z = -depth; z <= depth; z += step) emit(x, y, z, nx / len, ny / len, 0)
      }
    }
  }
}

type Sample = (
  emit: (x: number, y: number, z: number, nx: number, ny: number, nz: number) => void,
  density: number,
  t: number,
) => void

const SURFACES: Record<ShapeKind, { extent: number; sample: Sample }> = {
  torus: {
    extent: 3,
    sample(emit, d) {
      const R1 = 1
      const R2 = 2
      const ts = Math.round(d * 0.7)
      const ps = Math.round(d * 2)
      for (let i = 0; i < ts; i++) {
        const th = (i / ts) * Math.PI * 2
        const ct = Math.cos(th)
        const st = Math.sin(th)
        for (let j = 0; j < ps; j++) {
          const ph = (j / ps) * Math.PI * 2
          const cp = Math.cos(ph)
          const sp = Math.sin(ph)
          const r = R2 + R1 * ct
          emit(r * cp, R1 * st, -r * sp, ct * cp, st, -ct * sp)
        }
      }
    },
  },
  ring: {
    extent: 2.7,
    sample(emit, d) {
      const R1 = 0.32
      const R2 = 2.35
      const ts = Math.round(d * 0.25)
      const ps = Math.round(d * 2.6)
      for (let i = 0; i < ts; i++) {
        const th = (i / ts) * Math.PI * 2
        const ct = Math.cos(th)
        const st = Math.sin(th)
        for (let j = 0; j < ps; j++) {
          const ph = (j / ps) * Math.PI * 2
          const r = R2 + R1 * ct
          emit(
            r * Math.cos(ph),
            R1 * st,
            -r * Math.sin(ph),
            ct * Math.cos(ph),
            st,
            -ct * Math.sin(ph),
          )
        }
      }
    },
  },
  sphere: {
    extent: 2.4,
    sample(emit, d) {
      const R = 2.4
      const ts = Math.round(d * 1.1)
      const ps = Math.round(d * 2.2)
      for (let i = 1; i < ts; i++) {
        const th = (i / ts) * Math.PI
        const s = Math.sin(th)
        const c = Math.cos(th)
        // fewer points near the poles, where the rings are short
        const ring = Math.max(6, Math.round(ps * s))
        for (let j = 0; j < ring; j++) {
          const ph = (j / ring) * Math.PI * 2
          const nx = s * Math.cos(ph)
          const nz = s * Math.sin(ph)
          emit(R * nx, R * c, R * nz, nx, c, nz)
        }
      }
    },
  },
  cube: {
    extent: 2.6,
    sample(emit, d) {
      const H = 1.6
      const n = Math.round(d * 0.55)
      for (let i = 0; i <= n; i++) {
        const u = (i / n) * 2 - 1
        for (let j = 0; j <= n; j++) {
          const v = (j / n) * 2 - 1
          emit(H, u * H, v * H, 1, 0, 0)
          emit(-H, u * H, v * H, -1, 0, 0)
          emit(u * H, H, v * H, 0, 1, 0)
          emit(u * H, -H, v * H, 0, -1, 0)
          emit(u * H, v * H, H, 0, 0, 1)
          emit(u * H, v * H, -H, 0, 0, -1)
        }
      }
    },
  },
  code: { extent: 1.7, sample: extrude('code') },
  braces: { extent: 1.7, sample: extrude('braces') },
  pen: { extent: 1.7, sample: extrude('pen') },
  cursor: { extent: 1.7, sample: extrude('cursor') },
  wave: {
    extent: 3.2,
    sample(emit, d, t) {
      const n = Math.round(d * 1.3)
      const S = 2.8
      for (let i = 0; i <= n; i++) {
        const x = (i / n) * 2 * S - S
        for (let j = 0; j <= n; j++) {
          const z = (j / n) * 2 * S - S
          const a = 1.5 * x + t * 1.1
          const b = 1.3 * z + t * 0.9
          const y = 0.42 * Math.sin(a) * Math.cos(b)
          const dx = 0.42 * 1.5 * Math.cos(a) * Math.cos(b)
          const dz = -0.42 * 1.3 * Math.sin(a) * Math.sin(b)
          const len = Math.hypot(dx, 1, dz)
          emit(x, y, z, -dx / len, 1 / len, -dz / len)
        }
      }
    },
  },
}

export function createShape(kind: ShapeKind, seed = 0): ScenePainter {
  const surface = SURFACES[kind]
  const lean = { x: 0, y: 0 }
  let image: ImageData | null = null
  let zbuf = new Float32Array(0)
  // light from the top front left
  const L = [-0.35, 0.75, -0.56]
  const ll = Math.hypot(L[0]!, L[1]!, L[2]!)
  const lx = L[0]! / ll
  const ly = L[1]! / ll
  const lz = L[2]! / ll

  return (ctx, w, h, t, p: Pointer) => {
    if (!image || image.width !== w || image.height !== h) {
      image = ctx.createImageData(w, h)
      zbuf = new Float32Array(w * h)
    }
    const data = image.data
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0
      data[i + 1] = 0
      data[i + 2] = 0
      data[i + 3] = 255
    }
    zbuf.fill(0)

    // lean toward the cursor, eased
    lean.x += (clamp(p.x - 0.5, -1, 1) - lean.x) * 0.05
    lean.y += (clamp(p.y - 0.5, -1, 1) - lean.y) * 0.05
    const tt = t + seed * 7
    // objects turn around their upright axis and rock a little; solids tumble; the wave lies flat
    const model = MODELS.includes(kind as ModelKind)
    const A =
      kind === 'wave'
        ? -0.95 + lean.y * 0.4
        : model
          ? 0.28 * Math.sin(tt * 0.45) + lean.y * 0.9
          : tt * 0.55 + lean.y * 1.2
    const B =
      kind === 'wave'
        ? tt * 0.12 + lean.x * 0.6
        : model
          ? tt * 0.6 + lean.x * 1.6
          : tt * 0.32 + lean.x * 1.4
    const cA = Math.cos(A)
    const sA = Math.sin(A)
    const cB = Math.cos(B)
    const sB = Math.sin(B)

    const size = Math.min(w, h)
    const K2 = surface.extent * 2.6
    const K1 = (size * K2 * 0.4) / surface.extent
    const cx = w / 2
    const cy = h / 2

    const emit = (x: number, y: number, z: number, nx: number, ny: number, nz: number) => {
      // rotate around Y (B), then around X (A)
      const x1 = x * cB + z * sB
      const z1 = -x * sB + z * cB
      const y2 = y * cA - z1 * sA
      const z2 = y * sA + z1 * cA
      const nx1 = nx * cB + nz * sB
      const nz1 = -nx * sB + nz * cB
      const ny2 = ny * cA - nz1 * sA
      const nz2 = ny * sA + nz1 * cA

      const ooz = 1 / (K2 + z2)
      const px = (cx + K1 * ooz * x1) | 0
      const py = (cy - K1 * ooz * y2) | 0
      if (px < 0 || py < 0 || px >= w - 1 || py >= h) return
      const lum = nx1 * lx + ny2 * ly + nz2 * lz
      const v = lum > 0 ? 40 + lum * 215 : 16 + (1 + lum) * 24
      for (let k = 0; k < 2; k++) {
        const idx = py * w + px + k
        if (ooz > zbuf[idx]!) {
          zbuf[idx] = ooz
          const o = idx * 4
          data[o] = v
          data[o + 1] = v
          data[o + 2] = v
        }
      }
    }

    surface.sample(emit, size, tt)
    ctx.putImageData(image, 0, 0)
  }
}
