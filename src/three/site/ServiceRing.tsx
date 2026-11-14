'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { MathUtils, type Group } from 'three'
import type { ServiceObject } from '@/content/home'
import { ChromeObject } from './ChromeObject'

/**
 * The four services in chrome, standing on a ring. Scrolling through the list turns the ring so
 * the active one comes to the front (bigger), the others wait at the sides and behind.
 * `land` (0–1) is how far the section has come into view: the ring drops in from above,
 * picking up where the things flew out of the hero.
 */
export function ServiceRing({
  objects,
  active,
  land,
  still,
}: {
  objects: ServiceObject[]
  active: { current: number }
  land: { current: number }
  still: boolean
}) {
  const ring = useRef<Group>(null)
  const items = useRef<(Group | null)[]>([])
  const spins = useRef<(Group | null)[]>([])
  const step = (Math.PI * 2) / objects.length

  useFrame((state, dt) => {
    const r = ring.current
    if (!r) return
    const l = still ? 1 : land.current
    const eased = 1 - Math.pow(1 - MathUtils.clamp(l, 0, 1), 3)
    r.position.y = (1 - eased) * 3.4
    const target = -active.current * step
    r.rotation.y = still ? target : MathUtils.damp(r.rotation.y, target + (1 - eased) * 2.4, 5, dt)
    items.current.forEach((g, i) => {
      if (!g) return
      const isActive = i === active.current
      g.scale.setScalar(MathUtils.damp(g.scale.x, isActive ? 0.78 : 0.34, 6, dt))
      const s = spins.current[i]
      if (s && !still) s.rotation.y = -0.4 + Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.6 + (isActive ? 0 : 0.3)
    })
  })

  return (
    <group ref={ring} position={[0, 3.4, 0]}>
      {objects.map((kind, i) => {
        const a = i * step
        return (
          // each one faces outward from the ring's centre
          <group key={kind} position={[Math.sin(a) * 1.25, 0, Math.cos(a) * 1.25]} rotation={[0, a, 0]}>
            <group
              ref={(g) => {
                items.current[i] = g
              }}
              scale={0.34}
            >
              <group
                ref={(g) => {
                  spins.current[i] = g
                }}
                rotation={[-0.1, -0.4, 0]}
              >
                <ChromeObject kind={kind} />
              </group>
            </group>
          </group>
        )
      })}
    </group>
  )
}
