'use client'

import { useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import { CatmullRomCurve3, Quaternion, Vector3 } from 'three'
import styles from './IpodVoice.module.css'

/*
 * The earphones' cable as a real 3D tube: from a jack in the middle of the iPod's bottom, a loose
 * tangle with loops crossing over and under each other, a splitter, then one branch up to each
 * bud (the right one with the remote). Drawn once, in the same units as the iPod (100 wide,
 * 156.43 tall, y down) by an orthographic camera, so it lines up with the 2D pictures.
 */

/** The box the canvas covers, in iPod units: x 0…300, y −40…230. */
export const BOX = { x0: 0, x1: 300, y0: -40, y1: 230 }

type P = [number, number, number]
const MAIN: P[] = [
  [59.4, 158, 0], [59.6, 176, 0], [64, 194, 1], [82, 207, 2], [108, 212, 1], [130, 206, -1],
  [138, 191, -2], [127, 182, 0], [115, 191, 2], [122, 209, 3], [148, 215, 1], [171, 205, -1],
  [180, 189, 0], [171, 176, 2], [158, 183, 1], [162, 199, -2], [184, 203, 0], [199, 186, 1],
  [197, 160, 0], [187, 138, 0], [175, 122, 0],
]
const LEFT: P[] = [
  [175, 122, 0], [170, 107, 0], [175, 93, 1], [191, 86, 0], [198, 96, -1], [188, 104, 0],
  [185, 89, 1], [195, 70, 0], [204, 50, 0], [209, 33, 0], [212.4, 19, 0], [212.8, 13.2, 0],
]
const RIGHT: P[] = [
  [175, 122, 0], [184, 104, 0], [198, 88, 0], [212, 70, 0], [222, 56, 0], [233, 42, 0],
  [241, 31, 0], [248, 27.3, 0],
]

const toV = ([x, y, z]: P) => new Vector3(x, -y, z)
const curve = (pts: P[]) => new CatmullRomCurve3(pts.map(toV), false, 'centripetal')

/** Point the camera so one unit is one iPod unit, whatever size the canvas is. */
function Frame() {
  const size = useThree((s) => s.size)
  return (
    <OrthographicCamera
      makeDefault
      position={[(BOX.x0 + BOX.x1) / 2, -(BOX.y0 + BOX.y1) / 2, 100]}
      zoom={size.width / (BOX.x1 - BOX.x0)}
      near={-200}
      far={400}
    />
  )
}

function Plastic() {
  return <meshPhysicalMaterial color="#f1f1ed" roughness={0.42} clearcoat={0.5} clearcoatRoughness={0.35} />
}

function Tube({ pts, r }: { pts: P[]; r: number }) {
  const c = useMemo(() => curve(pts), [pts])
  return (
    <mesh>
      <tubeGeometry args={[c, 240, r, 14, false]} />
      <Plastic />
    </mesh>
  )
}

/** A small capsule (splitter, remote) lying along a curve at t. */
function Bead({ pts, t, r, len }: { pts: P[]; t: number; r: number; len: number }) {
  const { pos, quat } = useMemo(() => {
    const c = curve(pts)
    const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), c.getTangentAt(t).normalize())
    return { pos: c.getPointAt(t), quat: q }
  }, [pts, t])
  return (
    <mesh position={pos} quaternion={quat}>
      <capsuleGeometry args={[r, len, 6, 16]} />
      <Plastic />
    </mesh>
  )
}

function Cable() {
  return (
    <>
      <Tube pts={MAIN} r={1.15} />
      <Tube pts={LEFT} r={0.9} />
      <Tube pts={RIGHT} r={0.9} />
      {/* the splitter where it branches, the remote on the right branch */}
      <Bead pts={MAIN} t={0.985} r={2.1} len={5} />
      <Bead pts={RIGHT} t={0.5} r={2.3} len={10} />
      {/* the jack's housing and strain relief, its tip inside the iPod */}
      <mesh position={[59.4, -153, 0]}>
        <cylinderGeometry args={[2.6, 2.6, 12, 24]} />
        <Plastic />
      </mesh>
      <mesh position={[59.4, -161.5, 0]}>
        <cylinderGeometry args={[2.2, 1.3, 5, 24]} />
        <Plastic />
      </mesh>
    </>
  )
}

export default function EarphoneCable3D() {
  return (
    <Canvas
      className={styles.cable3d}
      dpr={[1, 2]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true }}
      aria-hidden="true"
    >
      <Frame />
      <hemisphereLight args={['#ffffff', '#1a1a1e', 1.1]} />
      <directionalLight position={[-60, 90, 120]} intensity={2.4} />
      <directionalLight position={[80, -40, 60]} intensity={0.5} color="#dfe4ff" />
      <Cable />
    </Canvas>
  )
}
