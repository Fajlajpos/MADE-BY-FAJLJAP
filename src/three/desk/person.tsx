'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type ReactNode, type RefObject } from 'react'
import {
  Color,
  MathUtils,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
  type Group,
  type Material,
  type PointLight,
} from 'three'
import { ModelSlot } from '../ModelSlot'
import { deskProgress } from '../scroll'
import type { ScenePalette } from '../tokens'
import { LAMP, PLACE, SCREEN } from './layout'

/**
 * Me, at the desk: a figure in a hoodie on an office chair, seen mostly from behind against the
 * screen — the monitor rims the outline, the lamp warms the left shoulder. Built from smooth
 * shapes (capsules, spheres, a torus for the lowered hood), dark matte fabric with a little
 * sheen so the edges catch the light.
 * Alive: breathes, types in bursts, the chair rocks a little; now and then glances at the phone or
 * out of the window; when the cursor (the lamp) passes over him, he looks back over his shoulder;
 * at the end of the hero he leans back and watches the things fly off.
 * Swappable: `desk.person` in src/content/models.ts takes a .glb (a scan of me). A loaded model
 * keeps the breathing and the chair's rocking; the head and hands are the stand-in's.
 */

type V3 = [number, number, number]

/** The figure sits centred on the keyboard; coordinates below are relative to this x. */
const X = PLACE.keyboard[0]

const HIP: V3 = [0, 0.52, 0.74]
const SHOULDER_L: V3 = [-0.19, 1.11, 0.68]
const SHOULDER_R: V3 = [0.19, 1.11, 0.68]
const ELBOW_L: V3 = [-0.25, 0.9, 0.5]
const ELBOW_R: V3 = [0.25, 0.9, 0.5]
const WRIST_L: V3 = [-0.13, 0.79, 0.2]
const WRIST_R: V3 = [0.11, 0.79, 0.2]
/** The neck's top: the head turns about this point. */
const NECK: V3 = [0, 1.25, 0.655]

/** Where he looks, in world space. */
const LOOK = {
  screen: new Vector3(SCREEN.center[0] + 0.04, SCREEN.center[1] - 0.02, SCREEN.center[2]),
  phone: new Vector3(0.28, 0.76, 0.27),
  window: new Vector3(0.75, 1.45, -0.45),
  sky: new Vector3(0.35, 2.3, 0.1),
}

const up = new Vector3(0, 1, 0)

/** A capsule from `a` to `b` (a limb, a sleeve). */
function Limb({ a, b, r, material, shadows }: { a: V3; b: V3; r: number; material: Material; shadows: boolean }) {
  const { position, quaternion, length } = useMemo(() => {
    const va = new Vector3(...a)
    const vb = new Vector3(...b)
    const dir = vb.clone().sub(va)
    return {
      position: va.clone().add(vb).multiplyScalar(0.5),
      quaternion: new Quaternion().setFromUnitVectors(up, dir.clone().normalize()),
      length: dir.length(),
    }
  }, [a, b])
  return (
    <mesh position={position} quaternion={quaternion} material={material} castShadow={shadows}>
      <capsuleGeometry args={[r, Math.max(0.001, length - r), 6, 16]} />
    </mesh>
  )
}

export function Person({
  palette,
  lampOn,
  shadows,
  still,
}: {
  palette: ScenePalette
  lampOn: boolean
  shadows: boolean
  still: boolean
}) {
  const mats = useMemo(() => {
    // the hoodie: near black, matte, a warm sheen at grazing angles (the fabric's fuzz)
    const hoodie = new MeshPhysicalMaterial({
      color: new Color('#17181b'),
      roughness: 0.92,
      sheen: 1,
      sheenColor: new Color('#6d6a66'),
      sheenRoughness: 0.45,
    })
    const cuff = new MeshPhysicalMaterial({ color: new Color('#121315'), roughness: 0.95, sheen: 0.6, sheenColor: new Color('#55524e') })
    const jeans = new MeshStandardMaterial({ color: new Color('#15171d'), roughness: 0.9 })
    const skin = new MeshPhysicalMaterial({ color: new Color('#a07a62'), roughness: 0.62, sheen: 0.4, sheenColor: new Color('#ffcfb0') })
    const hair = new MeshPhysicalMaterial({ color: new Color('#0d0b0a'), roughness: 0.7, sheen: 1, sheenColor: new Color('#3a332e'), sheenRoughness: 0.35 })
    const phones = new MeshStandardMaterial({ color: new Color('#101114'), roughness: 0.4, metalness: 0.5 })
    const chair = new MeshStandardMaterial({ color: new Color('#0f1013'), roughness: 0.75 })
    const steel = new MeshStandardMaterial({ color: new Color('#3b3d42'), roughness: 0.35, metalness: 0.85 })
    return { hoodie, cuff, jeans, skin, hair, phones, chair, steel }
  }, [])
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])

  const body = useRef<Group>(null)
  const torso = useRef<Group>(null)
  const head = useRef<Group>(null)
  const handL = useRef<Group>(null)
  const handR = useRef<Group>(null)
  const kicker = useRef<PointLight>(null)

  const look = useRef({ yaw: 0, pitch: -0.25, glance: 0 })
  const neckWorld = useMemo(() => new Vector3(), [])
  const target = useMemo(() => new Vector3(), [])
  const ndc = useMemo(() => new Vector3(), [])
  const lamp = useRef(lampOn ? 1 : 0)

  useFrame((state, dt) => {
    const t = still ? 0 : state.clock.elapsedTime
    const p = still ? 0.18 : deskProgress.value
    const lift = MathUtils.smoothstep(p, 0.58, 0.76)

    // the lamp on his shoulder follows the switch
    lamp.current = still ? (lampOn ? 1 : 0) : MathUtils.damp(lamp.current, lampOn ? 1 : 0, 9, dt)
    if (kicker.current) kicker.current.intensity = 0.55 * lamp.current * (1 - 0.7 * MathUtils.smoothstep(p, 0.72, 0.95))

    // breathing and the chair's rocking
    const breath = Math.sin(t * 1.55)
    if (body.current) body.current.rotation.y = still ? 0 : 0.03 * Math.sin(t * 0.33) + 0.012 * Math.sin(t * 0.81)
    if (torso.current) {
      torso.current.scale.set(1 + 0.006 * breath, 1 + 0.008 * breath, 1 + 0.012 * breath)
      // leans back to watch the things fly off
      torso.current.rotation.x = MathUtils.lerp(0, 0.12, lift)
    }

    // where to look: the screen, with glances at the phone and the window; up at the end
    const cycle = t % 21
    target.copy(LOOK.screen)
    if (!still) {
      if (cycle > 11.5 && cycle < 13.8) target.copy(LOOK.phone)
      else if (cycle > 17.2 && cycle < 19) target.copy(LOOK.window)
      // small saccades across the page
      target.x += 0.08 * Math.sin(t * 0.9) * Math.sin(t * 0.37)
      target.y += 0.03 * Math.sin(t * 0.55)
    }
    target.lerp(LOOK.sky, lift)

    // the cursor (the lamp) over him: he looks back over his shoulder, at the camera
    let glanceTo = 0
    if (!still && head.current && lift < 0.5) {
      head.current.getWorldPosition(neckWorld)
      ndc.copy(neckWorld).project(state.camera)
      const aspect = state.size.width / state.size.height
      const dx = (ndc.x - state.pointer.x) * aspect
      const dy = ndc.y + 0.12 - state.pointer.y
      if (Math.hypot(dx, dy) < 0.32) glanceTo = 1
    }
    look.current.glance = MathUtils.damp(look.current.glance, glanceTo, 3, dt)
    target.lerp(state.camera.position, look.current.glance * 0.85)

    // yaw and pitch toward the target from the neck, in the body's frame (he faces -z)
    neckWorld.set(X + NECK[0], NECK[1], NECK[2])
    const d = target.sub(neckWorld)
    const yaw = MathUtils.clamp(Math.atan2(-d.x, -d.z) - (body.current?.rotation.y ?? 0), -1.15, 1.15)
    const pitch = MathUtils.clamp(Math.atan2(d.y, Math.hypot(d.x, d.z)), -0.75, 0.6)
    const speed = still ? 1000 : 4.5
    look.current.yaw = MathUtils.damp(look.current.yaw, yaw, speed, dt)
    look.current.pitch = MathUtils.damp(look.current.pitch, pitch, speed, dt)
    if (head.current) {
      head.current.rotation.set(look.current.pitch - (torso.current?.rotation.x ?? 0), look.current.yaw * 0.75, 0, 'YXZ')
    }
    // the shoulders follow the head a little
    if (torso.current) torso.current.rotation.y = look.current.yaw * 0.22

    // typing: in bursts, only while looking at the screen
    const atScreen = 1 - Math.max(look.current.glance, lift, cycle > 11.2 && cycle < 14.2 ? 1 : 0)
    const burst = still ? 0 : MathUtils.smoothstep(Math.sin(t * 0.7) + Math.sin(t * 0.29 + 1.3), 0.1, 0.6) * atScreen
    const tap = (k: number) => burst * 0.007 * Math.max(0, Math.sin(t * k)) ** 2
    if (handL.current) handL.current.position.y = tap(17) - 0.012 * lift
    if (handR.current) handR.current.position.y = tap(13.3) - 0.012 * lift
  })

  return (
    <group position={[X, 0, 0]}>
      <Chair mats={mats} shadows={shadows} />
      <group ref={body} position={[0, 0, HIP[2]]}>
        <group position={[0, 0, -HIP[2]]}>
          <ModelSlot slot="desk.person">
            <Figure mats={mats} shadows={shadows} torso={torso} head={head} handL={handL} handR={handR} />
          </ModelSlot>
        </group>
      </group>
      {/* the lamp's warmth on his left shoulder */}
      <pointLight ref={kicker} position={[LAMP.head[0] - X + 0.05, LAMP.head[1] + 0.06, LAMP.head[2] + 0.42]} color={palette.lamp} intensity={0.55} distance={0.75} decay={2} />
    </group>
  )
}

type Mats = Record<'hoodie' | 'cuff' | 'jeans' | 'skin' | 'hair' | 'phones' | 'chair' | 'steel', Material>

function Figure({
  mats,
  shadows,
  torso,
  head,
  handL,
  handR,
}: {
  mats: Mats
  shadows: boolean
  torso: RefObject<Group | null>
  head: RefObject<Group | null>
  handL: RefObject<Group | null>
  handR: RefObject<Group | null>
}) {
  const s = shadows
  return (
    <group>
      {/* legs: under the desk, mostly in the dark */}
      <Limb a={[-0.1, 0.52, 0.72]} b={[-0.12, 0.54, 0.34]} r={0.065} material={mats.jeans} shadows={s} />
      <Limb a={[0.1, 0.52, 0.72]} b={[0.13, 0.54, 0.34]} r={0.065} material={mats.jeans} shadows={s} />
      <Limb a={[-0.12, 0.53, 0.34]} b={[-0.14, 0.09, 0.4]} r={0.052} material={mats.jeans} shadows={s} />
      <Limb a={[0.13, 0.53, 0.34]} b={[0.16, 0.09, 0.38]} r={0.052} material={mats.jeans} shadows={s} />
      <mesh position={[-0.14, 0.04, 0.34]} material={mats.chair} castShadow={s}>
        <boxGeometry args={[0.09, 0.07, 0.25]} />
      </mesh>
      <mesh position={[0.16, 0.04, 0.32]} material={mats.chair} castShadow={s}>
        <boxGeometry args={[0.09, 0.07, 0.25]} />
      </mesh>

      {/* the upper body pivots at the hips */}
      <group ref={torso} position={HIP}>
        <group position={[-HIP[0], -HIP[1], -HIP[2]]}>
          {/* the hoodie: a broad back curving forward over the keyboard */}
          <mesh position={[0, 0.84, 0.71]} rotation={[-0.16, 0, 0]} scale={[1.12, 1, 0.74]} material={mats.hoodie} castShadow={s}>
            <capsuleGeometry args={[0.16, 0.36, 8, 24]} />
          </mesh>
          {/* the shoulders */}
          <mesh position={[0, 1.105, 0.675]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.9]} material={mats.hoodie} castShadow={s}>
            <capsuleGeometry args={[0.075, 0.27, 6, 20]} />
          </mesh>
          {/* the lowered hood, bunched behind the neck */}
          <mesh position={[0, 1.165, 0.735]} rotation={[Math.PI / 2 - 0.55, 0, 0]} scale={[1.35, 1, 0.8]} material={mats.hoodie} castShadow={s}>
            <torusGeometry args={[0.075, 0.04, 12, 28]} />
          </mesh>
          {/* the neck */}
          <mesh position={[0, 1.2, 0.66]} rotation={[-0.2, 0, 0]} material={mats.skin}>
            <cylinderGeometry args={[0.042, 0.048, 0.11, 16]} />
          </mesh>

          {/* the arms: sleeves to the elbows, forearms down to the keyboard */}
          <Limb a={SHOULDER_L} b={ELBOW_L} r={0.056} material={mats.hoodie} shadows={s} />
          <Limb a={SHOULDER_R} b={ELBOW_R} r={0.056} material={mats.hoodie} shadows={s} />
          <Limb a={ELBOW_L} b={WRIST_L} r={0.047} material={mats.hoodie} shadows={s} />
          <Limb a={ELBOW_R} b={WRIST_R} r={0.047} material={mats.hoodie} shadows={s} />
          <Limb a={[WRIST_L[0] - 0.008, WRIST_L[1] + 0.006, WRIST_L[2] + 0.05]} b={WRIST_L} r={0.05} material={mats.cuff} shadows={s} />
          <Limb a={[WRIST_R[0] + 0.008, WRIST_R[1] + 0.006, WRIST_R[2] + 0.05]} b={WRIST_R} r={0.05} material={mats.cuff} shadows={s} />

          <group ref={handL}>
            <Hand at={WRIST_L} side={-1} material={mats.skin} shadows={s} />
          </group>
          <group ref={handR}>
            <Hand at={WRIST_R} side={1} material={mats.skin} shadows={s} />
          </group>

          {/* the head turns about the top of the neck */}
          <group ref={head} position={NECK}>
            <Head mats={mats} shadows={s} />
          </group>
        </group>
      </group>
    </group>
  )
}

function Hand({ at, side, material, shadows }: { at: V3; side: 1 | -1; material: Material; shadows: boolean }) {
  return (
    <group position={[at[0], at[1] - 0.012, at[2] - 0.06]} rotation={[0.12, side * 0.25, 0]}>
      {/* palm and fingers as one rounded mitt, curled over the keys */}
      <mesh scale={[0.042, 0.017, 0.06]} material={material} castShadow={shadows}>
        <sphereGeometry args={[1, 20, 14]} />
      </mesh>
      <mesh position={[side * -0.038, -0.004, 0.005]} rotation={[0.4, 0, side * 0.8]} material={material}>
        <capsuleGeometry args={[0.009, 0.03, 4, 8]} />
      </mesh>
    </group>
  )
}

function Head({ mats, shadows }: { mats: Mats; shadows: boolean }) {
  return (
    <group>
      {/* skull and face: a little longer than wide, the jaw narrower */}
      <mesh position={[0, 0.105, -0.012]} scale={[0.86, 1.08, 0.98]} material={mats.skin} castShadow={shadows}>
        <sphereGeometry args={[0.1, 32, 24]} />
      </mesh>
      <mesh position={[0, 0.045, -0.05]} scale={[0.72, 0.6, 0.7]} material={mats.skin}>
        <sphereGeometry args={[0.09, 24, 16]} />
      </mesh>
      {/* the nose, the ears */}
      <mesh position={[0, 0.095, -0.11]} rotation={[-1.35, 0, 0]} material={mats.skin}>
        <coneGeometry args={[0.014, 0.035, 10]} />
      </mesh>
      <mesh position={[-0.087, 0.1, 0.0]} scale={[0.5, 1, 0.8]} material={mats.skin}>
        <sphereGeometry args={[0.024, 12, 10]} />
      </mesh>
      <mesh position={[0.087, 0.1, 0.0]} scale={[0.5, 1, 0.8]} material={mats.skin}>
        <sphereGeometry args={[0.024, 12, 10]} />
      </mesh>
      {/* hair: short, over the top and the back */}
      <mesh position={[0, 0.118, 0.004]} rotation={[0.38, 0, 0]} scale={[0.9, 1.04, 1.02]} material={mats.hair} castShadow={shadows}>
        <sphereGeometry args={[0.1, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
      </mesh>
      <mesh position={[0, 0.1, 0.018]} scale={[0.88, 0.9, 0.9]} material={mats.hair}>
        <sphereGeometry args={[0.1, 24, 18, Math.PI * 0.15, Math.PI * 0.7]} />
      </mesh>
      {/* headphones: the band over the top, a cup on each ear */}
      <mesh position={[0, 0.112, 0.004]} scale={[0.98, 1.06, 1]} material={mats.phones}>
        <torusGeometry args={[0.104, 0.009, 8, 32, Math.PI]} />
      </mesh>
      {([-1, 1] as const).map((side) => (
        <mesh key={side} position={[side * 0.1, 0.1, 0.004]} rotation={[0, 0, Math.PI / 2]} material={mats.phones} castShadow={shadows}>
          <cylinderGeometry args={[0.038, 0.04, 0.03, 20]} />
        </mesh>
      ))}
    </group>
  )
}

function Chair({ mats, shadows }: { mats: Mats; shadows: boolean }): ReactNode {
  return (
    <group position={[0, 0, 0.78]}>
      <mesh position={[0, 0.455, 0]} material={mats.chair} castShadow={shadows} receiveShadow={shadows}>
        <boxGeometry args={[0.48, 0.06, 0.46]} />
      </mesh>
      {/* the backrest, tilted back behind him */}
      <mesh position={[0, 0.84, 0.24]} rotation={[0.14, 0, 0]} material={mats.chair} castShadow={shadows}>
        <boxGeometry args={[0.42, 0.5, 0.05]} />
      </mesh>
      <mesh position={[0, 0.58, 0.215]} rotation={[0.14, 0, 0]} material={mats.steel}>
        <boxGeometry args={[0.05, 0.22, 0.02]} />
      </mesh>
      <mesh position={[0, 0.27, 0]} material={mats.steel}>
        <cylinderGeometry args={[0.022, 0.022, 0.33, 12]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2 + 0.3
        return (
          <mesh key={i} position={[Math.sin(a) * 0.15, 0.07, Math.cos(a) * 0.15]} rotation={[0, a, 0]} material={mats.steel}>
            <boxGeometry args={[0.035, 0.025, 0.3]} />
          </mesh>
        )
      })}
    </group>
  )
}
