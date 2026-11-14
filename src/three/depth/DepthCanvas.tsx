'use client'

import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping } from 'three'
import type { Tier } from '../quality'
import { DepthScene } from './DepthScene'

/** The corridor's own canvas (loaded lazily); it draws only while its section is on screen. */
export default function DepthCanvas({
  tier,
  running,
  still,
  progress,
  onReady,
  className,
}: {
  tier: Exclude<Tier, 'none'>
  running: boolean
  still: boolean
  progress: { current: number }
  onReady: () => void
  className?: string
}) {
  return (
    <div className={className}>
      <Canvas
        dpr={tier === 'high' ? [1, 1.5] : 1}
        frameloop={still ? 'demand' : running ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: ACESFilmicToneMapping }}
        camera={{ position: [0, 0, 9], fov: 50, near: 0.1, far: 40 }}
        onCreated={() => requestAnimationFrame(onReady)}
        aria-hidden="true"
      >
        <DepthScene progress={progress} still={still} />
      </Canvas>
    </div>
  )
}
