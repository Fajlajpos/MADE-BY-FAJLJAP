'use client'

import { PerspectiveCamera, View } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import { MathUtils, Vector3, type Group, type PerspectiveCamera as Camera, type PointLight } from 'three'
import type { LampState } from '../objects/liquid'
import { tokenColor } from '../tokens'
import type { CaseSpec, PileRef } from '../objects/cases'
import { ChromeObject, InkContext, LampContext, poseOf, Showcase, type ObjectKind, type PointerRef } from './ChromeObject'
import { ServiceRing } from './ServiceRing'
import type { LampRef, RingProps } from './Slot3D'

/** The 3D half of a <Slot3D/>: a drei View in the shared canvas (loaded with three.js). */
export default function Slot3DView({
  className,
  object,
  pointer,
  lamp,
  active,
  still,
  scale,
  ring,
  launch,
  pile,
  cases,
}: {
  className?: string
  object: ObjectKind
  pointer: PointerRef
  lamp: LampRef
  active: boolean
  still: boolean
  scale: number
  ring?: RingProps
  launch?: { current: number }
  pile?: PileRef
  cases?: CaseSpec[]
}) {
  const inkValue = useMemo(() => ({ still, pile, cases }), [still, pile, cases])
  const lampState = useMemo<LampState>(() => ({ position: new Vector3(-1, 1.4, LAMP_Z), power: 0.4 }), [])
  // when the next glint runs across the chrome (clock seconds)
  const [glint] = useState(() => ({ current: 2 + Math.random() * 4 }))
  return (
    <View className={className}>
      <PerspectiveCamera makeDefault position={[0, 0, 5.2]} fov={30} />
      <CursorLamp lamp={lamp} state={lampState} glint={glint} />
      <Glint next={glint} still={still} />
      <LampContext value={lampState}>
      <InkContext value={inkValue}>
      {ring ? (
        <ServiceRing objects={ring.objects} active={ring.active} land={ring.land} still={still} />
      ) : (
        <Launch launch={launch}>
          <Showcase pointer={pointer} active={active} still={still} scale={scale} pose={poseOf(object)}>
            <ChromeObject kind={object} />
          </Showcase>
        </Launch>
      )}
      </InkContext>
      </LampContext>
    </View>
  )
}

/** Sends its object off to the upper right when `launch` rises (the paper plane, sent). */
function Launch({ launch, children }: { launch?: { current: number }; children: ReactNode }) {
  const ref = useRef<Group>(null)
  useFrame((_, dt) => {
    const g = ref.current
    if (!g || !launch) return
    const t = launch.current
    g.position.x = MathUtils.damp(g.position.x, t * 4, 3, dt)
    g.position.y = MathUtils.damp(g.position.y, t * 2.4, 3, dt)
    g.position.z = MathUtils.damp(g.position.z, -t * 3, 3, dt)
  })
  return <group ref={ref}>{children}</group>
}

/**
 * The desk lamp, which is the cursor: a warm point light in front of the view, at the cursor's
 * place over the slot, so a warm highlight runs over the chrome as the cursor passes. It dims as
 * the cursor goes away from the slot. Coming over the object sets off a glint.
 */
function CursorLamp({ lamp, state: out, glint }: { lamp: LampRef; state: LampState; glint?: { current: number } }) {
  const ref = useRef<PointLight>(null)
  const color = useMemo(() => tokenColor('cursorLamp'), [])
  const inside = useRef(false)
  useFrame((state, dt) => {
    const light = ref.current
    const cam = state.camera as Camera
    if (!light || !cam.isPerspectiveCamera) return
    // half the view at the objects' depth, in world units
    const hh = cam.position.z * Math.tan(MathUtils.degToRad(cam.fov / 2))
    const hw = hh * cam.aspect
    const { x, y } = lamp.current
    light.position.x = MathUtils.damp(light.position.x, x * hw, 10, dt)
    light.position.y = MathUtils.damp(light.position.y, -y * hh, 10, dt)
    const away = Math.hypot(x, y)
    const power = MathUtils.clamp(1.6 - away * 0.35, 0.25, 1)
    light.intensity = MathUtils.damp(light.intensity, LAMP_POWER * power, 8, dt)
    out.position.copy(light.position)
    out.power = MathUtils.clamp(1.25 - away * 0.45, 0, 1)
    const now = Math.abs(x) < 0.75 && Math.abs(y) < 0.75
    if (now && !inside.current && glint) glint.current = Math.min(glint.current, state.clock.elapsedTime + 0.05)
    inside.current = now
  })
  return <pointLight ref={ref} color={color} position={[-1, 1.4, LAMP_Z]} intensity={LAMP_POWER * 0.4} decay={2} distance={0} />
}

const LAMP_Z = 2.2
const LAMP_POWER = 14

/**
 * Now and then (and whenever the cursor comes over the object) a bright light runs across in
 * front of it, low to high, left to right: a flash travels along every chrome edge.
 */
function Glint({ next, still }: { next: { current: number }; still: boolean }) {
  const ref = useRef<PointLight>(null)
  const start = useRef(-10)
  useFrame((state) => {
    const light = ref.current
    const cam = state.camera as Camera
    if (!light || !cam.isPerspectiveCamera) return
    const t = state.clock.elapsedTime
    if (!still && t >= next.current && t - start.current > GLINT_TIME + 0.4) {
      start.current = t
      next.current = t + 6 + Math.random() * 6
    }
    const k = (t - start.current) / GLINT_TIME
    // the light stays in the scene at zero (switching it off would recompile every material)
    if (k < 0 || k > 1) {
      light.intensity = 0
      return
    }
    const hh = cam.position.z * Math.tan(MathUtils.degToRad(cam.fov / 2))
    const hw = hh * cam.aspect
    const e = k * k * (3 - 2 * k)
    light.position.set(MathUtils.lerp(-hw * 1.1, hw * 1.1, e), MathUtils.lerp(-hh * 0.5, hh * 0.7, e), 1.3)
    light.intensity = GLINT_POWER * Math.sin(Math.PI * k) ** 2
  })
  return <pointLight ref={ref} color="#fff4e6" intensity={0} decay={2} distance={0} />
}

const GLINT_TIME = 0.75
const GLINT_POWER = 22
