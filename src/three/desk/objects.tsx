'use client'

import { Billboard, RoundedBox } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import {
  BackSide,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  InstancedMesh,
  MathUtils,
  Matrix4,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  Vector2,
  Vector3,
  type Group,
  type Mesh,
  type PointLight,
  type RectAreaLight,
  type SpotLight,
} from 'three'
import type { HotspotId } from '@/content/desk'
import { ModelSlot } from '../ModelSlot'
import type { ScenePalette } from '../tokens'
import { useSlotTexture } from '../useSlotTexture'
import { deskProgress } from '../scroll'
import { fromHotspot } from './hotspots'
import { LAMP, PLACE, SCREEN } from './layout'
import { KEY_ROWS, ScreenTexture, keyLegendTexture, noteTexture, sketchTexture, steamTexture } from './textures'

type V3 = [number, number, number]

/* ── interaction ────────────────────────────────────────────────────── */

export type TouchProps = {
  active: HotspotId | null
  onHover: (id: HotspotId | null) => void
  onSelect: (id: HotspotId) => void
}

/** Pointer handlers for a thing on the desk that stands for `id` (ignored over its DOM label). */
export function touch(id: HotspotId, { onHover, onSelect }: TouchProps) {
  return {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      if (!fromHotspot(e.nativeEvent)) onHover(id)
    },
    onPointerOut: (e: ThreeEvent<PointerEvent>) => {
      if (!fromHotspot(e.nativeEvent)) onHover(null)
    },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      if (!fromHotspot(e.nativeEvent)) onSelect(id)
    },
  }
}

/** Lifts its object a few millimetres while hovered or focused. */
function Lift({ on, children }: { on: boolean; children: ReactNode }) {
  const ref = useRef<Group>(null)
  useFrame((_, dt) => {
    const g = ref.current
    if (g) g.position.y = MathUtils.damp(g.position.y, on ? 0.01 : 0, 12, dt)
  })
  return <group ref={ref}>{children}</group>
}

/* ── monitor ────────────────────────────────────────────────────────── */

export function Monitor({
  palette,
  accent,
  shadows,
  still,
  ...hover
}: TouchProps & { palette: ScenePalette; accent: string; shadows: boolean; still: boolean }) {
  const cold = `#${palette.ultra.getHexString()}`
  const screen = useMemo(() => new ScreenTexture(accent, cold), [accent, cold])
  const note = useMemo(() => noteTexture('#e9c75a'), [])
  const light = useRef<RectAreaLight>(null)
  useEffect(
    () => () => {
      screen.texture.dispose()
      note.dispose()
    },
    [screen, note],
  )
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    screen.draw(t, still)
    // an LCD never sits perfectly still: a breath of brightness
    if (light.current && !still) light.current.intensity = 3.2 + Math.sin(t * 1.7) * 0.08
  })
  const [cx, cy, cz] = SCREEN.center
  const [mx, my, mz] = PLACE.monitor
  return (
    <group>
      <ModelSlot slot="desk.monitor">
        <group>
          <RoundedBox args={[0.25, 0.012, 0.17]} radius={0.005} position={[mx, my + 0.006, mz - 0.04]} castShadow={shadows} receiveShadow={shadows}>
            <meshStandardMaterial color="#1b1c20" roughness={0.45} metalness={0.5} />
          </RoundedBox>
          <mesh position={[mx, my + 0.13, mz - 0.075]} castShadow={shadows}>
            <boxGeometry args={[0.05, 0.25, 0.022]} />
            <meshStandardMaterial color="#1b1c20" roughness={0.45} metalness={0.5} />
          </mesh>
          <RoundedBox args={[SCREEN.width + 0.026, SCREEN.height + 0.026, 0.024]} radius={0.006} position={[cx, cy, cz - 0.0125]} castShadow={shadows}>
            <meshStandardMaterial color="#141519" roughness={0.5} metalness={0.2} />
          </RoundedBox>
          <mesh position={[cx, cy - 0.02, cz - 0.04]} castShadow={shadows}>
            <boxGeometry args={[0.32, 0.2, 0.035]} />
            <meshStandardMaterial color="#17181c" roughness={0.6} />
          </mesh>
        </group>
      </ModelSlot>
      {/* the screen itself: unlit, a little over 1 so the bright page blooms; it stands for Weby */}
      <mesh position={[cx, cy, cz + 0.0005]} {...touch('weby', hover)}>
        <planeGeometry args={[SCREEN.width, SCREEN.height]} />
        <meshBasicMaterial map={screen.texture} color={new Color(1.1, 1.1, 1.12)} toneMapped={false} />
      </mesh>
      {/* the sticky note on the bezel */}
      <mesh position={[cx - 0.27, cy + 0.15, cz + 0.002]} rotation={[0, 0, 0.11]}>
        <planeGeometry args={[0.068, 0.068]} />
        <meshStandardMaterial map={note} roughness={0.9} side={DoubleSide} />
      </mesh>
      <rectAreaLight
        ref={light}
        position={[cx, cy, cz + 0.01]}
        rotation={[0, Math.PI, 0]}
        width={SCREEN.width}
        height={SCREEN.height}
        intensity={3.2}
        color={palette.screen}
      />
    </group>
  )
}

/* ── keyboard + mouse ───────────────────────────────────────────────── */

const U = 0.024

export function Keyboard({ shadows }: { shadows: boolean }) {
  const keys = useRef<InstancedMesh>(null)
  const legends = useMemo(() => keyLegendTexture(), [])
  const layout = useMemo(() => {
    const out: { x: number; z: number; w: number; worn: boolean }[] = []
    KEY_ROWS.forEach((row, r) => {
      let cum = 0
      for (const [label, w] of row) {
        out.push({
          x: -7.5 * U + (cum + w / 2) * U,
          z: -2 * U + r * U,
          w,
          worn: ['e', 'a', 's', 'd', '', 'enter', 'ctrl'].includes(label),
        })
        cum += w
      }
    })
    return out
  }, [])
  useEffect(() => {
    const mesh = keys.current
    if (!mesh) return
    const m = new Matrix4()
    const base = new Color('#222327')
    layout.forEach((k, i) => {
      m.compose(new Vector3(k.x, 0.014 + 0.0045, k.z), new Quaternion(), new Vector3(k.w * U - 0.0034, 0.009, U - 0.0034))
      mesh.setMatrixAt(i, m)
      mesh.setColorAt(i, base.clone().multiplyScalar(k.worn ? 1.35 : 0.9 + ((i * 37) % 10) / 70))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [layout])
  useEffect(() => () => legends.dispose(), [legends])
  const [x, y, z] = PLACE.keyboard
  return (
    <ModelSlot slot="desk.keyboard">
      <group position={[x, y, z]} rotation={[0, 0.035, 0]}>
        <RoundedBox args={[15 * U + 0.016, 0.014, 5 * U + 0.016]} radius={0.004} position={[0, 0.007, 0]} castShadow={shadows} receiveShadow={shadows}>
          <meshStandardMaterial color="#17181b" roughness={0.6} metalness={0.3} />
        </RoundedBox>
        <instancedMesh ref={keys} args={[undefined, undefined, layout.length]} castShadow={shadows} receiveShadow={shadows}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial roughness={0.55} />
        </instancedMesh>
        <mesh position={[0, 0.0236, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[15 * U, 5 * U]} />
          <meshStandardMaterial map={legends} transparent roughness={0.6} depthWrite={false} />
        </mesh>
      </group>
    </ModelSlot>
  )
}

export function Mouse({ shadows }: { shadows: boolean }) {
  const [x, y, z] = PLACE.mouse
  return (
    <group position={[x, y, z]} rotation={[0, -0.25, 0]}>
      <mesh position={[0, 0.011, 0]} scale={[0.031, 0.019, 0.055]} castShadow={shadows}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#1c1d21" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.026, -0.018]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.005, 0.005, 0.004, 12]} />
        <meshStandardMaterial color="#3a3b40" roughness={0.5} />
      </mesh>
    </group>
  )
}

/* ── mug ────────────────────────────────────────────────────────────── */

/** My enamel mug (plecháček): white, a dark blue rim, coffee, steam. No label: it is just mine. */
export function Mug({ shadows, still }: { shadows: boolean; still: boolean }) {
  const profile = useMemo(
    () =>
      [
        [0, 0],
        [0.036, 0],
        [0.039, 0.003],
        [0.04, 0.084],
        [0.0415, 0.0875],
        [0.038, 0.0875],
        [0.0375, 0.08],
        [0.0365, 0.006],
        [0, 0.006],
      ].map(([x, y]) => new Vector2(x, y)),
    [],
  )
  const [x, y, z] = PLACE.mug
  return (
    <group position={[x, y, z]}>
      <ModelSlot slot="desk.mug">
        <group>
          <mesh castShadow={shadows} receiveShadow={shadows}>
            <latheGeometry args={[profile, 40]} />
            <meshStandardMaterial color="#e6e3db" roughness={0.3} side={DoubleSide} />
          </mesh>
          <mesh position={[0, 0.087, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.0398, 0.0024, 8, 48]} />
            <meshStandardMaterial color="#1d2b52" roughness={0.3} />
          </mesh>
          <mesh position={[0.047, 0.046, 0]} rotation={[0, 0, -Math.PI / 2 + 0.5]} castShadow={shadows}>
            <torusGeometry args={[0.022, 0.0045, 10, 24, Math.PI * 1.15]} />
            <meshStandardMaterial color="#e6e3db" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.072, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.0368, 32]} />
            <meshStandardMaterial color="#160c06" roughness={0.12} />
          </mesh>
        </group>
      </ModelSlot>
      <Steam still={still} />
    </group>
  )
}

function Steam({ still }: { still: boolean }) {
  const texture = useMemo(() => steamTexture(), [])
  const wisps = useRef<(Mesh | null)[]>([])
  useEffect(() => () => texture.dispose(), [texture])
  useFrame(({ clock }) => {
    if (still) return
    const t = clock.elapsedTime
    wisps.current.forEach((m, i) => {
      if (!m) return
      const phase = (t * 0.22 + i / 3) % 1
      m.position.y = 0.1 + phase * 0.09
      m.position.x = Math.sin(t * 0.7 + i * 2) * 0.008
      ;(m.material as MeshBasicMaterial).opacity = Math.sin(phase * Math.PI) * 0.55
      m.scale.setScalar(0.07 + phase * 0.05)
    })
  })
  return (
    <Billboard>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(m) => {
            wisps.current[i] = m
          }}
          position={[0, 0.12, 0]}
          scale={0.08}
        >
          <planeGeometry args={[0.6, 1.2]} />
          <meshBasicMaterial map={texture} transparent depthWrite={false} opacity={still ? 0.3 : 0} />
        </mesh>
      ))}
    </Billboard>
  )
}

/* ── lamp ───────────────────────────────────────────────────────────── */

function Rod({ from, to, radius, color }: { from: V3; to: V3; radius: number; color: Color }) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new Vector3(...from)
    const b = new Vector3(...to)
    const dir = b.clone().sub(a)
    return {
      position: a.clone().add(b).multiplyScalar(0.5),
      quaternion: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.clone().normalize()),
      length: dir.length(),
    }
  }, [from, to])
  return (
    <mesh position={position} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[radius, radius, length, 12]} />
      <meshStandardMaterial color={color} roughness={0.45} metalness={0.35} />
    </mesh>
  )
}

/**
 * An old architect's lamp in green enamel. `on` fades the bulb and its spot; at the end of the
 * hero (the lift-off) it dims on its own, so the chrome things leave a darker room.
 */
export function Lamp({
  palette,
  on,
  shadows,
  still,
  ...hover
}: TouchProps & { palette: ScenePalette; on: boolean; shadows: boolean; still: boolean }) {
  const spot = useRef<SpotLight>(null)
  const spill = useRef<PointLight>(null)
  const bulb = useRef<MeshBasicMaterial>(null)
  const inside = useRef<MeshStandardMaterial>(null)
  const level = useRef(on ? 1 : 0)
  const target = useMemo(() => new Object3D(), [])
  const headQuat = useMemo(() => {
    const dir = new Vector3(...LAMP.aim).sub(new Vector3(...LAMP.head)).normalize()
    return new Quaternion().setFromUnitVectors(new Vector3(0, -1, 0), dir)
  }, [])
  const glow = useMemo(() => palette.lamp.clone().multiplyScalar(6), [palette.lamp])
  useFrame((_, dt) => {
    level.current = still ? (on ? 1 : 0) : MathUtils.damp(level.current, on ? 1 : 0, 9, dt)
    const dim = 1 - 0.75 * MathUtils.smoothstep(deskProgress.value, 0.72, 0.95)
    const k = level.current * dim
    if (spot.current) spot.current.intensity = 11 * k
    if (spill.current) spill.current.intensity = 0.25 * k
    if (bulb.current) bulb.current.color.copy(glow).multiplyScalar(Math.max(0.02, k))
    if (inside.current) inside.current.emissiveIntensity = 0.9 * k
  })
  const paint = palette.paint
  const [bx, by, bz] = LAMP.base
  return (
    <group {...touch('lamp', hover)}>
      <Lift on={hover.active === 'lamp'}>
        <ModelSlot slot="desk.lamp">
          <group>
            <mesh position={[bx, by + 0.01, bz]} castShadow={shadows} receiveShadow={shadows}>
              <cylinderGeometry args={[0.075, 0.085, 0.02, 32]} />
              <meshStandardMaterial color={paint} roughness={0.4} metalness={0.3} />
            </mesh>
            <Rod from={[bx, by + 0.02, bz]} to={LAMP.elbow} radius={0.007} color={paint} />
            <Rod from={LAMP.elbow} to={LAMP.head} radius={0.007} color={paint} />
            <Rod from={[bx + 0.02, by + 0.06, bz]} to={[LAMP.elbow[0] + 0.02, LAMP.elbow[1] - 0.05, LAMP.elbow[2]]} radius={0.0025} color={new Color('#6a6c70')} />
            <mesh position={LAMP.elbow}>
              <sphereGeometry args={[0.013, 16, 12]} />
              <meshStandardMaterial color="#3a3c40" roughness={0.4} metalness={0.6} />
            </mesh>
          </group>
        </ModelSlot>
        <group position={LAMP.head} quaternion={headQuat}>
          <mesh position={[0, -0.04, 0]} castShadow={shadows}>
            <cylinderGeometry args={[0.03, 0.072, 0.11, 32, 1, true]} />
            <meshStandardMaterial color={paint} roughness={0.4} metalness={0.3} side={DoubleSide} />
          </mesh>
          <mesh position={[0, -0.04, 0]}>
            <cylinderGeometry args={[0.028, 0.069, 0.106, 32, 1, true]} />
            <meshStandardMaterial ref={inside} color="#d9cbb3" emissive={palette.lamp} emissiveIntensity={0.9} roughness={0.8} side={BackSide} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <sphereGeometry args={[0.03, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={paint} roughness={0.4} metalness={0.3} />
          </mesh>
          <mesh position={[0, -0.035, 0]}>
            <sphereGeometry args={[0.022, 20, 14]} />
            <meshBasicMaterial ref={bulb} color={glow} toneMapped={false} />
          </mesh>
          <pointLight ref={spill} position={[0, -0.05, 0]} color={palette.lamp} intensity={0.25} distance={0.6} decay={2} />
        </group>
      </Lift>
      <primitive object={target} position={LAMP.aim} />
      <spotLight
        ref={spot}
        position={LAMP.head}
        target={target}
        color={palette.lamp}
        intensity={11}
        angle={0.8}
        penumbra={0.75}
        decay={2}
        distance={4}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
    </group>
  )
}

/* ── sketchbook with colour swatches, the photo ─────────────────────── */

/** The sketchbook (a wireframe and logo sketches) with a fan of colour swatches on it. */
export function Sketchbook({ palette, shadows }: { palette: ScenePalette; shadows: boolean }) {
  const page = useMemo(() => sketchTexture(), [])
  useEffect(() => () => page.dispose(), [page])
  const swatches = useMemo(
    () => [palette.orange, palette.ultra, new Color('#e9e2d2'), palette.sodium, new Color('#16171c')],
    [palette],
  )
  const [x, y, z] = PLACE.sketchbook
  return (
    <group position={[x, y, z]} rotation={[0, -0.42, 0]}>
      <ModelSlot slot="desk.sketchbook">
        <group>
          <mesh position={[0, 0.003, 0]} castShadow={shadows} receiveShadow={shadows}>
            <boxGeometry args={[0.44, 0.006, 0.162]} />
            <meshStandardMaterial color="#1b1d21" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.0105, 0]} receiveShadow={shadows}>
            <boxGeometry args={[0.425, 0.009, 0.152]} />
            <meshStandardMaterial color="#dcd5c6" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.0152, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={shadows}>
            <planeGeometry args={[0.42, 0.147]} />
            <meshStandardMaterial map={page} roughness={0.95} />
          </mesh>
        </group>
      </ModelSlot>
      {/* the swatch fan on the left page, pinned at one end */}
      <group position={[-0.16, 0.017, 0.05]}>
        {swatches.map((color, i) => (
          <group key={i} rotation={[0, 0.5 - i * 0.22, 0]}>
            <mesh position={[0, i * 0.0012, -0.055]} castShadow={shadows}>
              <boxGeometry args={[0.022, 0.001, 0.12]} />
              <meshStandardMaterial color={color} roughness={0.55} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

export function Polaroid({ shadows }: { shadows: boolean }) {
  const photo = useSlotTexture('desk.photo', 512)
  const [x, y, z] = PLACE.polaroid
  return (
    <group position={[x, y, z]} rotation={[0, 0.55, 0]}>
      <ModelSlot slot="desk.polaroid">
        <mesh position={[0, 0.001, 0]} castShadow={shadows} receiveShadow={shadows}>
          <boxGeometry args={[0.088, 0.002, 0.107]} />
          <meshStandardMaterial color="#ebe8e1" roughness={0.6} />
        </mesh>
      </ModelSlot>
      <mesh position={[0, 0.0022, -0.008]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.078, 0.078]} />
        <meshStandardMaterial map={photo} roughness={0.3} />
      </mesh>
    </group>
  )
}

/* ── cables ─────────────────────────────────────────────────────────── */

export function Cables() {
  const curves = useMemo(
    () =>
      [
        // monitor → behind the desk
        [[-0.08, 0.8, -0.33], [-0.1, 0.76, -0.4], [-0.14, 0.6, -0.43], [-0.2, 0.2, -0.42]],
        // keyboard → monitor base
        [[-0.06, 0.758, 0.03], [-0.04, 0.752, -0.06], [0.02, 0.752, -0.16], [-0.04, 0.755, -0.27]],
        // lamp → off the back edge
        [[-0.58, 0.752, -0.3], [-0.5, 0.752, -0.36], [-0.46, 0.7, -0.41], [-0.44, 0.3, -0.42]],
      ].map((pts) => new CatmullRomCurve3(pts.map((p) => new Vector3(...(p as V3))))),
    [],
  )
  return (
    <group>
      {curves.map((curve, i) => (
        <mesh key={i}>
          <tubeGeometry args={[curve, 48, 0.0028, 8, false]} />
          <meshStandardMaterial color="#0f1012" roughness={0.55} />
        </mesh>
      ))}
    </group>
  )
}
