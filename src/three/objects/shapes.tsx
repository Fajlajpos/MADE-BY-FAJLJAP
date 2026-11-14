'use client'

import { RoundedBox } from '@react-three/drei'
import { useMemo } from 'react'
import {
  BufferGeometry,
  CatmullRomCurve3,
  DoubleSide,
  ExtrudeGeometry,
  Float32BufferAttribute,
  MeshPhysicalMaterial,
  Path,
  Shape,
  TubeGeometry,
  Vector2,
  Vector3,
  type Material,
} from 'three'
import { setText } from './glyphs'

/**
 * The objects that stand for what I do and who I am, built in code, about one unit tall and
 * centred on the origin. Each takes a material set, so the same shape is chrome on the page and
 * cardboard or black plastic on the night desk (which morphs it into chrome as it lifts off).
 *   browser → Weby · parcel → E-shopy · pen → Grafika · phone → Aplikace
 *   mug → me · plane → the contact form · play → the reel · tag → prices · wordmark → my name
 */

export type MaterialSet = {
  body: Material
  accent: Material
  accent2: Material
  inset: Material
  /** The parcel's address label (paper on the desk, enamel on the page). */
  label?: Material
}

type Props = { set: MaterialSet }

/* ── Weby: a browser window ─────────────────────────────────────────── */

export function BrowserShape({ set }: Props) {
  return (
    <group>
      <RoundedBox args={[1.6, 1.1, 0.12]} radius={0.06} smoothness={4} material={set.body} />
      <RoundedBox args={[1.46, 0.8, 0.03]} radius={0.03} position={[0, -0.08, 0.055]} material={set.inset} />
      {/* traffic lights and the address bar */}
      <mesh position={[-0.66, 0.44, 0.07]} material={set.accent}>
        <sphereGeometry args={[0.042, 20, 14]} />
      </mesh>
      <mesh position={[-0.54, 0.44, 0.07]} material={set.accent2}>
        <sphereGeometry args={[0.042, 20, 14]} />
      </mesh>
      <mesh position={[-0.42, 0.44, 0.07]} material={set.body}>
        <sphereGeometry args={[0.042, 20, 14]} />
      </mesh>
      <RoundedBox args={[0.72, 0.075, 0.03]} radius={0.03} position={[0.16, 0.44, 0.07]} material={set.inset} />
      {/* the page: a hero image, three lines of text, a button, three cards */}
      <RoundedBox args={[0.6, 0.36, 0.04]} radius={0.02} position={[-0.36, 0.06, 0.09]} material={set.accent2} />
      {[0.5, 0.42, 0.3].map((w, i) => (
        <RoundedBox key={w} args={[w, 0.05, 0.03]} radius={0.02} position={[0.06 + w / 2, 0.19 - i * 0.09, 0.085]} material={set.body} />
      ))}
      <RoundedBox args={[0.28, 0.085, 0.04]} radius={0.04} position={[0.2, -0.1, 0.09]} material={set.accent} />
      {[-0.46, 0, 0.46].map((x) => (
        <RoundedBox key={x} args={[0.4, 0.13, 0.03]} radius={0.02} position={[x, -0.34, 0.085]} material={set.body} />
      ))}
      <Cursor material={set.accent} position={[0.36, -0.16, 0.13]} />
    </group>
  )
}

function Cursor({ material, position }: { material: Material; position: [number, number, number] }) {
  const geometry = useMemo(() => {
    const s = new Shape()
    const pts: [number, number][] = [[0, 0], [0, -0.8], [0.22, -0.6], [0.36, -0.92], [0.5, -0.86], [0.36, -0.55], [0.62, -0.55]]
    pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)))
    s.closePath()
    const g = new ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 3 })
    g.scale(0.22, 0.22, 0.22)
    return g
  }, [])
  return <mesh geometry={geometry} material={material} position={position} rotation={[0, 0, 0.18]} />
}

/* ── E-shopy: a parcel with tape and a label ────────────────────────── */

/** `lines`: the printed bars on the label (off when a real label texture is on it). */
export function ParcelShape({ set, lines = true }: Props & { lines?: boolean }) {
  return (
    <group>
      <RoundedBox args={[1.1, 0.78, 0.86]} radius={0.045} smoothness={4} material={set.body} />
      {/* tape across the top, down the front and the back */}
      <mesh material={set.accent}>
        <boxGeometry args={[0.2, 0.788, 0.868]} />
      </mesh>
      {/* the address label on the front */}
      <RoundedBox args={[0.34, 0.22, 0.012]} radius={0.006} position={[0.3, 0.06, 0.434]} material={set.label ?? set.accent2} />
      {lines && [0, 1, 2].map((i) => (
        <mesh key={i} position={[0.3, 0.1 - i * 0.045, 0.442]} material={set.inset}>
          <boxGeometry args={[0.24 - i * 0.05, 0.016, 0.004]} />
        </mesh>
      ))}
    </group>
  )
}

/* ── Aplikace: a phone with an order-tracking app ───────────────────── */

/** `ui` 0–1: how far the app's shapes stand out of the screen (0 = a flat phone). */
export function PhoneShape({ set, ui = 1 }: Props & { ui?: number }) {
  return (
    <group>
      <RoundedBox args={[0.62, 1.26, 0.08]} radius={0.07} smoothness={5} material={set.body} />
      <RoundedBox args={[0.55, 1.17, 0.012]} radius={0.05} position={[0, 0, 0.04]} material={set.inset} />
      <mesh position={[0, 0.53, 0.048]} material={set.body}>
        <capsuleGeometry args={[0.018, 0.08, 4, 10]} />
      </mesh>
      {/* the map card, three steps of the order, the button */}
      <group scale={[1, 1, Math.max(0.001, ui)]} visible={ui > 0.01}>
      <RoundedBox args={[0.44, 0.34, 0.02]} radius={0.03} position={[0, 0.22, 0.052]} material={set.accent2} />
      {[0, 1, 2].map((i) => (
        <group key={i} position={[-0.15, -0.06 - i * 0.12, 0.052]}>
          <mesh material={i < 2 ? set.accent : set.body}>
            <sphereGeometry args={[0.03, 16, 12]} />
          </mesh>
          <RoundedBox args={[0.24 - i * 0.04, 0.035, 0.015]} radius={0.015} position={[0.18 - i * 0.02, 0, 0]} material={set.body} />
        </group>
      ))}
      <RoundedBox args={[0.42, 0.09, 0.03]} radius={0.045} position={[0, -0.45, 0.055]} material={set.accent} />
      </group>
    </group>
  )
}

/* ── Grafika: a pen nib ─────────────────────────────────────────────── */

export function PenShape({ set }: Props) {
  const geometry = useMemo(() => {
    // the nib from the old character shapes, on a 100 × 100 square, y down → centred units
    const p = (x: number, y: number) => new Vector2((x - 50) / 100, (50 - y) / 100)
    const s = new Shape([p(50, 2), p(82, 50), p(68, 94), p(32, 94), p(18, 50)])
    const hole = new Path()
    hole.absarc(0, (50 - 56) / 100, 0.075, 0, Math.PI * 2, true)
    s.holes.push(hole)
    const g = new ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.03, bevelSegments: 4, curveSegments: 24 })
    g.translate(0, 0, -0.05)
    return g
  }, [])
  return (
    <group>
      <mesh geometry={geometry} material={set.body} />
      {/* the slit, from the tip to the breather hole */}
      <mesh position={[0, 0.22, 0]} material={set.inset}>
        <boxGeometry args={[0.014, 0.46, 0.22]} />
      </mesh>
      <mesh position={[0, -0.06, 0]} rotation={[Math.PI / 2, 0, 0]} material={set.accent2}>
        <torusGeometry args={[0.075, 0.018, 12, 32]} />
      </mesh>
      {/* the grip it sits in */}
      <RoundedBox args={[0.42, 0.16, 0.2]} radius={0.06} position={[0, -0.52, 0]} material={set.accent} />
    </group>
  )
}

/* ── me: an enamel mug ──────────────────────────────────────────────── */

export function MugShape({ set }: Props) {
  const profile = useMemo(
    () =>
      [
        [0, 0],
        [0.36, 0],
        [0.39, 0.03],
        [0.4, 0.84],
        [0.415, 0.875],
        [0.38, 0.875],
        [0.375, 0.8],
        [0.365, 0.06],
        [0, 0.06],
      ].map(([x, y]) => new Vector2(x, y)),
    [],
  )
  return (
    <group position={[0, -0.44, 0]}>
      <mesh material={set.body}>
        <latheGeometry args={[profile, 48]} />
      </mesh>
      <mesh position={[0, 0.873, 0]} rotation={[Math.PI / 2, 0, 0]} material={set.accent2}>
        <torusGeometry args={[0.398, 0.022, 10, 48]} />
      </mesh>
      <mesh position={[0.46, 0.46, 0]} rotation={[0, 0, -Math.PI / 2 + 0.5]} material={set.body}>
        <torusGeometry args={[0.22, 0.045, 12, 28, Math.PI * 1.15]} />
      </mesh>
      <mesh position={[0, 0.72, 0]} rotation={[-Math.PI / 2, 0, 0]} material={set.inset}>
        <circleGeometry args={[0.368, 40]} />
      </mesh>
    </group>
  )
}

/* ── the contact form: a paper plane ────────────────────────────────── */

export function PlaneShape({ set }: Props) {
  const geometry = useMemo(() => {
    const nose = [0, 0, 0.9]
    const left = [-0.62, 0.02, -0.5]
    const right = [0.62, 0.02, -0.5]
    const back = [0, 0, -0.5]
    const keel = [0, -0.26, -0.5]
    const tris = [nose, back, left, nose, right, back, nose, keel, back, nose, back, keel].flat()
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(tris, 3))
    g.computeVertexNormals()
    return g
  }, [])
  const edge = useMemo(() => {
    const m = (set.accent as MeshPhysicalMaterial).clone()
    m.side = DoubleSide
    return m
  }, [set.accent])
  const body = useMemo(() => {
    const m = (set.body as MeshPhysicalMaterial).clone()
    m.side = DoubleSide
    m.flatShading = true
    return m
  }, [set.body])
  return (
    <group rotation={[0.25, -0.6, 0]}>
      <mesh geometry={geometry} material={body} />
      <mesh position={[0, 0.005, -0.5]} material={edge}>
        <boxGeometry args={[1.24, 0.012, 0.02]} />
      </mesh>
    </group>
  )
}

/* ── the reel: a chrome play button ─────────────────────────────────── */

export function PlayShape({ set }: Props) {
  // a thick coin with a rolled rim and a shallow dish, turned on a lathe (face toward +z)
  const profile = useMemo(
    () =>
      [
        [0, -0.09],
        [0.56, -0.09],
        [0.605, -0.075],
        [0.63, -0.04],
        [0.635, 0],
        [0.63, 0.045],
        [0.605, 0.08],
        [0.565, 0.092],
        [0.52, 0.086],
        [0.5, 0.06],
        [0.3, 0.035],
        [0, 0.03],
      ].map(([x, y]) => new Vector2(x, y)),
    [],
  )
  const triangle = useMemo(() => {
    // a play triangle with softened corners, nudged right so it sits optically centred
    const r = 0.05
    const pts = [new Vector2(-0.19, 0.27), new Vector2(0.29, 0), new Vector2(-0.19, -0.27)]
    const s = new Shape()
    pts.forEach((p, i) => {
      const prev = pts[(i + pts.length - 1) % pts.length]!
      const next = pts[(i + 1) % pts.length]!
      const a = p.clone().add(prev.clone().sub(p).setLength(r * 1.6))
      const b = p.clone().add(next.clone().sub(p).setLength(r * 1.6))
      if (i === 0) s.moveTo(a.x, a.y)
      else s.lineTo(a.x, a.y)
      s.quadraticCurveTo(p.x, p.y, b.x, b.y)
    })
    s.closePath()
    const g = new ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.04, bevelSegments: 5, curveSegments: 10 })
    g.translate(0.03, 0, 0)
    return g
  }, [])
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={set.body}>
        <latheGeometry args={[profile, 72]} />
      </mesh>
      {/* a black glass face inside the rim, so the triangle stands out of it */}
      <mesh position={[0, 0, 0.064]} material={set.inset}>
        <circleGeometry args={[0.495, 64]} />
      </mesh>
      <mesh position={[0, 0, 0.07]} material={set.accent2}>
        <torusGeometry args={[0.515, 0.012, 10, 72]} />
      </mesh>
      <mesh geometry={triangle} position={[0, 0, 0.07]} material={set.accent} />
    </group>
  )
}

/* ── prices: a chrome tag on a string, stamped „Kč“ ─────────────────── */

export function TagShape({ set }: Props) {
  const body = useMemo(() => {
    const s = new Shape()
    const c = 0.05 // corner chamfer
    const pts: [number, number][] = [
      [-0.5, 0.33], [0.5 - c, 0.33], [0.5, 0.33 - c], [0.5, -0.33 + c], [0.5 - c, -0.33], [-0.5, -0.33], [-0.8, -0.06], [-0.8, 0.06],
    ]
    pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)))
    s.closePath()
    const hole = new Path()
    hole.absarc(-0.62, 0, 0.065, 0, Math.PI * 2, true)
    s.holes.push(hole)
    const g = new ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.025, bevelSegments: 4, curveSegments: 32 })
    g.translate(0.15, 0, -0.025)
    return g
  }, [])
  const letters = useMemo(() => {
    const { glyphs, width } = setText('Kč', 0.07)
    return glyphs.map(({ glyph, x }) => {
      const g = new ExtrudeGeometry(glyph.shapes, { depth: 0.035, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.014, bevelSegments: 3, curveSegments: 14 })
      g.translate(x - width / 2, -0.5, 0)
      return g
    })
  }, [])
  const string = useMemo(() => {
    // a loop of string through the eyelet, going up out of the frame
    const curve = new CatmullRomCurve3(
      [
        [-0.47, 0, 0],
        [-0.5, 0.16, 0.09],
        [-0.62, 0.5, 0.07],
        [-0.74, 0.86, 0],
        [-0.6, 0.5, -0.08],
        [-0.5, 0.16, -0.09],
      ].map(([x, y, z]) => new Vector3(x, y, z)),
      true,
    )
    return new TubeGeometry(curve, 96, 0.013, 8, true)
  }, [])
  return (
    <group position={[0.06, -0.12, 0]} scale={1.2}>
      <mesh geometry={body} material={set.body} />
      {/* the stamped field and its letters */}
      <RoundedBox args={[0.74, 0.5, 0.012]} radius={0.006} position={[0.2, 0, 0.051]} material={set.inset} />
      <group position={[0.2, 0, 0.058]} scale={0.42}>
        {letters.map((g, i) => (
          <mesh key={i} geometry={g} material={set.body} />
        ))}
      </group>
      {/* the eyelet and the string */}
      <mesh position={[-0.47, 0, 0]} material={set.accent2}>
        <torusGeometry args={[0.075, 0.02, 12, 36]} />
      </mesh>
      <mesh geometry={string} material={set.accent} />
    </group>
  )
}

/* ── my name in chrome ───────────────────────────────────────────────── */

/** FAJLAJP, about 6.5 wide and 1.2 tall (the J hangs below the line); centred on the origin. */
export const WORDMARK_SIZE = { width: 6.5, height: 1.2 }

export function WordmarkShape({ set }: Props) {
  const letters = useMemo(() => {
    const { glyphs, width } = setText('FAJLAJP', 0.1)
    return glyphs.map(({ glyph, x }) => {
      const g = new ExtrudeGeometry(glyph.shapes, {
        depth: 0.16,
        bevelEnabled: true,
        bevelSize: 0.018,
        bevelOffset: -0.006,
        bevelThickness: 0.03,
        bevelSegments: 4,
        curveSegments: 18,
      })
      g.translate(x - width / 2, -0.45, -0.08)
      return g
    })
  }, [])
  return (
    <group>
      {letters.map((g, i) => (
        <mesh key={i} geometry={g} material={set.body} />
      ))}
    </group>
  )
}
