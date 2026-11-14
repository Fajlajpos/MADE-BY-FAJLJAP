'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Color, Euler, MathUtils, MeshBasicMaterial, Quaternion, Vector3, type Group, type MeshPhysicalMaterial } from 'three'
import type { HotspotId } from '@/content/desk'
import { createChromeEnvironment } from '../chrome/env'
import { CHROME, createMorphMaterial, setMorph, type Morph } from '../chrome/materials'
import { BrowserShape, ParcelShape, PenShape, PhoneShape, type MaterialSet } from '../objects/shapes'
import { deskProgress } from '../scroll'
import type { ScenePalette } from '../tokens'
import { FLYERS, type Flyer } from './layout'
import { labelTexture, phoneTexture } from './textures'
import { touch, type TouchProps } from './objects'

/**
 * The four services on the desk. While the hero runs they are just things: the parcel in
 * cardboard and tape, the phone in black glass, the pen in brass (the browser does not exist
 * yet). At the end they lift off, their surfaces run into chrome — the same symbols that stand
 * in the services section below — and fly up out of the frame, the browser born out of the screen.
 */

type Key = keyof typeof FLYERS
const SERVICE: Record<Key, HotspotId> = { browser: 'weby', parcel: 'e-shopy', phone: 'aplikace', pen: 'grafika' }

const m = (color: string | Color, metalness: number, roughness: number): Morph => ({
  color: new Color(color),
  metalness,
  roughness,
})

export function Flyers({ palette, accent, still, ...hover }: TouchProps & { palette: ScenePalette; accent: string; still: boolean }) {
  const gl = useThree((s) => s.gl)
  const env = useMemo(() => createChromeEnvironment(gl, { warm: palette.orange, cold: palette.ultra }), [gl, palette])
  const label = useMemo(() => labelTexture(), [])

  const sets = useMemo(() => {
    const ORANGE = m(palette.orange, 0.15, 0.28)
    const ULTRA = m(palette.ultra, 0.15, 0.28)
    const DARK = m('#0d0f15', 0.3, 0.18)
    const mk = (real: Morph, chrome: Morph = CHROME) => createMorphMaterial(env, real, chrome)
    const labelMat = mk(m('#f1eee6', 0, 0.7), m('#f4f4f6', 0.6, 0.25))
    labelMat.map = label
    const sets: Record<Key, MaterialSet> = {
      // born chrome: it only grows
      browser: { body: mk(CHROME), accent: mk(ORANGE, ORANGE), accent2: mk(ULTRA, ULTRA), inset: mk(DARK, DARK) },
      parcel: {
        body: mk(m(palette.cardboard, 0, 0.85)),
        accent: mk(m('#c9a46a', 0, 0.45), ORANGE),
        accent2: mk(DARK, DARK),
        inset: mk(DARK, DARK),
        label: labelMat,
      },
      phone: { body: mk(m('#121317', 0.6, 0.3)), accent: mk(ORANGE, ORANGE), accent2: mk(ULTRA, ULTRA), inset: mk(DARK, DARK) },
      pen: {
        body: mk(m('#b8924a', 1, 0.32)),
        accent: mk(m('#16171c', 0.2, 0.4), ORANGE),
        accent2: mk(m('#b8924a', 1, 0.32), ULTRA),
        inset: mk(DARK, DARK),
      },
    }
    return sets
  }, [env, label, palette])

  useEffect(
    () => () => {
      env.dispose()
      label.dispose()
      for (const set of Object.values(sets)) for (const mat of Object.values(set)) mat?.dispose()
    },
    [env, label, sets],
  )

  return (
    <>
      {(Object.keys(FLYERS) as Key[]).map((key) => (
        <FlyerObject key={key} id={key} flyer={FLYERS[key]} set={sets[key]} accent={accent} cold={`#${palette.ultra.getHexString()}`} still={still} {...hover} />
      ))}
    </>
  )
}

const lifted = new Euler(-0.25, -0.5, 0.08)

function FlyerObject({
  id,
  flyer,
  set,
  accent,
  cold,
  still,
  ...hover
}: TouchProps & { id: Key; flyer: Flyer; set: MaterialSet; accent: string; cold: string; still: boolean }) {
  const group = useRef<Group>(null)
  const ui = useRef(0)
  const screen = useMemo(() => (id === 'phone' ? phoneTexture(accent, cold) : null), [id, accent, cold])
  const screenMat = useMemo(() => (screen ? new MeshBasicMaterial({ map: screen, color: new Color(0.8, 0.8, 0.85), toneMapped: false, transparent: true }) : null), [screen])
  useEffect(() => () => {
    screen?.dispose()
    screenMat?.dispose()
  }, [screen, screenMat])

  const rest = useMemo(() => new Vector3(...flyer.rest), [flyer])
  const away = useMemo(() => new Vector3(...flyer.away), [flyer])
  const qRest = useMemo(() => new Quaternion().setFromEuler(new Euler(...flyer.rot)), [flyer])
  const qLift = useMemo(() => new Quaternion().setFromEuler(lifted), [])
  const pos = useMemo(() => new Vector3(), [])
  const q = useMemo(() => new Quaternion(), [])
  const spin = useMemo(() => new Quaternion(), [])
  const yAxis = useMemo(() => new Vector3(0, 1, 0), [])
  const hoverLift = useRef(0)

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const p = still ? 0 : deskProgress.value
    const o = flyer.order * 0.025
    const lift = MathUtils.smoothstep(p, 0.6 + o, 0.78 + o)
    const fly = MathUtils.smoothstep(p, 0.8 + o, 0.99)
    hoverLift.current = MathUtils.damp(hoverLift.current, hover.active === SERVICE[id] && lift < 0.05 ? 1 : 0, 12, dt)

    // rest → hover a little above the desk, turned toward the camera → up and away
    pos.copy(rest)
    pos.y += 0.13 * lift + 0.01 * hoverLift.current
    pos.z += 0.06 * lift
    if (id === 'browser') pos.z += 0.12 * lift
    pos.lerp(away, fly * fly)
    g.position.copy(pos)
    q.slerpQuaternions(qRest, qLift, lift)
    spin.setFromAxisAngle(yAxis, fly * 2.6 + (lift > 0 && !still ? Math.sin(state.clock.elapsedTime * 0.8 + flyer.order) * 0.15 * lift : 0))
    g.quaternion.copy(q).premultiply(spin)
    const grow = id === 'browser' ? lift : 1 + 0.6 * lift
    g.scale.setScalar(flyer.scale * Math.max(0.0001, grow))
    g.visible = id !== 'browser' || lift > 0.01

    // the surfaces run into chrome as it rises
    for (const mat of Object.values(set)) if (mat) setMorph(mat as MeshPhysicalMaterial, lift)
    ui.current = lift
    if (screenMat) screenMat.opacity = 1 - MathUtils.smoothstep(lift, 0.1, 0.6)
  })

  return (
    <group ref={group} {...touch(SERVICE[id], hover)}>
      {id === 'browser' && <BrowserShape set={set} />}
      {id === 'parcel' && <ParcelShape set={set} lines={false} />}
      {id === 'pen' && <PenShape set={set} />}
      {id === 'phone' && (
        <>
          <PhoneUi set={set} ui={ui} />
          {screenMat && (
            <mesh position={[0, 0, 0.047]} material={screenMat}>
              <planeGeometry args={[0.55, 1.17]} />
            </mesh>
          )}
        </>
      )}
    </group>
  )
}

/** The phone re-renders its app shapes only when they start to stand out (cheap: a few frames). */
function PhoneUi({ set, ui }: { set: MaterialSet; ui: { current: number } }) {
  const ref = useRef<Group>(null)
  useFrame(() => {
    const g = ref.current
    if (!g) return
    // PhoneShape's ui group is its 4th child: scale it in place instead of re-rendering React
    const uiGroup = g.children[0]?.children[3]
    if (uiGroup) {
      uiGroup.scale.z = Math.max(0.001, ui.current)
      uiGroup.visible = ui.current > 0.01
    }
  })
  return (
    <group ref={ref}>
      <PhoneShape set={set} ui={0} />
    </group>
  )
}

