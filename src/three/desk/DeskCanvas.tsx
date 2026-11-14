'use client'

import { PerformanceMonitor } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useState, type RefObject } from 'react'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { DeskScene, type DeskSceneProps } from './DeskScene'

// the monitor and the window light the room as area lights
RectAreaLightUniformsLib.init()

type Props = DeskSceneProps & {
  /** Pause the frame loop while the hero is off screen. */
  running: boolean
  /** The stage element: pointer events over the copy and labels still reach the scene. */
  eventSource: RefObject<HTMLElement | null>
  className?: string
}

/**
 * The canvas for the night desk. Loaded with next/dynamic (ssr: false) only once the stage knows
 * the device can take it. One WebGL context; postprocessing renders every frame through
 * tone mapping (AgX) and the character effect.
 */
export default function DeskCanvas({ running, eventSource, className, ...scene }: Props) {
  const [dpr, setDpr] = useState<number | [number, number]>(scene.tier === 'high' ? [1, 2] : 1)
  return (
    <div className={className}>
    <Canvas
      dpr={dpr}
      frameloop={scene.still ? 'demand' : running ? 'always' : 'never'}
      shadows={scene.tier === 'high' ? 'percentage' : false}
      gl={{ antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' }}
      camera={{ fov: 30, near: 0.02, far: 140, position: [1.3, 1.62, 1.75] }}
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} />
      <DeskScene {...scene} />
    </Canvas>
    </div>
  )
}
