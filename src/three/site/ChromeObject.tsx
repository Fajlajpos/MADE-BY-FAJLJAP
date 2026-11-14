'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react'
import { MathUtils, type Group, type PerspectiveCamera } from 'three'
import type { ServiceObject } from '@/content/home'
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
  WORDMARK_SIZE,
  WordmarkShape,
  type MaterialSet,
} from '../objects/shapes'
import { LiquidShape, type LampState } from '../objects/liquid'

/**
 * Every object a <Slot3D/> can show:
 *   browser, parcel, pen, phone → the four services · mug → me · plane → the contact form
 *   play → the reel's play button · tag → a price tag stamped „Kč“ · wordmark → FAJLAJP in chrome
 *   liquid → a drop of liquid chrome that swells toward the lamp (for <Drift/> between sections)
 */
export type ObjectKind = ServiceObject | 'mug' | 'plane' | 'play' | 'tag' | 'wordmark' | 'liquid'

/** The lamp of the view an object is in (set by Slot3DView's CursorLamp). */
export const LampContext = createContext<LampState | undefined>(undefined)

const KitContext = createContext<ChromeKit | null>(null)

/** One chrome kit (env map + materials) for every view in the shared canvas. */
export function KitProvider({ children }: { children: ReactNode }) {
  const kit = useChromeKit()
  return <KitContext value={kit}>{children}</KitContext>
}

function useKit(): ChromeKit {
  const kit = useContext(KitContext)
  if (!kit) throw new Error('ChromeObject must be inside <KitProvider>')
  return kit
}

/** A service symbol in chrome, or one of my own things in its own materials. */
export function ChromeObject({ kind }: { kind: ObjectKind }) {
  const kit = useKit()
  const lamp = useContext(LampContext)
  const chrome = useMemo<MaterialSet>(
    () => ({ body: kit.chrome, accent: kit.orange, accent2: kit.blue, inset: kit.dark, label: kit.enamel }),
    [kit],
  )
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
      // tipped toward the viewer, so its wings show and not just an edge
      return (
        <group rotation={[0.75, 0, 0.2]}>
          <PlaneShape set={chrome} />
        </group>
      )
    case 'play':
      return <PlayShape set={chrome} />
    case 'tag':
      return <TagShape set={chrome} />
    case 'wordmark':
      return (
        <FitView width={WORDMARK_SIZE.width} height={WORDMARK_SIZE.height}>
          <WordmarkShape set={chrome} />
        </FitView>
      )
    case 'liquid':
      return <LiquidShape chrome={kit.chrome} lamp={lamp} />
    case 'mug':
      return <MugShape set={{ body: kit.enamel, accent: kit.orange, accent2: kit.blue, inset: kit.dark }} />
  }
}

/** Scales a wide object to fill its view (the wordmark goes into slots of any proportion). */
function FitView({ width, height, children }: { width: number; height: number; children: ReactNode }) {
  const ref = useRef<Group>(null)
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  useFrame(() => {
    const g = ref.current
    if (!g || !camera.isPerspectiveCamera) return
    const h = 2 * camera.position.length() * Math.tan(MathUtils.degToRad(camera.fov / 2))
    const w = h * camera.aspect
    g.scale.setScalar(Math.min((w * 0.84) / width, (h * 0.66) / height))
  })
  return <group ref={ref}>{children}</group>
}

/** How each object likes to be seen: its resting turn (`yaw`) and how far it sways around it. */
/** `lean`: how much it turns toward the cursor (1 = as much as the rest). */
export type Pose = { yaw: number; sway: number; lean?: number }
const POSES: Partial<Record<ObjectKind, Pose>> = {
  play: { yaw: -0.28, sway: 0.42 },
  tag: { yaw: -0.3, sway: 0.5 },
  wordmark: { yaw: 0, sway: 0.16, lean: 0.35 },
  liquid: { yaw: 0, sway: 0.5, lean: 0.4 },
  plane: { yaw: 0.2, sway: 0.4 },
}
export function poseOf(kind: ObjectKind): Pose {
  return POSES[kind] ?? { yaw: -0.45, sway: 0.7 }
}

export type PointerRef = { current: { x: number; y: number } }

/**
 * How an object stands on the page: a slow turn, a gentle float, a lean toward the cursor
 * (`pointer`, −1…1 around the slot) and a little lift and turn while its card is `active`.
 * `still` (reduced motion) keeps one three-quarter pose.
 */
export function Showcase({
  children,
  pointer,
  active = false,
  still = false,
  scale = 1,
  turn = 0.35,
  pose = { yaw: -0.45, sway: 0.7 },
}: {
  children: ReactNode
  pointer?: PointerRef
  active?: boolean
  still?: boolean
  scale?: number
  /** Turning speed, radians a second. */
  turn?: number
  pose?: Pose
}) {
  const outer = useRef<Group>(null)
  const inner = useRef<Group>(null)
  const spin = useRef(-0.5)
  useFrame((state, dt) => {
    const o = outer.current
    const i = inner.current
    if (!o || !i) return
    if (still) {
      i.rotation.set(-0.1, pose.yaw - pose.sway * 0.1, 0)
      return
    }
    const t = state.clock.elapsedTime
    spin.current += dt * turn * (active ? 2.2 : 1)
    // turn back and forth around a three-quarter view instead of spinning all the way
    i.rotation.y = pose.yaw + Math.sin(spin.current) * pose.sway
    i.position.y = Math.sin(t * 1.1) * 0.05
    const px = pointer?.current.x ?? 0
    const py = pointer?.current.y ?? 0
    const lean = pose.lean ?? 1
    o.rotation.y = MathUtils.damp(o.rotation.y, px * 0.45 * lean, 4, dt)
    o.rotation.x = MathUtils.damp(o.rotation.x, (-py * 0.3 - 0.06) * lean, 4, dt)
    const s = scale * (active ? 1.08 : 1)
    o.scale.setScalar(MathUtils.damp(o.scale.x, s, 6, dt))
  })
  return (
    <group ref={outer} scale={scale}>
      <group ref={inner}>{children}</group>
    </group>
  )
}
