'use client'

import { useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import { CatmullRomCurve3, Quaternion, Vector3 } from 'three'
import type { Layout } from './Earpods'
import type { Pt } from './earpodsGeometry'
import styles from './Earpods.module.css'

/*
 * The earphones' cable as a real 3D tube, in the player's own pixels (an orthographic camera,
 * one unit = one px, y flipped), so it lines up with the iPod and the buds drawn in 2D.
 */

const toV = ([x, y, z]: Pt) => new Vector3(x, -y, z)

function Frame() {
  const size = useThree((s) => s.size)
  return (
    <OrthographicCamera
      makeDefault
      left={0}
      right={size.width}
      top={0}
      bottom={-size.height}
      position={[0, 0, 200]}
      near={-400}
      far={800}
    />
  )
}

function Plastic() {
  return <meshPhysicalMaterial color="#f1f1ed" roughness={0.42} clearcoat={0.5} clearcoatRoughness={0.35} />
}

function Tube({ pts, r }: { pts: Pt[]; r: number }) {
  const c = useMemo(() => new CatmullRomCurve3(pts.map(toV), false, 'centripetal'), [pts])
  return (
    <mesh>
      <tubeGeometry args={[c, 320, r, 14, false]} />
      <Plastic />
    </mesh>
  )
}

function Bead({ at, dir, r, len }: { at: Pt; dir: Pt; r: number; len: number }) {
  const quat = useMemo(
    () => new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(dir[0], -dir[1], 0).normalize()),
    [dir],
  )
  return (
    <mesh position={toV(at)} quaternion={quat}>
      <capsuleGeometry args={[r, len, 6, 16]} />
      <Plastic />
    </mesh>
  )
}

export default function EarpodsCable3D({ layout }: { layout: Layout }) {
  const { u, jack } = layout
  return (
    <Canvas className={styles.canvas} dpr={[1, 2]} frameloop="demand" gl={{ antialias: true, alpha: true }}>
      <Frame />
      <hemisphereLight args={['#ffffff', '#1a1a1e', 1.1]} />
      <directionalLight position={[-60, 90, 120]} intensity={2.4} />
      <directionalLight position={[80, -40, 60]} intensity={0.5} color="#dfe4ff" />
      {layout.wires.map((w, i) => (
        <Tube key={i} pts={w.pts} r={w.r} />
      ))}
      {layout.beads.map((b, i) => (
        <Bead key={i} {...b} />
      ))}
      {/* the jack's housing and strain relief, its tip inside the iPod */}
      <mesh position={toV(jack)}>
        <cylinderGeometry args={[2.6 * u, 2.6 * u, 12 * u, 24]} />
        <Plastic />
      </mesh>
      <mesh position={toV([jack[0], jack[1] + 8.5 * u, 0])}>
        <cylinderGeometry args={[2.2 * u, 1.3 * u, 5 * u, 24]} />
        <Plastic />
      </mesh>
    </Canvas>
  )
}
