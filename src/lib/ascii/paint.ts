/** Small canvas helpers shared by the scenes and the world. */

/** A cached offscreen canvas, rebuilt only when the size changes (get) or every frame (draw). */
export class Layer {
  private canvas: HTMLCanvasElement | null = null
  private key = ''

  private ensure(w: number, h: number) {
    const key = `${w}x${h}`
    this.canvas ??= document.createElement('canvas')
    const fresh = key !== this.key
    if (fresh) {
      this.canvas.width = w
      this.canvas.height = h
      this.key = key
    }
    return { canvas: this.canvas, fresh }
  }

  get(w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void): HTMLCanvasElement {
    const { canvas, fresh } = this.ensure(w, h)
    if (fresh) {
      const ctx = canvas.getContext('2d')
      if (ctx) paint(ctx)
    }
    return canvas
  }

  draw(w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void): HTMLCanvasElement {
    const { canvas } = this.ensure(w, h)
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, w, h)
      paint(ctx)
    }
    return canvas
  }
}

export type RGB = readonly [number, number, number]

export const rgba = ([r, g, b]: RGB, a = 1) => `rgba(${r | 0},${g | 0},${b | 0},${a})`

/** A soft radial light. `alpha` is the centre's opacity. */
export function glow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  alpha: number,
  color: RGB = [255, 255, 255],
) {
  const radius = Math.max(1, r)
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius)
  g.addColorStop(0, rgba(color, alpha))
  g.addColorStop(1, rgba(color, 0))
  ctx.fillStyle = g
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
}

export function almond(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  hw: number,
  hh: number,
) {
  ctx.beginPath()
  ctx.moveTo(cx - hw, cy)
  ctx.quadraticCurveTo(cx, cy - hh * 2, cx + hw, cy)
  ctx.quadraticCurveTo(cx, cy + hh * 2, cx - hw, cy)
  ctx.closePath()
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function smoothstep(a: number, b: number, v: number) {
  const t = clamp((v - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

/** mulberry32 — small seeded PRNG so every window and star keeps its place. */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
