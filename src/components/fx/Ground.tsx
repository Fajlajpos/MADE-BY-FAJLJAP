'use client'

import { useEffect, useRef } from 'react'
import {
  cellPhase,
  firstChangedRow,
  layoutKey,
  PEAK,
  printRow,
  type GroundSpan,
  type GroundStyle,
  type PrintLayout,
} from '@/lib/ascii/drift'
import { monoFamily, prefersReducedMotion } from '@/lib/ascii/env'
import type { GroundBatch, GroundFocus, GroundJob } from '@/lib/ascii/ground.worker'
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
const FPS = 24
/** Screens of ground kept as canvases above and below the screen. */
const KEEP_ABOVE = 1
const KEEP_BELOW = 2
/** Rows per frame drawn into tiles just off screen, so they scroll in already drawn. */
const PREDRAW_ROWS = 64
/** Canvases kept for reuse instead of being made again while scrolling. */
const POOL = 3
/**
 * Share of a screen above and below it kept shimmering too. The page scrolls ahead of the main
 * thread, so rows just past the edge come into view before a frame knows; drawn fresh they slide
 * in matching their neighbours instead of jumping from an old frame (which read as a blink).
 */
const REACH = 0.5

type Tile = {
  index: number
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  heat: Float32Array
  /** Heat is still settling. */
  dirty: boolean
  /** Rows painted with their current pattern. */
  drawn: Uint8Array
}

/**
 * The ground of characters, printed onto the page. It lives in the page itself, cut into canvas
 * tiles that scroll with the content exactly like the text does. The pattern is computed from
 * each cell's position on the page (the same on every load) in a worker, nearest the screen
 * first, and sections choose their variety with `data-ground`. Tiles near the screen are drawn
 * before they arrive, and the shimmer keeps going while the page scrolls. A click sends a ring of lit characters through it; moving the cursor leaves no trail.
 */
export function Ground() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = ref.current
    if (!host) return
    const reduced = prefersReducedMotion()
    const tiles = new Map<number, Tile>()
    const pool: HTMLCanvasElement[] = []
    const pulses: { x: number; y: number; t0: number }[] = []
    /** Printed densities per page row; a row stays drawn until its new print arrives. */
    const rows = new Map<number, Float32Array>()
    /** Rows asked for and not printed yet. */
    const pending = new Set<number>()
    let layout: PrintLayout | null = null
    let key = ''
    let gen = 0
    let printedTo = 0
    let cols = 0
    let charW = CELL * 0.62
    let font = ''
    let dpr = 1
    /** One unit of the pattern: the viewport height, taken only when the width changes, so a
     * phone's toolbar sliding away mid-scroll never reprints the page. */
    let unit = 0
    let unitWidth = -1
    /** The ground's top in page px. */
    let pageTop = 0
    let raf = 0
    let measureRaf = 0
    let last = 0
    let sentFocus = -1
    let cancelled = false

    const viewTop = () => window.scrollY - pageTop
    const focusRow = () => Math.floor((viewTop() + window.innerHeight / 2) / CELL)

    let worker: Worker | null = null
    try {
      worker = new Worker(new URL('../../lib/ascii/ground.worker.ts', import.meta.url), {
        type: 'module',
      })
      worker.onmessage = (event: MessageEvent<GroundBatch>) => {
        const { gen: from, rows: list, data } = event.data
        if (from !== gen || !layout) return
        list.forEach((row, i) => store(row, data.subarray(i * cols, (i + 1) * cols)))
        kick()
      }
      worker.onerror = () => {
        // no worker after all: print on the main thread, a little each frame
        worker?.terminate()
        worker = null
        kick()
      }
    } catch {
      worker = null
    }

    const store = (row: number, data: Float32Array) => {
      rows.set(row, data)
      pending.delete(row)
      const tile = tiles.get(Math.floor(row / TILE_ROWS))
      if (tile) tile.drawn[row % TILE_ROWS] = 0
    }

    /** Asks for rows [from, to), keeping whatever an earlier request has not delivered yet. */
    const print = (from: number, to: number) => {
      if (!layout) return
      for (const row of pending) from = Math.min(from, row)
      pending.clear()
      for (let r = from; r < to; r++) pending.add(r)
      gen++
      sentFocus = focusRow()
      const job: GroundJob = { type: 'print', gen, layout, from, to, focus: sentFocus }
      worker?.postMessage(job)
      kick()
    }

    /** Without a worker: the pending rows nearest the screen, within a time budget. */
    const printHere = (budgetMs: number) => {
      if (!layout || pending.size === 0) return
      const start = performance.now()
      const focus = focusRow()
      const order = [...pending].sort((a, b) => Math.abs(a - focus) - Math.abs(b - focus))
      for (const row of order) {
        store(row, printRow(layout, row))
        if (performance.now() - start > budgetMs) return
      }
    }

    /** Sections, width and cell size → the layout; reprints only what the change can reach. */
    const measure = () => {
      measureRaf = 0
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const probe = document.createElement('canvas').getContext('2d')
      font = `500 ${(CELL * 0.86).toFixed(2)}px ${monoFamily()}`
      if (probe) {
        probe.font = font
        const w = probe.measureText('M').width
        if (w > 0) charW = w
      }
      const nextCols = Math.ceil(host.clientWidth / charW) + 1
      if (window.innerWidth !== unitWidth) {
        unitWidth = window.innerWidth
        unit = window.innerHeight
      }
      const hostRect = host.getBoundingClientRect()
      pageTop = hostRect.top + window.scrollY
      const spans: GroundSpan[] = []
      for (const el of document.querySelectorAll<HTMLElement>('[data-ground]')) {
        const r = el.getBoundingClientRect()
        spans.push({
          top: r.top - hostRect.top,
          bottom: r.bottom - hostRect.top,
          style: el.dataset.ground as GroundStyle,
        })
      }
      const next: PrintLayout = {
        cellW: charW,
        cellH: CELL,
        cols: nextCols,
        unit,
        width: unitWidth,
        spans,
      }
      const nextKey = layoutKey(next)
      const total = Math.ceil(host.clientHeight / CELL)
      let from: number
      if (nextKey !== key) {
        // a new grid: rows of the old width cannot be drawn into it
        if (nextCols !== cols) rows.clear()
        from = 0
      } else {
        const changed = layout ? firstChangedRow(layout.spans, spans, next) : 0
        from = Math.min(changed < 0 ? total : changed, printedTo)
      }
      key = nextKey
      cols = nextCols
      layout = next
      printedTo = total
      for (const tile of tiles.values()) sizeTile(tile)
      sync()
      if (from < total) print(from, total)
      kick()
    }

    const scheduleMeasure = () => {
      if (!measureRaf && !cancelled) measureRaf = requestAnimationFrame(measure)
    }

    /** Fits a tile's canvas to the page width; resizing clears it, so its rows draw again. */
    const sizeTile = (tile: Tile) => {
      const w = Math.round(host.clientWidth * dpr)
      const h = Math.round(TILE_H * dpr)
      if (tile.canvas.width !== w || tile.canvas.height !== h) {
        tile.canvas.width = w
        tile.canvas.height = h
        tile.drawn.fill(0)
      }
      if (tile.heat.length !== TILE_ROWS * cols) tile.heat = new Float32Array(TILE_ROWS * cols)
      tile.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      tile.ctx.font = font
      tile.ctx.textBaseline = 'top'
      if ('letterSpacing' in tile.ctx) tile.ctx.letterSpacing = '0px'
    }

    /** Keeps canvases for the tiles near the screen; far ones go back to the pool. */
    const sync = () => {
      if (!layout) return
      const top = viewTop()
      const h = window.innerHeight
      const first = Math.max(0, Math.floor((top - h * KEEP_ABOVE) / TILE_H))
      const lastTile = Math.min(
        Math.floor(host.clientHeight / TILE_H),
        Math.floor((top + h * (1 + KEEP_BELOW)) / TILE_H),
      )
      for (const [i, tile] of tiles) {
        if (i >= first && i <= lastTile) continue
        tile.canvas.remove()
        if (pool.length < POOL) pool.push(tile.canvas)
        tiles.delete(i)
      }
      for (let i = first; i <= lastTile; i++) {
        if (tiles.has(i)) continue
        const canvas = pool.pop() ?? document.createElement('canvas')
        canvas.className = styles.tile!
        canvas.style.top = `${i * TILE_H}px`
        const ctx = canvas.getContext('2d')
        if (!ctx) continue
        const tile: Tile = {
          index: i,
          canvas,
          ctx,
          heat: new Float32Array(TILE_ROWS * cols),
          dirty: false,
          drawn: new Uint8Array(TILE_ROWS),
        }
        sizeTile(tile)
        ctx.clearRect(0, 0, host.clientWidth, TILE_H)
        host.appendChild(canvas)
        tiles.set(i, tile)
      }
    }

    /** The tile's top relative to the top of the screen, from the scroll alone (no layout). */
    const screenTop = (tile: Tile) => tile.index * TILE_H - viewTop()
    const onScreen = (tile: Tile) => {
      const top = screenTop(tile)
      return top + TILE_H > 0 && top < window.innerHeight
    }
    /** On screen or within REACH of it. */
    const inReach = (tile: Tile) => {
      const top = screenTop(tile)
      const reach = window.innerHeight * REACH
      return top + TILE_H > -reach && top < window.innerHeight + reach
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
     * Draws a tile's rows: ones not drawn with their current pattern always (off screen only
     * within `budget`), and with `shimmer` the rows on screen and within REACH again.
     */
    const draw = (tile: Tile, t: number, shimmer: boolean, budget: { rows: number }) => {
      const { ctx, heat, drawn } = tile
      const width = host.clientWidth
      const top = screenTop(tile)
      const reach = window.innerHeight * REACH
      const visible = top + TILE_H > -reach && top < window.innerHeight + reach
      const from = Math.max(0, Math.floor((-top - reach) / CELL))
      const to = Math.min(TILE_ROWS, Math.ceil((window.innerHeight + reach - top) / CELL))
      const bands = INKS.length
      if (lines.length !== bands + 1 || lines[0]!.length !== cols) {
        lines = Array.from({ length: bands + 1 }, () => new Uint16Array(cols))
      }
      const used = new Array<boolean>(bands + 1)
      let warm = false
      for (let r = 0; r < TILE_ROWS; r++) {
        const row = tile.index * TILE_ROWS + r
        const base = rows.get(row)
        if (!base || base.length !== cols) continue
        const inView = r >= from && r < to
        if (drawn[r] && !(shimmer && inView)) continue
        if (!drawn[r] && !visible) {
          if (budget.rows <= 0) continue
          budget.rows--
        }
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
            const shimmerAt = reduced ? 1 : 0.8 + 0.2 * Math.sin(t * 0.9 + phase[c]!)
            level = (b * PEAK + 0.03) * shimmerAt * swell
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
      if (shimmer) tile.dirty = warm
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

    const undrawn = () => {
      for (const tile of tiles.values()) {
        for (let r = 0; r < TILE_ROWS; r++) {
          if (!tile.drawn[r] && rows.has(tile.index * TILE_ROWS + r)) return true
        }
      }
      return false
    }

    const frame = (now: number) => {
      raf = 0
      if (cancelled || document.hidden || !layout) return
      if (!worker) printHere(4)
      const due = now - last >= 1000 / FPS
      if (due) {
        last = now
        warm(now)
      }
      const budget = { rows: PREDRAW_ROWS }
      const order = [...tiles.values()].sort((a, b) => Number(onScreen(b)) - Number(onScreen(a)))
      for (const tile of order) {
        const shimmer = due && inReach(tile) && (!reduced || tile.dirty)
        draw(tile, now / 1000, shimmer, budget)
      }
      if (!reduced || pending.size > 0 || pulses.length > 0 || undrawn()) {
        raf = requestAnimationFrame(frame)
      }
    }

    const kick = () => {
      if (!raf && !cancelled) raf = requestAnimationFrame(frame)
    }

    const onScroll = () => {
      sync()
      // the worker prints next to where the reader now is
      const focus = focusRow()
      if (worker && pending.size > 0 && Math.abs(focus - sentFocus) > 24) {
        sentFocus = focus
        const msg: GroundFocus = { type: 'focus', focus }
        worker.postMessage(msg)
      }
      kick()
    }
    const onClick = (event: MouseEvent) => {
      if (reduced) return
      pulses.push({ x: event.clientX, y: event.clientY + viewTop(), t0: performance.now() })
      kick()
    }
    const onVisibility = () => kick()

    const ro = new ResizeObserver(scheduleMeasure)
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
      cancelAnimationFrame(measureRaf)
      worker?.terminate()
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
