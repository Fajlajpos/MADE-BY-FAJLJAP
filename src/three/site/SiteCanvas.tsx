'use client'

import { View } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping } from 'three'
import type { Tier } from '../quality'
import { KitProvider } from './ChromeObject'

/**
 * One transparent canvas fixed over the page (under the header, never catching the pointer).
 * Every <Slot3D/> on the page is a drei View: its object is drawn into the slot's own rectangle
 * with a scissor, so one WebGL context serves all of them, and slots off screen cost nothing.
 */
export default function SiteCanvas({ tier }: { tier: Exclude<Tier, 'none'> }) {
  return (
    <Canvas
      aria-hidden="true"
      dpr={tier === 'high' ? [1, 1.75] : 1}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: ACESFilmicToneMapping }}
      style={{ position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none' }}
      eventPrefix="client"
    >
      <KitProvider>
        <View.Port />
      </KitProvider>
    </Canvas>
  )
}
