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
