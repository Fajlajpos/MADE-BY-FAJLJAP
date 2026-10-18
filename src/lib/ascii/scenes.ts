/**
 * Generative scenes for the media slots, painted white-on-black into a small canvas. Brightness
 * becomes glyph density: the GPU field (asciify kit) or the CPU renderer turns every frame into
 * characters. Each scene is stateful (cached layers), so create one per slot.
 *
 *   bust    — a figure whose identity smears into horizontal bands (moodboard 2 + 3)
 *   facade  — a panel block at night, windows flicker, the base tears into stripes (5)
 *   eye     — an eye that follows the cursor, code running through the iris (1)
 *   desk    — a laptop at night: scrolling code, steam, a phone lighting up (6)
 *   ground  — slow drifting lobes, for section backgrounds
 */

import { almond, clamp, glow, Layer, rng } from './paint'

export type Pointer = {
  /** 0–1 across the element; may run outside that range when the cursor is elsewhere. */
  x: number
  y: number
  /** The cursor is over the element. */
  inside: boolean
}

export type ScenePainter = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  p: Pointer,
) => void

export type SceneVariant = 'bust' | 'facade' | 'eye' | 'desk' | 'ground'

type SceneOptions = { seed?: number; image?: HTMLImageElement | null }

export function createScene(variant: SceneVariant, options: SceneOptions = {}): ScenePainter {
  const seed = options.seed ?? 1
  if (options.image) return photo(options.image, seed)
  switch (variant) {
    case 'bust':
      return bust(seed)
    case 'facade':
      return facade(seed)
    case 'eye':
      return eye(seed)
    case 'desk':
      return desk(seed)
    default:
      return ground(seed)
  }
}

/** A word set large, its bands slipping sideways now and then. Used when the GPU wordmark is unavailable. */
export function createTextScene(text: string, family: string, weight = 800): ScenePainter {
  const layer = new Layer()
  return (ctx, w, h, t, p) => {
    const art = layer.get(w, h, (c) => {
      c.fillStyle = '#fff'
      c.textAlign = 'center'
      c.textBaseline = 'middle'
      let size = h * 0.92
      c.font = `${weight} ${size}px ${family}`
      const measured = c.measureText(text).width
      if (measured > w * 0.98) size *= (w * 0.98) / measured
      c.font = `${weight} ${size}px ${family}`
      c.fillText(text, w / 2, h * 0.54)
    })
    smearBands(ctx, art, w, h, t, p, { bands: 9, drift: 0.006, burst: 0.08, seed: 3 })
  }
}

/* ── scenes ──────────────────────────────────────────────────────────────── */

function bust(seed: number): ScenePainter {
  const layer = new Layer()
  return (ctx, w, h, t, p) => {
    const figure = layer.get(w, h, (c) => {
      const u = Math.min(w, h * 0.8)
      const light = c.createLinearGradient(w * 0.15, 0, w * 0.85, 0)
      light.addColorStop(0, '#f2f2f2')
      light.addColorStop(0.55, '#8a8a8a')
      light.addColorStop(1, '#1c1c1c')
      c.fillStyle = light
      // shoulders
      c.beginPath()
      c.ellipse(w * 0.5, h * 1.04, u * 0.5, h * 0.3, 0, 0, Math.PI * 2)
      c.fill()
      // neck
      c.fillRect(w * 0.5 - u * 0.075, h * 0.5, u * 0.15, h * 0.26)
      // head, a touch taller than wide, chin narrower
      c.beginPath()
      c.ellipse(w * 0.5, h * 0.36, u * 0.17, h * 0.21, 0, 0, Math.PI * 2)
      c.fill()
      // the screen's light on the cheek
      c.globalCompositeOperation = 'source-atop'
      glow(c, w * 0.3, h * 0.34, u * 0.3, 0.55)
      c.globalCompositeOperation = 'source-over'
      // eyes: two dark smudges, the identity that will smear
      c.fillStyle = 'rgba(0,0,0,0.6)'
      c.fillRect(w * 0.5 - u * 0.11, h * 0.335, u * 0.07, h * 0.03)
      c.fillRect(w * 0.5 + u * 0.04, h * 0.335, u * 0.07, h * 0.03)
    })

    glow(ctx, 0, h * 0.4, Math.max(w, h) * 0.8, 0.14)
    smearBands(ctx, figure, w, h, t, p, { bands: 30, drift: 0.012, burst: 0.12, seed })

    // a slow scan line, the copier's lamp
    const y = ((t * 0.07 + seed * 0.13) % 1.2) * h - h * 0.1
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.fillRect(0, y, w, Math.max(1, h * 0.03))
  }
}

function facade(seed: number): ScenePainter {
  const rand = rng(seed * 7919)
  const COLS = 7
  const ROWS = 11
  const phase = Array.from({ length: COLS * ROWS }, () => rand() * 100)
  const bias = Array.from({ length: COLS * ROWS }, () => rand())
  const stars = Array.from({ length: 24 }, () => [rand(), rand() * 0.18, rand()] as const)
  const frame = new Layer()

  return (ctx, w, h, t, p) => {
    const scene = frame.draw(w, h, (c) => {
      c.fillStyle = '#000'
      c.fillRect(0, 0, w, h)
      for (const [sx, sy, s] of stars) {
        const tw = 0.3 + 0.5 * Math.max(0, Math.sin(t * (0.8 + s) + s * 20))
        c.fillStyle = `rgba(255,255,255,${tw * 0.6})`
        c.fillRect(sx * w, sy * h, Math.max(1, w * 0.006), Math.max(1, h * 0.005))
      }

      const left = w * 0.1
      const right = w * 0.9
      const top = h * 0.14
      const bw = right - left
      const bh = h - top
      c.fillStyle = '#2a2a2a'
      c.fillRect(left, top, bw, bh)
      glow(c, w * 0.2, top, bw * 0.8, 0.1)

      const cw = bw / COLS
      const rh = bh / ROWS
      for (let r = 0; r < ROWS; r++) {
        // panel joints
        c.fillStyle = '#3d3d3d'
        c.fillRect(left, top + r * rh, bw, Math.max(1, rh * 0.06))
        for (let col = 0; col < COLS; col++) {
          const i = r * COLS + col
          const cx = left + col * cw + cw * 0.5
          const cy = top + r * rh + rh * 0.55
          const near = p.inside ? Math.hypot(cx / w - p.x, (cy / h - p.y) * 1.2) < 0.16 : false
          const flicker = Math.sin(t * 0.35 + phase[i]!) + Math.sin(t * 0.13 + phase[i]! * 1.7)
          const lit = near || flicker + bias[i]! * 1.6 > 1.55
          c.fillStyle = lit ? (bias[i]! > 0.8 ? '#ffffff' : '#c8c8c8') : '#070707'
          c.fillRect(cx - cw * 0.28, cy - rh * 0.26, cw * 0.56, rh * 0.48)
        }
      }
    })

    // the base of the block tears into horizontal stripes, stronger toward the ground
    const bands = 34
    const bandH = h / bands
    for (let i = 0; i < bands; i++) {
      const y = i * bandH
      const depth = Math.pow(i / bands, 3)
      const dx =
        depth * w * 0.14 * Math.sin(t * 0.55 + i * 0.9 + seed) +
        depth * w * 0.05 * Math.sin(t * 2.1 + i * 2.3)
      ctx.drawImage(scene, 0, y, w, bandH + 1, dx, y, w, bandH + 1)
    }
  }
}

function eye(seed: number): ScenePainter {
  const rand = rng(seed * 104729)
  const lines = Array.from({ length: 14 }, () => ({
    speed: 0.15 + rand() * 0.5,
    offset: rand(),
    dash: 0.08 + rand() * 0.22,
    gap: 0.05 + rand() * 0.12,
  }))
  const look = { x: 0.5, y: 0.5 }

  return (ctx, w, h, t, p) => {
    const cx = w * 0.5
    const cy = h * 0.5
    // look toward the cursor, eased
    const tx = clamp(p.x, -0.5, 1.5)
    const ty = clamp(p.y, -0.5, 1.5)
    look.x += (tx - look.x) * 0.08
    look.y += (ty - look.y) * 0.08

    // blink every ~5 s
    const cycle = (t + seed * 1.3) % 5.2
    const open = cycle < 0.22 ? Math.abs(cycle - 0.11) / 0.11 : 1
    const halfW = w * 0.44
    const halfH = Math.min(h * 0.4, w * 0.24) * Math.max(0.04, open)

    glow(ctx, cx, cy, w * 0.6, 0.1)

    ctx.save()
    almond(ctx, cx, cy, halfW, halfH)
    ctx.clip()
    const sclera = ctx.createRadialGradient(cx, cy, 0, cx, cy, halfW)
    sclera.addColorStop(0, '#7c7c7c')
    sclera.addColorStop(0.7, '#3c3c3c')
    sclera.addColorStop(1, '#101010')
    ctx.fillStyle = sclera
    ctx.fillRect(0, 0, w, h)

    const r = Math.min(w * 0.2, h * 0.36)
    const ix = cx + (look.x - 0.5) * w * 0.22
    const iy = cy + (look.y - 0.5) * h * 0.18
    // a dark iris with a bright limbal ring, so the code reads as light inside it
    const iris = ctx.createRadialGradient(ix, iy, r * 0.3, ix, iy, r)
    iris.addColorStop(0, '#1a1a1a')
    iris.addColorStop(0.82, '#2c2c2c')
    iris.addColorStop(0.92, '#e6e6e6')
    iris.addColorStop(1, '#5a5a5a')
    ctx.fillStyle = iris
    ctx.beginPath()
    ctx.arc(ix, iy, r, 0, Math.PI * 2)
    ctx.fill()

    // code reflected in the iris
    ctx.save()
    ctx.beginPath()
    ctx.arc(ix, iy, r * 0.84, 0, Math.PI * 2)
    ctx.clip()
    const lineH = (r * 2) / lines.length
    lines.forEach((line, i) => {
      const y = iy - r + i * lineH + lineH * 0.3
      const period = line.dash + line.gap
      let x = ix - r - ((t * line.speed + line.offset) % period) * r * 2
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      while (x < ix + r) {
        ctx.fillRect(x, y, line.dash * r * 2, Math.max(1, lineH * 0.45))
        x += period * r * 2
      }
    })
    ctx.restore()

    // pupil, wide enough to stay a clear dark hole between the code lines
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(ix, iy, r * (0.4 + 0.03 * Math.sin(t * 0.9)), 0, Math.PI * 2)
    ctx.fill()
    // the monitor, reflected
    ctx.fillStyle = '#fff'
    ctx.fillRect(ix - r * 0.55, iy - r * 0.6, r * 0.32, r * 0.22)
    ctx.restore()

    // lid line
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'
    ctx.lineWidth = Math.max(1, h * 0.012)
    almond(ctx, cx, cy, halfW, halfH)
    ctx.stroke()
  }
}

function desk(seed: number): ScenePainter {
  const rand = rng(seed * 15485863)
  const code = Array.from({ length: 40 }, () => [rand() * 0.15, 0.2 + rand() * 0.65] as const)

  return (ctx, w, h, t) => {
    glow(ctx, w * 0.45, h * 0.62, Math.max(w, h) * 0.7, 0.16)

    // screen
    const sx = w * 0.2
    const sy = h * 0.14
    const sw = w * 0.56
    const sh = h * 0.42
    ctx.fillStyle = '#d6d6d6'
    ctx.fillRect(sx, sy, sw, sh)
    glow(ctx, sx + sw / 2, sy + sh * 1.1, sw * 0.9, 0.35)

    // scrolling code
    ctx.save()
    ctx.beginPath()
    ctx.rect(sx + sw * 0.05, sy + sh * 0.08, sw * 0.9, sh * 0.84)
    ctx.clip()
    const lineH = sh / 12
    const scroll = (t * 0.9) % code.length
    for (let i = 0; i < 16; i++) {
      const [indent, len] = code[Math.floor(scroll + i) % code.length]!
      const y = sy + sh * 0.1 + (i - (scroll % 1)) * lineH
      ctx.fillStyle = '#2e2e2e'
      ctx.fillRect(sx + sw * (0.08 + indent), y, sw * 0.82 * len, lineH * 0.42)
    }
    ctx.restore()

    // base + keyboard
    ctx.fillStyle = '#3a3a3a'
    ctx.beginPath()
    ctx.moveTo(sx - sw * 0.06, sy + sh + h * 0.02)
    ctx.lineTo(sx + sw * 1.06, sy + sh + h * 0.02)
    ctx.lineTo(sx + sw * 1.16, sy + sh + h * 0.18)
    ctx.lineTo(sx - sw * 0.16, sy + sh + h * 0.18)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#5a5a5a'
    for (let row = 0; row < 3; row++) {
      for (let k = 0; k < 12; k++) {
        const ky = sy + sh + h * (0.045 + row * 0.04)
        ctx.fillRect(sx + sw * (-0.02 + k * 0.088 - row * 0.02), ky, sw * 0.06, h * 0.022)
      }
    }

    // mug and its steam
    const mx = w * 0.86
    const my = h * 0.72
    ctx.fillStyle = '#7a7a7a'
    ctx.fillRect(mx - w * 0.045, my, w * 0.09, h * 0.11)
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'
    ctx.lineWidth = Math.max(1, w * 0.008)
    for (let s = 0; s < 2; s++) {
      ctx.beginPath()
      for (let k = 0; k <= 10; k++) {
        const yy = my - h * 0.02 - k * h * 0.018
        const xx = mx + (s - 0.5) * w * 0.03 + Math.sin(t * 1.6 + k * 0.7 + s * 2) * w * 0.012
        if (k === 0) ctx.moveTo(xx, yy)
        else ctx.lineTo(xx, yy)
      }
      ctx.stroke()
    }

    // the phone lights up now and then
    const ping = Math.max(0, Math.sin(t * 0.7 + seed)) ** 6
    ctx.fillStyle = `rgba(255,255,255,${0.12 + ping * 0.8})`
    ctx.fillRect(w * 0.06, h * 0.82, w * 0.12, h * 0.07)
  }
}

function ground(seed: number): ScenePainter {
  const rand = rng(seed * 31337)
  const lobes = Array.from({ length: 5 }, () => ({
    ax: 0.2 + rand() * 0.3,
    ay: 0.2 + rand() * 0.3,
    fx: 0.03 + rand() * 0.05,
    fy: 0.02 + rand() * 0.05,
    ph: rand() * 10,
    r: 0.25 + rand() * 0.3,
  }))
  return (ctx, w, h, t, p) => {
    for (const lobe of lobes) {
      const x = (0.5 + lobe.ax * Math.sin(t * lobe.fx * 6 + lobe.ph)) * w
      const y = (0.5 + lobe.ay * Math.cos(t * lobe.fy * 6 + lobe.ph * 1.3)) * h
      glow(ctx, x, y, Math.max(w, h) * lobe.r, 0.55)
    }
    if (p.inside) glow(ctx, p.x * w, p.y * h, Math.max(w, h) * 0.12, 0.35)
  }
}

function photo(image: HTMLImageElement, seed: number): ScenePainter {
  return (ctx, w, h, t) => {
    const iw = image.naturalWidth || 1
    const ih = image.naturalHeight || 1
    const zoom = 1.06 + 0.03 * Math.sin(t * 0.12 + seed)
    const scale = Math.max(w / iw, h / ih) * zoom
    const dw = iw * scale
    const dh = ih * scale
    const dx = (w - dw) / 2 + Math.sin(t * 0.09 + seed) * w * 0.02
    const dy = (h - dh) / 2 + Math.cos(t * 0.07 + seed) * h * 0.02
    ctx.drawImage(image, dx, dy, dw, dh)
  }
}

/* ── helpers ─────────────────────────────────────────────────────────────── */

type SmearOptions = { bands: number; drift: number; burst: number; seed: number }

/** Draws `art` in horizontal bands that slip sideways: a slow drift, rare bursts, and a push from the cursor. */
function smearBands(
  ctx: CanvasRenderingContext2D,
  art: CanvasImageSource,
  w: number,
  h: number,
  t: number,
  p: Pointer,
  { bands, drift, burst, seed }: SmearOptions,
) {
  const bandH = h / bands
  for (let i = 0; i < bands; i++) {
    const y = i * bandH
    const mid = (i + 0.5) / bands
    const slow = Math.sin(t * 0.7 + i * 0.55 + seed) * drift * w
    const spike = Math.pow(Math.max(0, Math.sin(t * 0.31 + i * 1.7 + seed * 2.1)), 12) * burst * w
    const push = p.inside ? (p.x - 0.5) * 0.3 * w * Math.exp(-(((mid - p.y) / 0.12) ** 2)) : 0
    const dx = slow + spike + push
    ctx.globalAlpha = 0.22
    ctx.drawImage(art, 0, y, w, bandH + 1, dx * 1.8, y, w, bandH + 1)
    ctx.globalAlpha = 1
    ctx.drawImage(art, 0, y, w, bandH + 1, dx, y, w, bandH + 1)
  }
}
