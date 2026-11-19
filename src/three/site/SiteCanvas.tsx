'use client'

import { View } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import { liveSlots } from './context'
import { ACESFilmicToneMapping } from 'three'
import type { Tier } from '../quality'
import { ChromeObject, KitProvider, type ObjectKind } from './ChromeObject'

/** Every object a slot on the page can show; their shaders are compiled up front. */
const KINDS: ObjectKind[] = ['browser', 'parcel', 'phone', 'pen', 'plane', 'camera', 'play', 'tag', 'mug', 'wordmark']

/**
 * One transparent canvas fixed over the page (under the header, never catching the pointer).
 * Every <Slot3D/> on the page is a drei View: its object is drawn into the slot's own rectangle
 * with a scissor, so one WebGL context serves all of them. Slots off screen are not drawn,
 * and with none near, the canvas stops drawing.
 */
export default function SiteCanvas({ tier }: { tier: Exclude<Tier, 'none'> }) {
  // draw only while some slot is near the screen; the first frames run regardless (warm-up)
  const [live, setLive] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLive(liveSlots.get() > 0), 1500)
    const off = liveSlots.subscribe((n) => setLive(n > 0))
    return () => {
      clearTimeout(t)
      off()
    }
  }, [])
  return (
    <Canvas
      aria-hidden="true"
      frameloop={live ? 'always' : 'never'}
      dpr={tier === 'high' ? [1, 1.25] : 1}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: ACESFilmicToneMapping }}
      // a soft warm halo around every object, following its shape (the canvas is transparent)
      style={{ position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none', filter: 'drop-shadow(0 0 30px rgb(255 255 255 / 0.18)) drop-shadow(0 0 70px rgb(255 255 255 / 0.12))' }}
      eventPrefix="client"
    >
      <KitProvider>
        <ClearWhenIdle live={live} />
        <Warmup />
        <View.Port />
      </KitProvider>
    </Canvas>
  )
}

/**
 * Compiles the shaders of every object once, right after the canvas starts, with the same two
 * lamps a slot's view has. Without it, each object compiles the first time it scrolls into view,
 * and the page stutters there (the work section, where the mug and the phone first appear).
 * The objects are scaled to nothing, so this draws no pixels; they are removed when it is done.
 */
function Warmup() {
  const { gl, scene, camera } = useThree()
  const [done, setDone] = useState(false)
  useEffect(() => {
    let cancelled = false
    const id = requestAnimationFrame(() => {
      gl.compileAsync(scene, camera)
        .catch(() => undefined)
        .finally(() => {
          if (!cancelled) setDone(true)
        })
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(id)
    }
  }, [gl, scene, camera])
  if (done) return null
  return (
    <group scale={0.0001}>
      <pointLight intensity={0} decay={2} distance={0} />
      <pointLight intensity={0} decay={2} distance={0} />
      {KINDS.map((kind) => (
        <group key={kind}>
          <ChromeObject kind={kind} />
        </group>
      ))}
    </group>
  )
}

/** When the canvas stops, wipe its last frame, or the objects would hang over the page. */
function ClearWhenIdle({ live }: { live: boolean }) {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    if (live) return
    gl.setScissorTest(false)
    gl.clear()
  }, [live, gl])
  return null
}
