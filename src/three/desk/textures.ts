import { CanvasTexture, SRGBColorSpace, type Texture } from 'three'
import { fontFamily } from '@/lib/dom'
import { rng } from '@/lib/random'

/**
 * Every surface of the night desk is painted in code on a 2D canvas: wood grain with an old mug
 * ring, Czech key legends, a sketchbook spread, a sticky note, the phone's lock screen and the
 * live editor on the monitor. A photo or a scanned texture can replace any of them later.
 */

function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  if (!ctx) throw new Error('2D canvas unavailable')
  return { c, ctx }
}

function toTexture(c: HTMLCanvasElement, color = true): CanvasTexture {
  const t = new CanvasTexture(c)
  if (color) t.colorSpace = SRGBColorSpace
  t.anisotropy = 4
  return t
}

function bodyFamily() {
  return fontFamily('--font-archivo', 'Arial, sans-serif')
}

function monoFamily() {
  return fontFamily('--font-martian', 'ui-monospace, monospace')
}

function displayFamily() {
  return fontFamily('--font-bricolage', 'Arial, sans-serif')
}

/** A pencil line: several thin passes with a little wobble, like a hand drew it. */
function pencil(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  rand: () => number,
  { width = 2, alpha = 0.55, passes = 2, wobble = 1.6 } = {},
) {
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (let pass = 0; pass < passes; pass++) {
    ctx.globalAlpha = alpha * (0.6 + rand() * 0.4)
    ctx.lineWidth = width * (0.7 + rand() * 0.5)
    ctx.beginPath()
    points.forEach(([x, y], i) => {
      const steps = i === 0 ? 1 : 6
      const [px, py] = i === 0 ? [x, y] : (points[i - 1] as [number, number])
      for (let s = 1; s <= steps; s++) {
        const k = s / steps
        const jx = x * k + px * (1 - k) + (rand() - 0.5) * wobble
        const jy = y * k + py * (1 - k) + (rand() - 0.5) * wobble
        if (i === 0) ctx.moveTo(jx, jy)
        else ctx.lineTo(jx, jy)
      }
    })
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

function rect(x: number, y: number, w: number, h: number): [number, number][] {
  return [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
    [x, y + 1],
  ]
}

/* ── wood ───────────────────────────────────────────────────────────── */

/** Dark oiled oak: long grain, a few knots and a coffee ring that never came off. */
export function woodTexture(base: string): { map: Texture; bump: Texture } {
  const W = 2048
  const H = 1024
  const { c, ctx } = canvas(W, H)
  const bump = canvas(W, H)
  const rand = rng(7)
  ctx.fillStyle = base
  ctx.fillRect(0, 0, W, H)
  bump.ctx.fillStyle = '#808080'
  bump.ctx.fillRect(0, 0, W, H)

  // planks: three boards along the length, each a little different in tone
  for (let b = 0; b < 3; b++) {
    const y0 = (b * H) / 3
    ctx.fillStyle = `rgba(${b === 1 ? '255,220,180' : '0,0,0'},${0.04 + rand() * 0.05})`
    ctx.fillRect(0, y0, W, H / 3)
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(0, y0, W, 2)
    bump.ctx.fillStyle = '#2a2a2a'
    bump.ctx.fillRect(0, y0, W, 3)
  }

  // grain: long wavy lines, darker and lighter
  for (let i = 0; i < 520; i++) {
    const y = rand() * H
    const amp = 2 + rand() * 9
    const freq = 0.002 + rand() * 0.004
    const phase = rand() * 10
    const dark = rand() > 0.35
    ctx.strokeStyle = dark ? `rgba(20,10,4,${0.05 + rand() * 0.12})` : `rgba(255,214,170,${0.03 + rand() * 0.05})`
    ctx.lineWidth = 0.6 + rand() * 2.2
    ctx.beginPath()
    for (let x = 0; x <= W; x += 16) {
      const yy = y + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 3.1 + phase) * amp * 0.25
      if (x === 0) ctx.moveTo(x, yy)
      else ctx.lineTo(x, yy)
    }
    ctx.stroke()
    if (dark && rand() > 0.6) {
      bump.ctx.strokeStyle = 'rgba(40,40,40,0.35)'
      bump.ctx.lineWidth = 1.5
      bump.ctx.stroke()
    }
  }

  // knots
  for (let k = 0; k < 4; k++) {
    const x = rand() * W
    const y = rand() * H
    for (let r = 26; r > 2; r -= 3) {
      ctx.strokeStyle = `rgba(25,12,5,${0.08 + (26 - r) * 0.006})`
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.ellipse(x, y, r * 2.6, r * 0.8, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  // the coffee ring, right of the keyboard
  const rx = W * 0.79
  const ry = H * 0.47
  ctx.strokeStyle = 'rgba(30,14,6,0.35)'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.arc(rx, ry, 52, 0.3, Math.PI * 1.85)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(30,14,6,0.18)'
  ctx.lineWidth = 9
  ctx.beginPath()
  ctx.arc(rx + 6, ry + 3, 49, Math.PI * 1.1, Math.PI * 2.4)
  ctx.stroke()

  // wear in front of the keyboard: lighter, where the wrists rest
  const wear = ctx.createRadialGradient(W * 0.45, H * 0.82, 10, W * 0.45, H * 0.82, 420)
  wear.addColorStop(0, 'rgba(255,225,190,0.10)')
  wear.addColorStop(1, 'rgba(255,225,190,0)')
  ctx.fillStyle = wear
  ctx.fillRect(0, 0, W, H)

  return { map: toTexture(c), bump: toTexture(bump.c, false) }
}

/* ── keyboard ───────────────────────────────────────────────────────── */

/** Czech QWERTZ, each row 15 units wide: [legend, width]. */
export const KEY_ROWS: [string, number][][] = [
  [[';', 1], ['+', 1], ['ě', 1], ['š', 1], ['č', 1], ['ř', 1], ['ž', 1], ['ý', 1], ['á', 1], ['í', 1], ['é', 1], ['=', 1], ['´', 1], ['⌫', 2]],
  [['tab', 1.5], ['q', 1], ['w', 1], ['e', 1], ['r', 1], ['t', 1], ['z', 1], ['u', 1], ['i', 1], ['o', 1], ['p', 1], ['ú', 1], [')', 1], ['', 1.5]],
  [['caps', 1.75], ['a', 1], ['s', 1], ['d', 1], ['f', 1], ['g', 1], ['h', 1], ['j', 1], ['k', 1], ['l', 1], ['ů', 1], ['§', 1], ['enter', 2.25]],
  [['shift', 2.25], ['y', 1], ['x', 1], ['c', 1], ['v', 1], ['b', 1], ['n', 1], ['m', 1], [',', 1], ['.', 1], ['-', 1], ['shift', 2.75]],
  [['ctrl', 1.25], ['fn', 1], ['win', 1.25], ['alt', 1.25], ['', 6.25], ['altgr', 1.25], ['fn', 1], ['ctrl', 1.75]],
]

/** Legends laid out exactly over the key grid; transparent between keys. */
export function keyLegendTexture(): Texture {
  const U = 96
  const { c, ctx } = canvas(15 * U, 5 * U)
  ctx.textBaseline = 'top'
  KEY_ROWS.forEach((row, r) => {
    let x = 0
    for (const [label, w] of row) {
      if (label) {
        const small = label.length > 1
        ctx.font = `500 ${small ? 17 : 30}px ${monoFamily()}`
        ctx.fillStyle = 'rgba(214,214,206,0.82)'
        ctx.fillText(label, x * U + 14, r * U + 12)
      }
      x += w
    }
  })
  return toTexture(c)
}

/* ── sketchbook ─────────────────────────────────────────────────────── */

/** An open spread: a wireframe of this very page on the left, logo doodles on the right. */
export function sketchTexture(): Texture {
  const W = 1600
  const H = 560
  const { c, ctx } = canvas(W, H)
  const rand = rng(21)
  ctx.fillStyle = '#e7e1d3'
  ctx.fillRect(0, 0, W, H)
  // dot grid
  ctx.fillStyle = 'rgba(60,60,70,0.22)'
  for (let x = 20; x < W; x += 28) for (let y = 20; y < H; y += 28) ctx.fillRect(x, y, 2, 2)
  // gutter shadow
  const g = ctx.createLinearGradient(W / 2 - 60, 0, W / 2 + 60, 0)
  g.addColorStop(0, 'rgba(0,0,0,0)')
  g.addColorStop(0.5, 'rgba(0,0,0,0.28)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(W / 2 - 60, 0, 120, H)

  ctx.strokeStyle = '#2b2b33'
  // left page: browser frame, header, a big headline, a desk drawn in the hero
  pencil(ctx, rect(70, 50, 640, 450), rand, { width: 2.4 })
  pencil(ctx, [[70, 95], [710, 95]], rand)
  for (let i = 0; i < 3; i++) pencil(ctx, rect(90 + i * 22, 66, 12, 12), rand, { width: 1.4 })
  pencil(ctx, rect(100, 130, 230, 46), rand, { width: 3, alpha: 0.7 })
  for (let i = 0; i < 3; i++) pencil(ctx, [[100, 205 + i * 22], [300 - i * 30, 205 + i * 22]], rand, { width: 1.6 })
  pencil(ctx, rect(100, 290, 110, 36), rand)
  // the desk in the hero: a table line, a monitor, a lamp
  pencil(ctx, [[380, 420], [690, 420]], rand, { width: 2.6 })
  pencil(ctx, rect(450, 270, 150, 100), rand, { width: 2.2 })
  pencil(ctx, [[525, 370], [525, 420]], rand)
  pencil(ctx, [[400, 420], [420, 300], [470, 250]], rand, { width: 2 })
  pencil(ctx, [[455, 245], [490, 260], [470, 280]], rand)
  // notes in the margin
  ctx.font = `italic 600 26px ${bodyFamily()}`
  ctx.fillStyle = 'rgba(40,40,52,0.78)'
  ctx.save()
  ctx.translate(365, 165)
  ctx.rotate(-0.06)
  ctx.fillText('e-shop Šum: košík vpravo?', 0, 0)
  ctx.fillText('→ pokladna na 2 kroky', 8, 34)
  ctx.restore()
  pencil(ctx, [[600, 150], [560, 240]], rand, { width: 1.6 })

  // right page: logo doodles, an F in a circle, characters, a time
  const ox = W / 2 + 70
  ctx.beginPath()
  ctx.lineWidth = 2.4
  for (let p = 0; p < 2; p++) {
    ctx.globalAlpha = 0.6
    ctx.beginPath()
    ctx.ellipse(ox + 120 + p * 2, 170 + p, 82, 80, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  pencil(ctx, [[ox + 100, 220], [ox + 100, 120], [ox + 150, 120]], rand, { width: 3 })
  pencil(ctx, [[ox + 100, 168], [ox + 140, 168]], rand, { width: 3 })
  ctx.font = `700 64px ${monoFamily()}`
  ctx.fillStyle = 'rgba(40,40,52,0.7)'
  ctx.fillText('FAJ', ox + 280, 200)
  ctx.font = `500 30px ${monoFamily()}`
  ctx.fillText(".:-=+*#%@", ox + 280, 250)
  pencil(ctx, [[ox + 270, 120], [ox + 520, 120]], rand, { width: 1.4 })
  ctx.font = `italic 600 26px ${bodyFamily()}`
  ctx.fillText('nejlíp 22:00 – 03:00', ox + 40, 360)
  ctx.fillText('ne šablony!!', ox + 60, 410)
  pencil(ctx, [[ox + 55, 420], [ox + 230, 418]], rand, { width: 2, alpha: 0.7 })
  for (let i = 0; i < 4; i++) pencil(ctx, rect(ox + 360 + i * 70, 330, 52, 52), rand, { width: 1.5 })

  return toTexture(c)
}

/* ── sticky note ────────────────────────────────────────────────────── */

export function noteTexture(paper: string): Texture {
  const { c, ctx } = canvas(256, 256)
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, 256, 256)
  const shade = ctx.createLinearGradient(0, 0, 0, 256)
  shade.addColorStop(0, 'rgba(255,255,255,0.08)')
  shade.addColorStop(1, 'rgba(0,0,0,0.14)')
  ctx.fillStyle = shade
  ctx.fillRect(0, 0, 256, 256)
  ctx.fillStyle = 'rgba(25,20,30,0.85)'
  ctx.font = `italic 700 44px ${bodyFamily()}`
  ctx.save()
  ctx.translate(26, 92)
  ctx.rotate(-0.07)
  ctx.fillText('žádné', 0, 0)
  ctx.fillText('šablony', 6, 52)
  ctx.restore()
  return toTexture(c)
}

/* ── steam ──────────────────────────────────────────────────────────── */

export function steamTexture(): Texture {
  const { c, ctx } = canvas(128, 256)
  const rand = rng(3)
  for (let i = 0; i < 26; i++) {
    const y = 240 - i * 9
    const x = 64 + Math.sin(i * 0.45) * 18 + (rand() - 0.5) * 6
    const r = 10 + i * 0.9
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    const a = 0.07 * Math.sin((i / 26) * Math.PI)
    g.addColorStop(0, `rgba(255,255,255,${a})`)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 256)
  }
  return toTexture(c)
}

/* ── parcel label ───────────────────────────────────────────────────── */

/** The address label on the e-shop parcel: sender, recipient, order number, a barcode. */
export function labelTexture(): Texture {
  const W = 512
  const H = 340
  const { c, ctx } = canvas(W, H)
  const rand = rng(42)
  ctx.fillStyle = '#f1eee6'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#16171c'
  ctx.font = `600 22px ${monoFamily()}`
  ctx.fillText('OD: FAJLAJP', 26, 46)
  ctx.font = `800 46px ${displayFamily()}`
  ctx.fillText('Kavárna Šum', 26, 112)
  ctx.font = `500 22px ${bodyFamily()}`
  ctx.fillText('objednávka z e-shopu', 26, 146)
  ctx.font = `700 40px ${monoFamily()}`
  ctx.fillText('#0042', 26, 204)
  for (let x = 26; x < W - 26; ) {
    const w = 2 + Math.floor(rand() * 6)
    if (rand() > 0.35) ctx.fillRect(x, 236, w, 76)
    x += w + 2
  }
  return toTexture(c)
}

/* ── phone: an order-tracking app ───────────────────────────────────── */

export function phoneTexture(accent: string, cold: string): Texture {
  const W = 300
  const H = 640
  const { c, ctx } = canvas(W, H)
  ctx.fillStyle = '#0d0f15'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(235,238,245,0.95)'
  ctx.font = `800 30px ${displayFamily()}`
  ctx.fillText('Objednávka', 24, 74)
  ctx.font = `600 22px ${monoFamily()}`
  ctx.fillStyle = 'rgba(235,238,245,0.6)'
  ctx.fillText('#0042 · Kavárna Šum', 24, 106)
  // the map card
  const g = ctx.createLinearGradient(0, 130, W, 330)
  g.addColorStop(0, cold)
  g.addColorStop(1, '#1b2350')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.roundRect(24, 130, W - 48, 190, 18)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.75)'
  ctx.lineWidth = 4
  ctx.setLineDash([10, 8])
  ctx.beginPath()
  ctx.moveTo(56, 290)
  ctx.bezierCurveTo(110, 200, 180, 280, 240, 170)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = accent
  ctx.beginPath()
  ctx.arc(240, 170, 11, 0, Math.PI * 2)
  ctx.fill()
  // the steps
  const steps = ['Přijato', 'Zabaleno', 'Na cestě']
  steps.forEach((label, i) => {
    const y = 372 + i * 58
    ctx.fillStyle = i < 2 ? accent : 'rgba(235,238,245,0.3)'
    ctx.beginPath()
    ctx.arc(40, y, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = i < 2 ? 'rgba(235,238,245,0.95)' : 'rgba(235,238,245,0.55)'
    ctx.font = `600 24px ${bodyFamily()}`
    ctx.fillText(label, 66, y + 8)
  })
  ctx.fillStyle = accent
  ctx.beginPath()
  ctx.roundRect(24, 562, W - 48, 52, 26)
  ctx.fill()
  ctx.fillStyle = '#0b0c10'
  ctx.font = `700 22px ${bodyFamily()}`
  ctx.textAlign = 'center'
  ctx.fillText('Sledovat balík', W / 2, 596)
  return toTexture(c)
}

/* ── monitor: a web being built ─────────────────────────────────────── */

const SCREEN_W = 1280
const SCREEN_H = 800

type Block = {
  x: number
  y: number
  w: number
  h: number
  kind: 'bar' | 'image' | 'title' | 'text' | 'card' | 'button' | 'logo'
}

/** The e-shop being designed on the monitor, as blocks on a light artboard. */
const PAGE: Block[] = [
  { kind: 'logo', x: 40, y: 30, w: 120, h: 34 },
  { kind: 'bar', x: 560, y: 38, w: 360, h: 18 },
  { kind: 'image', x: 40, y: 96, w: 420, h: 260 },
  { kind: 'title', x: 500, y: 120, w: 400, h: 96 },
  { kind: 'text', x: 500, y: 236, w: 360, h: 56 },
  { kind: 'button', x: 500, y: 306, w: 190, h: 50 },
  { kind: 'card', x: 40, y: 392, w: 270, h: 150 },
  { kind: 'card', x: 336, y: 392, w: 270, h: 150 },
  { kind: 'card', x: 632, y: 392, w: 270, h: 150 },
]

/**
 * The monitor: a design tool with the e-shop for Kavárna Šum on its artboard. Over a 14 s loop
 * the blocks appear one by one, each picked by the cursor and outlined in ultramarine, then the
 * page holds and starts again. The clock in the title bar is the visitor's real time.
 * Repaints only when something visible changed.
 */
export class ScreenTexture {
  readonly texture: CanvasTexture
  private ctx: CanvasRenderingContext2D
  private last = ''

  constructor(
    private accent: string,
    private cold: string,
  ) {
    const { c, ctx } = canvas(SCREEN_W, SCREEN_H)
    this.ctx = ctx
    this.texture = toTexture(c)
  }

  /** `t` in seconds. Returns true when the texture changed. */
  draw(t: number, still = false): boolean {
    const cycle = 14
    const local = still ? cycle : t % cycle
    const step = Math.min(PAGE.length, Math.floor(local / 1.2))
    const within = Math.min(1, (local % 1.2) / 0.6)
    const now = new Date()
    const clock = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const key = `${step}|${Math.round(within * 8)}|${clock}`
    if (key === this.last) return false
    this.last = key
    this.paint(step, within, clock)
    this.texture.needsUpdate = true
    return true
  }

  private paint(step: number, within: number, clock: string) {
    const ctx = this.ctx
    const mono = monoFamily()
    // the tool: dark frame, a layers panel, the artboard
    ctx.fillStyle = '#10131b'
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H)
    ctx.fillStyle = '#171b26'
    ctx.fillRect(0, 0, SCREEN_W, 56)
    ctx.fillRect(0, 56, 220, SCREEN_H - 56)
    ctx.font = `500 20px ${mono}`
    ctx.fillStyle = '#c9d4ea'
    ctx.textBaseline = 'middle'
    ctx.fillText('sum-eshop · návrh', 24, 28)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#7d8aa6'
    ctx.fillText(clock, SCREEN_W - 24, 28)
    ctx.textAlign = 'left'
    const layers = ['Hlavička', 'Hero', 'Nadpis', 'Text', 'Tlačítko', 'Produkty']
    layers.forEach((name, i) => {
      const y = 96 + i * 40
      if (i === Math.min(step, layers.length - 1)) {
        ctx.fillStyle = '#2a3354'
        ctx.fillRect(12, y - 16, 196, 32)
      }
      ctx.fillStyle = '#9aa6c2'
      ctx.fillText(name, 28, y)
    })

    const ox = 250
    const oy = 80
    ctx.fillStyle = '#f3efe7'
    ctx.fillRect(ox, oy, 950, 600)
    ctx.save()
    ctx.translate(ox, oy)
    PAGE.forEach((b, i) => {
      if (i > step) return
      ctx.globalAlpha = i === step ? within : 1
      this.block(b)
    })
    ctx.globalAlpha = 1
    // the selection and the cursor on the block being made
    const current = PAGE[step]
    if (current) {
      ctx.strokeStyle = this.cold
      ctx.lineWidth = 3
      ctx.strokeRect(current.x - 6, current.y - 6, current.w + 12, current.h + 12)
      const cx = current.x + current.w * 0.8
      const cy = current.y + current.h * 0.7
      ctx.fillStyle = '#16171c'
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx, cy + 34)
      ctx.lineTo(cx + 9, cy + 25)
      ctx.lineTo(cx + 16, cy + 40)
      ctx.lineTo(cx + 22, cy + 37)
      ctx.lineTo(cx + 15, cy + 22)
      ctx.lineTo(cx + 27, cy + 22)
      ctx.closePath()
      ctx.fill()
    }
    ctx.restore()
  }

  private block(b: Block) {
    const ctx = this.ctx
    ctx.textBaseline = 'top'
    switch (b.kind) {
      case 'logo':
        ctx.fillStyle = '#16171c'
        ctx.font = `800 32px ${displayFamily()}`
        ctx.fillText('ŠUM.', b.x, b.y)
        break
      case 'bar':
        ctx.fillStyle = '#16171c'
        for (let i = 0; i < 4; i++) ctx.fillRect(b.x + i * 96, b.y, 70, 12)
        break
      case 'image': {
        const g = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h)
        g.addColorStop(0, this.accent)
        g.addColorStop(1, '#3a1d12')
        ctx.fillStyle = g
        ctx.fillRect(b.x, b.y, b.w, b.h)
        // a cup on a saucer
        ctx.fillStyle = 'rgba(255,255,255,0.88)'
        ctx.beginPath()
        ctx.ellipse(b.x + b.w * 0.5, b.y + b.h * 0.72, 86, 20, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillRect(b.x + b.w * 0.5 - 52, b.y + b.h * 0.34, 104, 86)
        break
      }
      case 'title':
        ctx.fillStyle = '#16171c'
        ctx.font = `800 50px ${displayFamily()}`
        ctx.fillText('Káva do rána.', b.x, b.y)
        ctx.fillText('Domů za 2 dny.', b.x, b.y + 50)
        break
      case 'text':
        ctx.fillStyle = '#6b6a66'
        for (let i = 0; i < 3; i++) ctx.fillRect(b.x, b.y + i * 20, b.w - i * 60, 10)
        break
      case 'button':
        ctx.fillStyle = this.accent
        ctx.beginPath()
        ctx.roundRect(b.x, b.y, b.w, b.h, 25)
        ctx.fill()
        ctx.fillStyle = '#16171c'
        ctx.font = `700 20px ${bodyFamily()}`
        ctx.textBaseline = 'middle'
        ctx.fillText('Do košíku', b.x + 44, b.y + b.h / 2)
        break
      case 'card':
        ctx.fillStyle = '#e4ded2'
        ctx.fillRect(b.x, b.y, b.w, b.h)
        ctx.fillStyle = this.cold
        ctx.fillRect(b.x + 16, b.y + 16, 70, 70)
        ctx.fillStyle = '#16171c'
        ctx.fillRect(b.x + 104, b.y + 24, 120, 12)
        ctx.fillRect(b.x + 104, b.y + 48, 80, 10)
        ctx.font = `700 22px ${bodyFamily()}`
        ctx.fillText('289 Kč', b.x + 104, b.y + 100)
        break
    }
  }
}
