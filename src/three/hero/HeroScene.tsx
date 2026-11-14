'use client'

import { RoundedBox } from '@react-three/drei'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useMemo, useRef, type ReactNode } from 'react'
import { Euler, MathUtils, Plane, Quaternion, Raycaster, Vector2, Vector3, type Group, type PointLight } from 'three'
import { useChromeKit, type ChromeKit } from '../chrome/materials'
import {
  BrowserShape,
  MugShape,
  ParcelShape,
  PenShape,
  PhoneShape,
  PlaneShape,
  PlayShape,
  TagShape,
  type MaterialSet,
} from '../objects/shapes'

/**
 * The hero: a cluster of polished chrome — the things I make (a browser, a parcel, a phone, a pen
 * nib, a paper plane, a play button, a price tag, my mug) and a few pure forms between them.
 * Each one is a body on a spring toward its place in the cluster; bodies push each other apart,
 * the cursor pushes them away, a click knocks one spinning. As the hero scrolls out, the cluster
 * opens up and drifts toward the camera. A warm light follows the cursor, so the chrome flashes
 * where you point. No shadows, no postprocessing: it has to stay smooth.
 */

type Kind =
  | 'browser'
  | 'parcel'
  | 'phone'
  | 'pen'
  | 'plane'
  | 'play'
  | 'tag'
  | 'mug'
  | 'sphere'
  | 'torus'
  | 'pill'
  | 'cube'
  | 'ring'
  | 'drop'

type BodyDef = { kind: Kind; home: [number, number, number]; scale: number; radius: number; spin: number }

/** The cluster, in world units around the origin (camera at z = 9). */
const BODIES: BodyDef[] = [
  { kind: 'browser', home: [0.2, 0.55, 0.4], scale: 1.25, radius: 1.05, spin: 0.25 },
  { kind: 'parcel', home: [2.15, -0.55, -0.2], scale: 0.95, radius: 0.8, spin: 0.3 },
  { kind: 'phone', home: [-1.75, -0.35, 0.3], scale: 1, radius: 0.72, spin: 0.35 },
  { kind: 'pen', home: [1.55, 1.75, -0.4], scale: 0.85, radius: 0.6, spin: 0.4 },
  { kind: 'plane', home: [-1.3, 1.75, -0.6], scale: 0.9, radius: 0.65, spin: 0.3 },
  { kind: 'play', home: [0.55, -1.75, 0.6], scale: 0.85, radius: 0.62, spin: 0.35 },
  { kind: 'tag', home: [2.75, 1.05, 0.5], scale: 0.7, radius: 0.55, spin: 0.45 },
  { kind: 'mug', home: [-2.85, 0.95, -0.4], scale: 0.75, radius: 0.55, spin: 0.3 },
  { kind: 'sphere', home: [-0.8, -1.55, -0.8], scale: 0.55, radius: 0.55, spin: 0.2 },
  { kind: 'torus', home: [3.2, -1.6, -0.6], scale: 0.62, radius: 0.62, spin: 0.5 },
  { kind: 'pill', home: [-2.9, -1.5, 0.2], scale: 0.6, radius: 0.55, spin: 0.45 },
  { kind: 'cube', home: [-0.25, 2.35, -1.2], scale: 0.55, radius: 0.5, spin: 0.4 },
  { kind: 'ring', home: [1.7, 0.2, 1.4], scale: 0.5, radius: 0.48, spin: 0.6 },
  { kind: 'drop', home: [-3.6, -0.15, -1], scale: 0.45, radius: 0.42, spin: 0.3 },
  { kind: 'sphere', home: [3.85, 0.1, -1.2], scale: 0.32, radius: 0.32, spin: 0.2 },
  { kind: 'torus', home: [-1.9, 2.75, -1.4], scale: 0.38, radius: 0.38, spin: 0.7 },
]

type Body = {
  def: BodyDef
  pos: Vector3
  vel: Vector3
  rot: Quaternion
  angVel: Vector3
  /** A short flash of extra brightness after a knock. */
  kick: number
}

export function HeroScene({
  progress,
  still,
  shift,
}: {
  /** 0 while the hero fills the screen, 1 when it has scrolled away. */
  progress: { current: number }
  still: boolean
  /** Horizontal offset of the whole cluster (it sits right of the copy on a wide screen). */
  shift: number
}) {
  const kit = useChromeKit()
  const sets = useMemo(() => makeSets(kit), [kit])
  const groups = useRef<(Group | null)[]>([])
  const cluster = useRef<Group>(null)
  const lamp = useRef<PointLight>(null)
  const pointer = useRef({ world: new Vector3(99, 99, 0), active: false, last: new Vector2() })
  const raycaster = useMemo(() => new Raycaster(), [])
  const plane = useMemo(() => new Plane(new Vector3(0, 0, 1), 0), [])
  const tmp = useMemo(() => ({ a: new Vector3(), b: new Vector3(), q: new Quaternion(), e: new Euler() }), [])
  const { camera, size } = useThree()
  const narrow = size.width < 700
  const scale = narrow ? 0.5 : size.width < 1100 ? 0.62 : 0.74
  // the cluster's resting place: upper right on a wide screen, the top half on a phone
  const lift = narrow ? 1.05 : 0.62

  const bodies = useMemo<Body[]>(
    () =>
      BODIES.map((def, i) => ({
        def,
        pos: new Vector3(...def.home).multiplyScalar(1.6).add(new Vector3(0, 0, -4)),
        vel: new Vector3(),
        rot: new Quaternion().setFromEuler(new Euler(0.3 * i, 0.7 * i, 0.2 * i)),
        angVel: new Vector3(0.1 * Math.sin(i), def.spin, 0.08 * Math.cos(i)),
        kick: 0,
      })),
    [],
  )

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const p = progress.current
    const t = state.clock.elapsedTime

    // where the cursor meets the plane of the cluster
    raycaster.setFromCamera(state.pointer, camera)
    const hit = raycaster.ray.intersectPlane(plane, tmp.a)
    const moved = state.pointer.distanceTo(pointer.current.last) > 0.0005
    pointer.current.last.copy(state.pointer)
    if (hit && moved) {
      pointer.current.world.copy(hit)
      pointer.current.active = true
    }
    if (lamp.current) {
      lamp.current.position.set(pointer.current.world.x, pointer.current.world.y, 3.2)
    }

    // the cluster opens up and comes forward as the hero leaves
    const spread = 1 + p * 1.9
    if (cluster.current) {
      cluster.current.position.set(shift * (1 - p * 0.6), lift + p * 1.4, p * 2.2)
      cluster.current.scale.setScalar(scale)
    }

    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i]!
      const home = tmp.b.set(...b.def.home).multiplyScalar(spread)
      if (still) {
        b.pos.copy(home)
        continue
      }
      // spring home, with a slow breathing drift so the cluster is never frozen
      home.x += Math.sin(t * 0.4 + i) * 0.08
      home.y += Math.cos(t * 0.5 + i * 1.3) * 0.1
      b.vel.addScaledVector(home.sub(b.pos), 3.2 * dt)

      // the cursor pushes (in the cluster's own space)
      const origin = cluster.current?.position
      const local = tmp.a.copy(pointer.current.world)
      if (origin) local.sub(origin)
      local.divideScalar(scale)
      const away = b.pos.clone().sub(local)
      away.z *= 0.4
      const d = away.length()
      const reach = 1.9 + b.def.radius
      if (pointer.current.active && d < reach) {
        const f = (1 - d / reach) ** 2 * 26
        b.vel.addScaledVector(away.normalize(), f * dt)
        b.angVel.x += away.y * f * dt * 0.6
        b.angVel.y += away.x * f * dt * 0.6
      }

      // bodies keep out of each other
      for (let j = i + 1; j < bodies.length; j++) {
        const o = bodies[j]!
        const sep = b.pos.clone().sub(o.pos)
        const dist = sep.length() || 0.0001
        const min = (b.def.radius + o.def.radius) * 0.95
        if (dist < min) {
          const push = sep.multiplyScalar(((min - dist) / dist) * 0.5)
          b.pos.add(push)
          o.pos.sub(push)
          b.vel.addScaledVector(push, 4)
          o.vel.addScaledVector(push, -4)
        }
      }

      b.vel.multiplyScalar(Math.exp(-2.6 * dt))
      b.pos.addScaledVector(b.vel, dt)

      // spin: an idle turn plus whatever the knocks gave it, slowly settling back
      b.angVel.y = MathUtils.lerp(b.angVel.y, b.def.spin, 0.6 * dt)
      b.angVel.x = MathUtils.lerp(b.angVel.x, 0, 0.6 * dt)
      b.angVel.z = MathUtils.lerp(b.angVel.z, 0, 0.6 * dt)
      tmp.e.set(b.angVel.x * dt, b.angVel.y * dt, b.angVel.z * dt)
      b.rot.multiply(tmp.q.setFromEuler(tmp.e))
      b.kick = Math.max(0, b.kick - dt * 1.6)
    }

    for (let i = 0; i < bodies.length; i++) {
      const g = groups.current[i]
      const b = bodies[i]!
      if (!g) continue
      g.position.copy(b.pos)
      g.quaternion.copy(b.rot)
      g.scale.setScalar(b.def.scale * (1 + b.kick * 0.08))
    }
  })

  const knock = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const b = bodies[i]
    if (!b || still) return
    const dir = b.pos.clone().sub(e.point).normalize()
    b.vel.addScaledVector(dir, 6).add(new Vector3(0, 0, -2))
    b.angVel.set((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6)
    b.kick = 1
  }

  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[-4, 6, 6]} intensity={1.4} color="#ffffff" />
      <pointLight ref={lamp} position={[2, 1, 3.2]} intensity={28} distance={9} decay={1.6} color="#ffd2a8" />
      <group ref={cluster}>
        {BODIES.map((def, i) => (
          <group
            key={i}
            ref={(g) => {
              groups.current[i] = g
            }}
            onPointerDown={knock(i)}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = '')}
          >
            <Shape kind={def.kind} sets={sets} />
          </group>
        ))}
      </group>
    </>
  )
}

type Sets = { chrome: MaterialSet; dark: MaterialSet; kit: ChromeKit }

function makeSets(kit: ChromeKit): Sets {
  return {
    kit,
    chrome: { body: kit.chrome, accent: kit.orange, accent2: kit.dark, inset: kit.dark, label: kit.enamel },
    dark: { body: kit.dark, accent: kit.chrome, accent2: kit.orange, inset: kit.chrome },
  }
}

function Shape({ kind, sets }: { kind: Kind; sets: Sets }): ReactNode {
  const { chrome, kit } = sets
  switch (kind) {
    case 'browser':
      return <BrowserShape set={chrome} />
    case 'parcel':
      return <ParcelShape set={chrome} />
    case 'phone':
      return <PhoneShape set={chrome} />
    case 'pen':
      return <PenShape set={chrome} />
    case 'plane':
      return <PlaneShape set={chrome} />
    case 'play':
      return <PlayShape set={chrome} />
    case 'tag':
      return <TagShape set={chrome} />
    case 'mug':
      return <MugShape set={{ body: kit.chrome, accent: kit.orange, accent2: kit.orange, inset: kit.dark }} />
    case 'sphere':
      return (
        <mesh material={kit.chrome}>
          <sphereGeometry args={[1, 48, 32]} />
        </mesh>
      )
    case 'torus':
      return (
        <mesh material={kit.chrome}>
          <torusGeometry args={[0.72, 0.3, 32, 72]} />
        </mesh>
      )
    case 'pill':
      return (
        <mesh material={kit.orange} rotation={[0, 0, 0.6]}>
          <capsuleGeometry args={[0.42, 0.9, 12, 32]} />
        </mesh>
      )
    case 'cube':
      return <RoundedBox args={[1.4, 1.4, 1.4]} radius={0.22} smoothness={6} material={kit.dark} />
    case 'ring':
      return (
        <mesh material={kit.chrome}>
          <torusGeometry args={[0.85, 0.12, 24, 96]} />
        </mesh>
      )
    case 'drop':
      return (
        <mesh material={kit.chrome} scale={[1, 1.35, 1]}>
          <sphereGeometry args={[0.8, 48, 32]} />
        </mesh>
      )
  }
}
