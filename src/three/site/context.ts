'use client'

import { createContext, useContext } from 'react'
import type { Tier } from '../quality'

/** Whether the shared 3D canvas is up (set by <ThreeRoot/>); slots draw their fallback until then. */
export const ThreeContext = createContext<{ enabled: boolean; tier: Tier | null }>({
  enabled: false,
  tier: null,
})

export function useThreeEnabled(): boolean {
  return useContext(ThreeContext).enabled
}

/**
 * How many slots are near the screen right now. The shared canvas draws only while there is at
 * least one; with none (a stretch of plain page) it stops altogether.
 */
let live = 0
const listeners = new Set<(n: number) => void>()
export const liveSlots = {
  add() {
    live++
    listeners.forEach((l) => l(live))
  },
  remove() {
    live = Math.max(0, live - 1)
    listeners.forEach((l) => l(live))
  },
  get: () => live,
  subscribe(l: (n: number) => void) {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
}
