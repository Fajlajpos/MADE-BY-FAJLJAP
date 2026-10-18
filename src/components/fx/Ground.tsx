'use client'

import { useEffect, useRef } from 'react'
import {
  cellPhase,
  createPrinter,
  PEAK,
  type GroundSpan,
  type GroundStyle,
} from '@/lib/ascii/drift'
import { monoFamily, prefersReducedMotion } from '@/lib/ascii/env'
import styles from './Ground.module.css'

/** Character cell height in CSS px. */
const CELL = 11
/** Rows per canvas tile. */
const TILE_ROWS = 48
const TILE_H = TILE_ROWS * CELL
/** Ramp from empty to dense (the kit's Drift ramp). */
const CHARSET = ' .:-=+*#'
const LAST = CHARSET.length - 1
/** Graphite inks by tone: quiet glyphs darker, dense ones lighter (the kit's `shade`). */
const INKS = ['#4b4a46', '#64625d', '#7f7d77']
const WAKE = '#cfcdc5'
/** Redraws per second for the shimmer; scrolling itself is the browser's, always smooth. */
const FPS = 30

type Tile = {
  index: number
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  heat: Float32Array
  /** Heat is still settling, or the tile has never been drawn. */
  dirty: boolean
  /** Rows painted at least once since the last layout. */
  drawn: Uint8Array
}

/**
 * The ground of characters, printed onto the page. It lives in the page itself, cut into canvas
 * tiles that scroll with the content exactly like the text does; only the tiles on screen are
 * redrawn, for the shimmer and the rings. The pattern is computed from each cell's position on
 * the page (the same on every load) and sections choose their variety with `data-ground`.
 * A click sends a ring of lit characters through it; moving the cursor leaves no trail.
 */
export function Ground() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = ref.current
    if (!host) return
    const printer = createPrinter()
    const reduced = prefersReducedMotion()
    const tiles = new Map<number, Tile>()
    const pulses: { x: number; y: number; t0: number }[] = []
    let cols = 0
    let charW = CELL * 0.62
    let font = ''
    let dpr = 1
    let raf = 0
    let last = 0
    let cancelled = false

    const pageHeight = () => host.clientHeight

    /** Sections, width and cell size → the printer's layout. */
    const measure = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const probe = document.createElement('canvas').getContext('2d')
      font = `500 ${(CELL * 0.86).toFixed(2)}px ${monoFamily()}`
      if (probe) {
        probe.font = font
        const w = probe.measureText('M').width
        if (w > 0) charW = w
      }
      cols = Math.ceil(host.clientWidth / charW) + 1
      const spans: GroundSpan[] = []
      const top0 = host.getBoundingClientRect().top
      for (const el of document.querySelectorAll<HTMLElement>('[data-ground]')) {
        const r = el.getBoundingClientRect()
        spans.push({
          top: r.top - top0,
          bottom: r.bottom - top0,
          style: el.dataset.ground as GroundStyle,
        })
      }
      const changed = printer.setLayout({
        cellW: charW,
        cellH: CELL,
        cols,
        unit: window.innerHeight,
        width: window.innerWidth,
        spans,
      })
      for (const tile of tiles.values()) {
        sizeTile(tile)
        if (changed) tile.heat = new Float32Array(TILE_ROWS * cols)
        tile.drawn.fill(0)
        tile.dirty = true
      }
      sync()
      kick()
    }

    const sizeTile = (tile: Tile) => {
      const width = host.clientWidth
      tile.canvas.width = Math.round(width * dpr)
      tile.canvas.height = Math.round(TILE_H * dpr)
      tile.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      tile.ctx.font = font
      tile.ctx.textBaseline = 'top'
      if ('letterSpacing' in tile.ctx) tile.ctx.letterSpacing = '0px'
    }

    /** Keeps canvases for the tiles near the screen and lets the far ones go. */
    const sync = () => {
      // how far down the ground the top of the screen is
      const viewTop = -host.getBoundingClientRect().top
      const first = Math.max(0, Math.floor((viewTop - window.innerHeight) / TILE_H))
      const lastTile = Math.min(
        Math.floor(pageHeight() / TILE_H),
        Math.floor((viewTop + window.innerHeight * 3) / TILE_H),
      )
      for (const [i, tile] of tiles) {
        if (i < first - 1 || i > lastTile + 1) {
          tile.canvas.remove()
          tiles.delete(i)
        }
      }
      for (let i = first; i <= lastTile; i++) {
        if (tiles.has(i)) continue
        const canvas = document.createElement('canvas')
        canvas.className = styles.tile!
        canvas.style.top = `${i * TILE_H}px`
        const ctx = canvas.getContext('2d')
        if (!ctx) continue
        const tile: Tile = {
          index: i,
          canvas,
          ctx,
          heat: new Float32Array(TILE_ROWS * cols),
          dirty: true,
          drawn: new Uint8Array(TILE_ROWS),
        }
        sizeTile(tile)
        host.appendChild(canvas)
        tiles.set(i, tile)
      }
    }

    /** Is any of the tile on screen? */
    const onScreen = (tile: Tile) => {
      const r = tile.canvas.getBoundingClientRect()
      return r.bottom > 0 && r.top < window.innerHeight
    }

    /** Each glyph's shimmer phase, fixed per page cell; computed once per row. */
    const phases = new Map<number, Float32Array>()
    const phaseRow = (row: number) => {
      let p = phases.get(row)
      if (!p || p.length !== cols) {
        p = new Float32Array(cols)
        for (let c = 0; c < cols; c++) p[c] = cellPhase(c, row) * 6.2832
        phases.set(row, p)
      }
      return p
    }
    const CODES = Array.from(CHARSET, (ch) => ch.charCodeAt(0))
    const SPACE = 32
    /** One reusable line of character codes per ink band (+ the wake). */
    let lines: Uint16Array[] = []

    /**
     * Redraws the rows of a tile that are on screen (plus a few either side), and any row printed
     * since the last pass; rows further off keep their last frame until they come into view.
     */
    const draw = (tile: Tile, t: number) => {
      const { ctx, heat, drawn } = tile
      const width = host.clientWidth
      const rect = tile.canvas.getBoundingClientRect()
      const from = Math.max(0, Math.floor(-rect.top / CELL) - 4)
      const to = Math.min(TILE_ROWS, Math.ceil((window.innerHeight - rect.top) / CELL) + 4)
      const bands = INKS.length
      if (lines.length !== bands + 1 || lines[0]!.length !== cols) {
        lines = Array.from({ length: bands + 1 }, () => new Uint16Array(cols))
      }
      const used = new Array<boolean>(bands + 1)
      let warm = false
      for (let r = 0; r < TILE_ROWS; r++) {
        const row = tile.index * TILE_ROWS + r
        const base = printer.peek(row)
        if (!base) continue
        if ((r < from || r >= to) && drawn[r]) continue
        drawn[r] = 1
        ctx.clearRect(0, r * CELL, width, CELL)
        const phase = phaseRow(row)
        const swell = reduced ? 1 : 0.88 + 0.12 * Math.sin(row * 0.11 - t * 0.55)
        for (let k = 0; k <= bands; k++) {
          lines[k]!.fill(SPACE)
          used[k] = false
        }
        for (let c = 0; c < cols; c++) {
          const h = heat[r * cols + c]!
          if (h > 0.01) warm = true
          const b = base[c]!
          let level = 0
          if (b > 0.004) {
            const shimmer = reduced ? 1 : 0.8 + 0.2 * Math.sin(t * 0.9 + phase[c]!)
            level = (b * PEAK + 0.03) * shimmer * swell
          }
          if (h > 0) level = Math.min(1, level + h * 0.6)
          const idx = Math.round(level * LAST)
          if (idx === 0) continue
          const band = h > 0.22 ? bands : level < 0.3 ? 0 : level < 0.55 ? 1 : 2
          lines[band]![c] = CODES[idx]!
          used[band] = true
        }
        for (let k = 0; k <= bands; k++) {
          if (!used[k]) continue
          ctx.fillStyle = k === bands ? WAKE : INKS[k]!
          ctx.fillText(
            String.fromCharCode.apply(null, lines[k] as unknown as number[]),
            0,
            r * CELL,
          )
        }
      }
      tile.dirty = warm
    }

    /** Rings from clicks warm a travelling circle of cells, which then cool down. */
    const warm = (now: number) => {
      const ringsAlive = pulses.length > 0
      for (const tile of tiles.values()) {
        const { heat } = tile
        let hot = false
        for (let i = 0; i < heat.length; i++) {
          if (heat[i]! > 0.001) {
            heat[i]! *= 0.9
            hot = true
          }
        }
        if (hot) tile.dirty = true
        const tileTop = tile.index * TILE_H
        if (ringsAlive && onScreen(tile)) {
          for (const p of pulses) {
            const radius = ((now - p.t0) / 1000) * 700
            for (let r = 0; r < TILE_ROWS; r++) {
              const y = tileTop + (r + 0.5) * CELL - p.y
              for (let c = 0; c < cols; c++) {
                const x = (c + 0.5) * charW - p.x
                const off = Math.abs(Math.hypot(x, y) - radius)
                if (off < 16) {
                  const fade = 1 - (now - p.t0) / 1400
                  heat[r * cols + c] = Math.max(heat[r * cols + c]!, (1 - off / 16) * 0.7 * fade)
                }
              }
            }
          }
          tile.dirty = true
        }
      }
      for (let i = pulses.length - 1; i >= 0; i--)
        if (now - pulses[i]!.t0 > 1400) pulses.splice(i, 1)
    }

    /** Prints rows ahead of the screen in small batches, so a new tile never stalls a frame. */
    const printAhead = (budgetMs: number) => {
      const start = performance.now()
      const order = [...tiles.values()].sort((a, b) => Number(onScreen(b)) - Number(onScreen(a)))
      for (const tile of order) {
        for (let r = 0; r < TILE_ROWS; r++) {
          const row = tile.index * TILE_ROWS + r
          if (printer.peek(row)) continue
          printer.row(row)
          tile.dirty = true
          if (performance.now() - start > budgetMs) return false
        }
      }
      return true
    }

    const frame = (now: number) => {
      raf = 0
      if (cancelled || document.hidden) return
      const done = printAhead(onScreenUnprinted() ? 5 : 2.5)
      const due = now - last >= 1000 / FPS
      if (due) {
        last = now
        warm(now)
        for (const tile of tiles.values()) {
          if (onScreen(tile) && (tile.dirty || !reduced)) draw(tile, now / 1000)
        }
      }
      if (!reduced || !done || pulses.length > 0) raf = requestAnimationFrame(frame)
    }

    const onScreenUnprinted = () => {
      for (const tile of tiles.values()) {
        if (!onScreen(tile)) continue
        if (!printer.peek(tile.index * TILE_ROWS + TILE_ROWS - 1)) return true
      }
      return false
    }

    const kick = () => {
      if (!raf && !cancelled) raf = requestAnimationFrame(frame)
    }

    const onScroll = () => {
      sync()
      kick()
    }
    const onClick = (event: MouseEvent) => {
      if (reduced) return
      pulses.push({
        x: event.clientX,
        y: event.clientY - host.getBoundingClientRect().top,
        t0: performance.now(),
      })
      kick()
    }
    const onVisibility = () => kick()

    const ro = new ResizeObserver(() => measure())
    void document.fonts?.ready.then(() => {
      if (cancelled) return
      measure()
      ro.observe(host)
      ro.observe(document.body)
    })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('click', onClick)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('click', onClick)
      document.removeEventListener('visibilitychange', onVisibility)
      for (const tile of tiles.values()) tile.canvas.remove()
      tiles.clear()
    }
  }, [])

  return <div ref={ref} className={styles.ground} aria-hidden="true" data-ascii="cpu" />
}
