import { monoFamily, prefersReducedMotion, RAMP } from './env'
import type { Pointer, ScenePainter } from './scenes'

/**
 * The CPU character renderer: the fallback when the GPU field is unavailable (no WebGL2,
 * software WebGL, a blocked GPU). A scene is painted into a small canvas, every cell samples
 * it once and the rows are drawn as text in Martian Mono. The cursor leaves a wake that lifts
 * characters into the print colour, like the GPU trail. Pauses off screen and in hidden tabs;
 * reduced motion draws one still frame.
 */

export type CpuFieldOptions = {
  /** Positioned element the canvas covers (inset 0). */
  host: HTMLElement
  paint: ScenePainter
  /** Cell height in CSS px. */
  cellSize?: number
  charset?: string
  /** CSS custom properties for the ink and the wake. */
  ink?: string
  wake?: string
  /** Multiplies the sampled brightness before mapping it to a glyph. */
  gain?: number
  fps?: number
  /** Leave a wake under the cursor. Default true. */
  trail?: boolean
  /** Put the canvas under the host's content (z-index -1) instead of over it. Default false. */
  under?: boolean
  /** Colour each glyph with the scene's own hue (like the GPU field's source colour mode). */
  color?: boolean
}

export type CpuField = {
  /** A ring of lifted characters from a point in viewport px, for interface events. */
  pulse(x: number, y: number): void
  /** Draw a frame now (reduced motion holds a still that scrolling must update). */
  refresh(): void
  destroy(): void
}

const SAMPLE_MAX = 220

export function mountCpuField(options: CpuFieldOptions): CpuField {
  const {
    host,
    paint,
    cellSize = 11,
    charset = RAMP,
    ink = '--ascii-ink-strong',
    wake = '--ascii-wake',
    gain = 1,
    fps = 24,
    trail = true,
    under = false,
    color = false,
  } = options
  const glyphs = Array.from(charset)
  const last = glyphs.length - 1

  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  canvas.dataset.asciiCpu = ''
  Object.assign(canvas.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: under ? '-1' : '1',
    // canvas text inherits the host's letter-spacing (a big wordmark's -0.04em would make
    // every advance negative), so pin the text metrics to neutral
    fontSize: '16px',
    letterSpacing: 'normal',
    wordSpacing: 'normal',
  })
  host.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  const sample = document.createElement('canvas')
  const sctx = sample.getContext('2d', { willReadFrequently: true })

  let cols = 0
  let rows = 0
  let charW = 0
  let heat = new Float32Array(0)
  let raf = 0
  let visible = false
  let disposed = false
  let start = performance.now()
  let lastFrame = 0
  let inkColor = ''
  let wakeColor = ''
  const pointer: Pointer & { px: number; py: number; moved: number } = {
    x: -1,
    y: -1,
    inside: false,
    px: -1,
    py: -1,
    moved: 0,
  }
  const reduced = prefersReducedMotion()

  const readColors = () => {
    const style = getComputedStyle(host)
    inkColor = style.getPropertyValue(ink).trim() || '#a5a49e'
    wakeColor = style.getPropertyValue(wake).trim() || inkColor
  }

  const resize = () => {
    if (!ctx) return
    const rect = host.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.max(1, Math.round(rect.width * dpr))
    canvas.height = Math.max(1, Math.round(rect.height * dpr))
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.font = `500 ${cellSize * 0.86}px ${monoFamily()}`
    ctx.textBaseline = 'top'
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'
    const advance = ctx.measureText('M').width
    charW = advance > 0 ? advance : cellSize * 0.6
    cols = Math.max(1, Math.ceil(rect.width / charW))
    rows = Math.max(1, Math.ceil(rect.height / cellSize))
    heat = new Float32Array(cols * rows)
    const s = Math.min(1, SAMPLE_MAX / Math.max(rect.width, rect.height))
    sample.width = Math.max(2, Math.round(rect.width * s))
    sample.height = Math.max(2, Math.round(rect.height * s))
  }

  const draw = (now: number) => {
    if (!ctx || !sctx || cols === 0) return
    const t = reduced ? 4 : (now - start) / 1000
    const sw = sample.width
    const sh = sample.height
    sctx.fillStyle = '#000'
    sctx.fillRect(0, 0, sw, sh)
    paint(sctx, sw, sh, t, pointer)
    const pixels = sctx.getImageData(0, 0, sw, sh).data

    // the wake: heat decays, the cursor adds to it in proportion to how far it moved
    if (trail && !reduced) {
      for (let i = 0; i < heat.length; i++) heat[i]! *= 0.88
      if (pointer.inside && pointer.moved > 0) {
        const pc = pointer.x * cols
        const pr = pointer.y * rows
        const radius = 3.2
        const amount = Math.min(1, pointer.moved * 40)
        for (let r = Math.max(0, Math.floor(pr - radius)); r < Math.min(rows, pr + radius); r++) {
          for (
            let c = Math.max(0, Math.floor(pc - radius * 1.8));
            c < Math.min(cols, pc + radius * 1.8);
            c++
          ) {
            const d = Math.hypot((c - pc) / 1.8, r - pr) / radius
            if (d < 1) heat[r * cols + c] = Math.min(1, heat[r * cols + c]! + (1 - d) * amount)
          }
        }
        pointer.moved = 0
      }
    }

    const rect = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)
    ctx.fillStyle = inkColor
    const hot: [number, number, string][] = []
    if (color) {
      drawColor(pixels, sw, sh)
      return
    }
    for (let r = 0; r < rows; r++) {
      let line = ''
      const sy = Math.min(sh - 1, Math.floor(((r + 0.5) / rows) * sh))
      for (let c = 0; c < cols; c++) {
        const sx = Math.min(sw - 1, Math.floor(((c + 0.5) / cols) * sw))
        const o = (sy * sw + sx) * 4
        const lum = (pixels[o]! * 0.299 + pixels[o + 1]! * 0.587 + pixels[o + 2]! * 0.114) / 255
        const h = heat[r * cols + c] ?? 0
        const v = Math.min(1, lum * gain + h * 0.55)
        const glyph = glyphs[Math.round(v * last)] ?? ' '
        if (h > 0.22 && glyph !== ' ') {
          hot.push([c, r, glyph])
          line += ' '
        } else line += glyph
      }
      ctx.fillText(line, 0, r * cellSize)
    }
    if (hot.length) {
      ctx.fillStyle = wakeColor
      for (const [c, r, glyph] of hot) ctx.fillText(glyph, c * charW, r * cellSize)
    }
  }

  /** Source colour: glyphs grouped by a 3-bit-per-channel colour, one fillStyle per group. */
  const drawColor = (pixels: Uint8ClampedArray, sw: number, sh: number) => {
    if (!ctx) return
    const groups = new Map<number, number[]>()
    for (let r = 0; r < rows; r++) {
      const sy = Math.min(sh - 1, Math.floor(((r + 0.5) / rows) * sh))
      for (let c = 0; c < cols; c++) {
        const sx = Math.min(sw - 1, Math.floor(((c + 0.5) / cols) * sw))
        const o = (sy * sw + sx) * 4
        const pr = pixels[o]!
        const pg = pixels[o + 1]!
        const pb = pixels[o + 2]!
        const lum = (pr * 0.299 + pg * 0.587 + pb * 0.114) / 255
        const h = heat[r * cols + c] ?? 0
        const v = Math.min(1, lum * gain + h * 0.55)
        const gi = Math.round(v * last)
        if (gi === 0) continue
        // the hue at full value, dimmed by the tone, as the GPU field inks it
        const peak = Math.max(pr, pg, pb, 20)
        const tone = 0.38 + 0.62 * v
        const key =
          h > 0.22
            ? -1
            : ((((pr / peak) * tone * 7) | 0) << 6) |
              ((((pg / peak) * tone * 7) | 0) << 3) |
              (((pb / peak) * tone * 7) | 0)
        const cell = (r * cols + c) * 16 + gi
        const list = groups.get(key)
        if (list) list.push(cell)
        else groups.set(key, [cell])
      }
    }
    for (const [key, cells] of groups) {
      ctx.fillStyle =
        key < 0
          ? wakeColor
          : `rgb(${((key >> 6) & 7) * 36 + 3},${((key >> 3) & 7) * 36 + 3},${(key & 7) * 36 + 3})`
      for (const cell of cells) {
        const idx = cell >> 4
        ctx.fillText(
          glyphs[cell & 15] ?? ' ',
          (idx % cols) * charW,
          Math.floor(idx / cols) * cellSize,
        )
      }
    }
  }

  const loop = (now: number) => {
    raf = 0
    if (disposed || !visible || document.hidden) return
    if (now - lastFrame >= 1000 / fps) {
      lastFrame = now
      draw(now)
    }
    raf = requestAnimationFrame(loop)
  }

  const kick = () => {
    if (reduced) {
      draw(performance.now())
      return
    }
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(loop)
  }

  const onPointer = (event: PointerEvent) => {
    const rect = host.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    pointer.inside = x >= 0 && x <= 1 && y >= 0 && y <= 1
    if (pointer.px >= 0) pointer.moved += Math.hypot(x - pointer.px, y - pointer.py)
    pointer.px = x
    pointer.py = y
    pointer.x = x
    pointer.y = y
  }

  const io = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false
    kick()
  })
  const ro = new ResizeObserver(() => {
    resize()
    draw(performance.now())
  })
  const onVisibility = () => kick()
  const spot = new MutationObserver(() => {
    readColors()
    if (reduced) draw(performance.now())
  })

  readColors()
  resize()
  void document.fonts?.ready.then(() => {
    if (disposed) return
    resize()
    draw(performance.now())
  })
  io.observe(host)
  ro.observe(host)
  spot.observe(document.documentElement, { attributes: true, attributeFilter: ['data-spot'] })
  window.addEventListener('pointermove', onPointer, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
  start = performance.now() - Math.random() * 20000

  return {
    pulse(x, y) {
      if (reduced || cols === 0) return
      const rect = host.getBoundingClientRect()
      const pc = ((x - rect.left) / rect.width) * cols
      const pr = ((y - rect.top) / rect.height) * rows
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const d = Math.hypot((c - pc) / 1.8, r - pr)
          if (d < 9) heat[r * cols + c] = Math.max(heat[r * cols + c]!, 1 - d / 9)
        }
      }
      kick()
    },
    refresh() {
      draw(performance.now())
    },
    destroy() {
      disposed = true
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      spot.disconnect()
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.remove()
    },
  }
}
