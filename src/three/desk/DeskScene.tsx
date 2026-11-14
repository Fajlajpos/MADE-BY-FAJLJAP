'use client'

import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing'
import { useFrame, useThree } from '@react-three/fiber'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import { useEffect, useMemo, useRef, type ReactElement } from 'react'
import { MathUtils, Vector3, type PerspectiveCamera } from 'three'
import type { HotspotId } from '@/content/desk'
import type { Tier } from '../quality'
import { deskProgress } from '../scroll'
import { readPalette, tokenColor } from '../tokens'
import { Flyers } from './flyers'
import { createRig } from './camera'
import { hotspotEls } from './hotspots'
import { ANCHORS, WINDOW, WALL_Z } from './layout'
import { Cables, Keyboard, Lamp, Monitor, Mouse, Mug, Polaroid, Sketchbook } from './objects'
import { Person } from './person'
import { Desk, Outside, Room } from './room'

export type DeskSceneProps = {
  tier: Exclude<Tier, 'none'>
  /** Reduced motion: render on demand, no steam, no flicker, no camera drift. */
  still: boolean
  lampOn: boolean
  active: HotspotId | null
  onHover: (id: HotspotId | null) => void
  onSelect: (id: HotspotId) => void
  onReady: () => void
}

export function DeskScene({ tier, still, lampOn, active, onHover, onSelect, onReady }: DeskSceneProps) {
  const palette = useMemo(() => readPalette(), [])
  const accent = useMemo(() => tokenColor('orange'), [])
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => invalidate(), [lampOn, active, invalidate])

  const shadows = tier === 'high'
  const touch = { active, onHover, onSelect }
  const { x0, x1, y0, y1 } = WINDOW

  return (
    <>
      <color attach="background" args={[palette.night]} />
      {/* the room's own dark: a blue night through the window, nothing from above */}
      <hemisphereLight args={[palette.sky, '#000000', 0.65]} />
      {/* what comes in through the window: cold sky with the street lamp's orange under it */}
      <rectAreaLight
        position={[(x0 + x1) / 2, (y0 + y1) / 2, WALL_Z - 0.1]}
        width={x1 - x0}
        height={y1 - y0}
        intensity={1.1}
        color={palette.sky.clone().lerp(palette.sodium, 0.35)}
      />
      <pointLight position={[0.7, 0.2, -2.4]} color={palette.sodium} intensity={0.7} distance={5} decay={2} />

      <Room palette={palette} />
      <Outside palette={palette} still={still} />
      <Desk palette={palette} shadows={shadows} />
      <Monitor palette={palette} accent={accent} shadows={shadows} still={still} {...touch} />
      <Keyboard shadows={shadows} />
      <Mouse shadows={shadows} />
      <Lamp palette={palette} on={lampOn} shadows={shadows} still={still} {...touch} />
      <Mug shadows={shadows} still={still} />
      <Sketchbook palette={palette} shadows={shadows} />
      <Polaroid shadows={shadows} />
      <Person palette={palette} lampOn={lampOn} shadows={shadows} still={still} />
      <Cables />
      <Flyers palette={palette} accent={accent} still={still} {...touch} />

      <CameraRig still={still} />
      <HotspotProjector />
      <Effects tier={tier} />
      <FirstFrame onReady={onReady} />
    </>
  )
}

/** Follows the scroll progress along the rig, leaning a little toward the cursor. */
function CameraRig({ still }: { still: boolean }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const size = useThree((s) => s.size)
  const tall = size.width / size.height < 0.9
  const sample = useMemo(() => createRig(tall), [tall])
  const pos = useMemo(() => new Vector3(), [])
  const look = useMemo(() => new Vector3(), [])
  const sway = useRef({ x: 0, y: 0 })

  useFrame((state, dt) => {
    const p = deskProgress.value
    const { fov, film } = sample(p, pos, look)
    if (!still) {
      // lean toward the cursor; less once the things lift off
      const reach = 1 - 0.7 * MathUtils.smoothstep(p, 0.6, 0.95)
      sway.current.x = MathUtils.damp(sway.current.x, state.pointer.x * reach, 3, dt)
      sway.current.y = MathUtils.damp(sway.current.y, state.pointer.y * reach, 3, dt)
      pos.x += sway.current.x * 0.06
      pos.y += sway.current.y * 0.035
      look.x += sway.current.x * 0.02
    }
    camera.position.copy(pos)
    camera.lookAt(look)
    if (camera.fov !== fov || camera.filmOffset !== film) {
      camera.fov = fov
      camera.filmOffset = film
      camera.updateProjectionMatrix()
    }
  })
  return null
}

/** Moves each DOM label onto its object, or hides it when the object is off screen. */
function HotspotProjector() {
  const v = useMemo(() => new Vector3(), [])
  useFrame(({ camera, size }) => {
    for (const [id, el] of hotspotEls) {
      v.set(...ANCHORS[id]).project(camera)
      const x = (v.x * 0.5 + 0.5) * size.width
      const y = (-v.y * 0.5 + 0.5) * size.height
      const inside = v.z < 1 && x > 24 && x < size.width - 24 && y > 24 && y < size.height - 24
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      el.toggleAttribute('data-off', !inside)
      // near the right edge the label goes to the left of its dot
      el.toggleAttribute('data-flip', x > size.width * 0.62)
    }
  })
  return null
}

function Effects({ tier }: { tier: DeskSceneProps['tier'] }) {
  const effects: ReactElement[] = []
  if (tier === 'high') {
    effects.push(<Bloom key="bloom" mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.25} intensity={0.75} />)
  }
  effects.push(<ToneMapping key="tone" mode={ToneMappingMode.AGX} />)
  if (tier === 'high') {
    effects.push(<Noise key="grain" premultiply blendFunction={BlendFunction.SCREEN} opacity={0.32} />)
  }
  effects.push(<Vignette key="vignette" offset={0.28} darkness={0.72} />)

  return (
    <EffectComposer multisampling={tier === 'high' ? 4 : 0} enableNormalPass={false}>
      {effects}
    </EffectComposer>
  )
}

/** Tells the stage the first frame is on screen, so the canvas can fade in over the poster. */
function FirstFrame({ onReady }: { onReady: () => void }) {
  const frames = useRef(0)
  useFrame(() => {
    // one frame is all a still (on-demand) scene gets
    frames.current++
    if (frames.current === 1) onReady()
  })
  return null
}
