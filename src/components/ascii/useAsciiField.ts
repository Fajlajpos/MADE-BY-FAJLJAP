'use client'

import { useEffect, type RefObject } from 'react'
import { mountCpuField } from '@/lib/ascii/cpu'
import { NO_TRAIL, loadKit, monoFamily, onSpotChange, RAMP } from '@/lib/ascii/env'
import { trackPointer } from '@/lib/ascii/pointer'
import type { ScenePainter } from '@/lib/ascii/scenes'

type Options = {
  /** Cell height in CSS px. */
  cellSize: number
  /** Mount at once instead of near the viewport. */
  eager?: boolean
  /** Source pixels per CSS pixel; shapes want more detail than photos. */
  detail?: number
  /** Ink token for the characters. */
  ink?: string
}

/**
 * Mounts a character field in `ref`'s element and feeds it a painter each frame: the GPU field
 * (asciify kit `mountSurface`, with the liquid wake in the print colour) or, without a GPU, the
 * CPU renderer. `makePainter` may be async (a photo to load) and runs once per mount.
 * Sets `data-ascii="gpu" | "cpu"` on the element once something draws.
 */
export function useAsciiField(
  ref: RefObject<HTMLElement | null>,
  makePainter: () => ScenePainter | Promise<ScenePainter>,
  { cellSize, eager = false, detail = 1 / 3, ink = '--ascii-ink-strong' }: Options,
  deps: readonly unknown[],
) {
  useEffect(() => {
    const host = ref.current
    if (!host) return
    let cancelled = false
    let cleanup = () => {}
    const tracked = trackPointer(host)

    void (async () => {
      const [painter, kit] = await Promise.all([makePainter(), loadKit(), document.fonts?.ready])
      if (cancelled) return
      const cell = host.clientWidth < 360 ? Math.max(6, cellSize - 2) : cellSize

      const surface = kit?.mountSurface({
        host,
        kit: { current: { lazy: !eager } },
        layer: 'under',
        resolution: (w, h) => [
          Math.max(8, Math.round(w * detail)),
          Math.max(8, Math.round(h * detail)),
        ],
        look: () => ({
          charset: RAMP,
          cellSize: cell,
          cellAspect: 0.62,
          font: monoFamily(),
          fontWeight: 500,
          glyphScale: 0.92,
          contrast: 1.1,
          shade: 0.3,
          levels: 'none',
          ...NO_TRAIL,
          highlight: kit.resolveColor('--ascii-wake', host) ?? 'auto',
        }),
        ink: () => ink,
        reducedMotion: () => undefined,
        paint: ({ pen, width, height, now, still }) => {
          painter(pen, width, height, still ? 4 : now / 1000, tracked.pointer)
          return !still
        },
      })

      if (surface) {
        host.dataset.ascii = 'gpu'
        const offSpot = onSpotChange(() => surface.refresh())
        cleanup = () => {
          offSpot()
          surface.destroy()
        }
        return
      }

      const cpu = mountCpuField({ host, paint: painter, cellSize: cell, ink, trail: false })
      host.dataset.ascii = 'cpu'
      cleanup = () => cpu.destroy()
    })()

    return () => {
      cancelled = true
      cleanup()
      tracked.destroy()
      delete host.dataset.ascii
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
