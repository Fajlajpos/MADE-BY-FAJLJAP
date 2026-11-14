'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Color, Fog, MathUtils, type Group, type PointLight } from 'three'
import { useChromeKit } from '../chrome/materials'
import { makeSets, Shape, type Kind } from '../hero/HeroScene'

/**
 * A corridor of chrome you fly down while you scroll: the same things as in the hero, scattered
 * around a tunnel that runs 70 units into the dark. Fog swallows what is far, a warm light rides
 * with the camera, so things flash as you pass them. At the end the camera goes through a ring.
 */

const LENGTH = 70
const COUNT = 40
const KINDS: Kind[] = ['browser', 'sphere', 'pen', 'torus', 'parcel', 'pill', 'phone', 'ring', 'mug', 'drop', 'plane', 'cube', 'play', 'sphere', 'tag', 'torus']

type Item = { kind: Kind; x: number; y: number; z: number; s: number; rx: number; ry: number; spin: number }

/** A small seeded random, so the corridor is the same on every visit. */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function layout(): Item[] {
  const r = rng(7)
  const items: Item[] = []
  for (let i = 0; i < COUNT; i++) {
    const a = i * 2.39996 + r() * 0.6
    const rad = 2.3 + r() * 2.6
    items.push({
      kind: KINDS[i % KINDS.length]!,
      x: Math.cos(a) * rad * 1.35,
      y: Math.sin(a) * rad * 0.8,
      z: -2 - (i / COUNT) * LENGTH + (r() - 0.5) * 1.5,
      s: 0.45 + r() * 0.6,
      rx: r() * Math.PI,
      ry: r() * Math.PI,
      spin: (r() - 0.5) * 0.9,
    })
  }
  return items
}

export function DepthScene({ progress, still }: { progress: { current: number }; still: boolean }) {
  const kit = useChromeKit()
  const sets = useMemo(() => makeSets(kit), [kit])
  const items = useMemo(() => layout(), [])
  const groups = useRef<(Group | null)[]>([])
  const lamp = useRef<PointLight>(null)
  const ring = useRef<Group>(null)
  const eased = useRef(still ? 0.35 : 0)
  const { scene, size, gl, camera } = useThree()
  // on a narrow screen the tunnel pulls in, so the sides stay in view
  const squeeze = Math.max(0.5, Math.min(1, size.width / size.height / 1.6))

  useEffect(() => {
    scene.fog = new Fog(new Color('#08080a'), 5, 30)
    return () => {
      scene.fog = null
    }
  }, [scene])

  // compile the shaders while the corridor is still far below, so entering it does not stutter
  useEffect(() => {
    void gl.compileAsync(scene, camera).catch(() => undefined)
  }, [gl, scene, camera])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const target = still ? 0.35 : progress.current
    eased.current = MathUtils.damp(eased.current, target, 5, dt)
    const p = eased.current
    const cam = state.camera
    cam.position.z = 9 - p * (LENGTH + 12)
    cam.position.x = MathUtils.damp(cam.position.x, state.pointer.x * 0.9, 3, dt)
    cam.position.y = MathUtils.damp(cam.position.y, state.pointer.y * 0.6, 3, dt)
    cam.lookAt(cam.position.x * 0.4, cam.position.y * 0.4, cam.position.z - 10)
    if (lamp.current) lamp.current.position.set(cam.position.x + state.pointer.x * 3, cam.position.y + state.pointer.y * 2, cam.position.z - 3)
    if (still) return
    for (let i = 0; i < items.length; i++) {
      const g = groups.current[i]
      const it = items[i]!
      if (!g) continue
      g.rotation.y += it.spin * dt
      g.rotation.x += it.spin * 0.4 * dt
    }
    if (ring.current) ring.current.rotation.z += 0.15 * dt
  })

  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight position={[-4, 6, 6]} intensity={0.9} />
      <pointLight ref={lamp} intensity={46} distance={16} decay={1.5} color="#ffd2a8" />
      {items.map((it, i) => (
        <group
          key={i}
          ref={(g) => {
            groups.current[i] = g
          }}
          position={[it.x * squeeze, it.y, it.z]}
          rotation={[it.rx, it.ry, 0]}
          scale={it.s}
        >
          <Shape kind={it.kind} sets={sets} />
        </group>
      ))}
      {/* the ring at the end, which the camera passes through */}
      <group ref={ring} position={[0, 0, -LENGTH - 4]}>
        <mesh material={kit.chrome}>
          <torusGeometry args={[3.4, 0.22, 32, 160]} />
        </mesh>
      </group>
    </>
  )
}
