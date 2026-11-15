'use client'

import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping } from 'three'
import type { Tier } from '../quality'
import { HeroScene } from './HeroScene'

/** The hero's own canvas (loaded lazily). It stops drawing while the hero is off screen. */
export default function HeroCanvas({
  tier,
  running,
  still,
  progress,
  shift,
  onReady,
  className,
}: {
  tier: Exclude<Tier, 'none'>
  running: boolean
  still: boolean
  progress: { current: number }
  shift: number
  onReady: () => void
  className?: string
}) {
  return (
    <div className={className}>
      <Canvas
        dpr={tier === 'high' ? [1, 1.5] : 1}
        frameloop={still ? 'demand' : running ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: ACESFilmicToneMapping }}
        camera={{ position: [0, 0, 9], fov: 34, near: 0.1, far: 60 }}
        onCreated={() => requestAnimationFrame(onReady)}
        aria-hidden="true"
      >
        <HeroScene progress={progress} still={still} shift={shift} />
      </Canvas>
    </div>
  )
}
