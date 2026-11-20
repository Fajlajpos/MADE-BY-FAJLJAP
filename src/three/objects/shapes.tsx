'use client'

import { RoundedBox as DreiRoundedBox } from '@react-three/drei'
import type { ComponentProps } from 'react'
import { useEffect, useMemo } from 'react'
import {
  BufferGeometry,
  CatmullRomCurve3,
  LatheGeometry,
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
 *   camera → a film camera (a project for a cinematographer)
 *   glasses · can · keys · headphones · controller → my own things: the sunglasses I wear all year,
 *   an energy drink, the Octavia's key, my headphones, a game controller
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

/**
 * Every box of the objects, inflated like the liquid chrome title: its edges rounded to most of
 * half its thinnest side, with enough segments to stay smooth, so nothing reads as a hard edge.
 */
function RoundedBox(props: ComponentProps<typeof DreiRoundedBox>) {
  const args = (props.args ?? [1, 1, 1]) as [number, number, number]
  const thin = Math.min(args[0], args[1], args[2])
  // thin parts round all the way, big blocks (the parcel) only so far, so they keep their shape
  const radius = Math.max(props.radius ?? 0, Math.min(thin * 0.46, 0.16))
  return <DreiRoundedBox {...props} radius={radius} smoothness={8} />
}

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

/* ── A film camera: the body, two reels on top, the lens toward you ───── */

export function CameraShape({ set }: Props) {
  return (
    <group position={[0, -0.12, 0]}>
      {/* the body */}
      <RoundedBox args={[0.92, 0.56, 0.5]} radius={0.06} smoothness={4} material={set.body} />
      {/* a dark panel on the side and the recording light */}
      <RoundedBox args={[0.42, 0.26, 0.02]} radius={0.02} position={[0.08, 0.02, 0.255]} material={set.inset} />
      <mesh position={[0.36, 0.2, 0.26]} material={set.accent}>
        <sphereGeometry args={[0.035, 20, 14]} />
      </mesh>
      {/* the lens: a barrel stepping out of the front, its glass and a hood */}
      <group position={[-0.62, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh position={[0, 0.06, 0]} material={set.body}>
          <cylinderGeometry args={[0.17, 0.19, 0.12, 40]} />
        </mesh>
        <mesh position={[0, -0.06, 0]} material={set.body}>
          <cylinderGeometry args={[0.15, 0.15, 0.14, 40]} />
        </mesh>
        {[0.02, -0.04].map((y) => (
          <mesh key={y} position={[0, y, 0]} material={set.inset}>
            <torusGeometry args={[0.165, 0.012, 10, 40]} />
          </mesh>
        ))}
        <mesh position={[0, -0.17, 0]} material={set.body}>
          <cylinderGeometry args={[0.2, 0.15, 0.1, 40, 1, true]} />
        </mesh>
        <mesh position={[0, -0.135, 0]} material={set.accent2}>
          <sphereGeometry args={[0.13, 32, 16, 0, Math.PI * 2, Math.PI * 0.62, Math.PI * 0.38]} />
        </mesh>
      </group>
      {/* the two reels on top */}
      {[
        [-0.2, 0.52, 0.27],
        [0.24, 0.48, 0.23],
      ].map(([x, y, r]) => (
        <group key={x} position={[x!, y!, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh material={set.body}>
            <cylinderGeometry args={[r!, r!, 0.1, 48]} />
          </mesh>
          <mesh position={[0, 0.052, 0]} material={set.inset}>
            <cylinderGeometry args={[r! * 0.32, r! * 0.32, 0.01, 24]} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[Math.cos((i * Math.PI * 2) / 3) * r! * 0.62, 0.052, Math.sin((i * Math.PI * 2) / 3) * r! * 0.62]} material={set.inset}>
              <cylinderGeometry args={[r! * 0.18, r! * 0.18, 0.01, 20]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* the handle at the back */}
      <RoundedBox args={[0.12, 0.3, 0.14]} radius={0.04} position={[0.36, -0.36, 0]} material={set.body} />
    </group>
  )
}

/* ── My things: sport sunglasses, a drink can, the car key ──────────── */

/**
 * My sunglasses: a chunky wraparound frame in the "catfish" shape — two oval lenses that curve
 * round the face and narrow toward the temples, a thick rounded rim, broad arms. Silver chrome
 * frame, green mirrored lenses.
 */
export function GlassesShape({ set }: Props) {
  // the lenses: the frame's chrome tinted green, with an oily sheen, like a mirrored coating
  const lens = useMemo(() => {
    const m = set.body.clone() as MeshPhysicalMaterial
    m.side = DoubleSide
    if (m.isMeshPhysicalMaterial) {
      m.color.set('#4d6a22')
      m.metalness = 0.75
      m.roughness = 0.1
      m.iridescence = 0.8
      m.iridescenceIOR = 1.8
    }
    return m
  }, [set.body])
  useEffect(() => () => lens.dispose(), [lens])
  const turn = 0.46 // how far each lens turns round the face
  const r = 0.62 // distance of the lens centres from the middle of the head
  return (
    <group rotation={[0.08, 0, 0]}>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * Math.sin(turn) * r * 1.25, 0, Math.cos(turn) * r]} rotation={[0, s * turn, s * -0.1]}>
          {/* the thick rim round the oval lens */}
          <mesh material={set.body} scale={[1.45, 0.7, 1]}>
            <torusGeometry args={[0.34, 0.1, 20, 56]} />
          </mesh>
          {/* the lens, slightly domed */}
          <mesh material={lens} scale={[1.45, 0.7, 0.18]} position={[0, 0, -0.02]}>
            <sphereGeometry args={[0.34, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          {/* the frame thickening toward the outer end, where the arm grows out */}
          <RoundedBox args={[0.22, 0.24, 0.16]} radius={0.07} position={[s * 0.5, 0.04, -0.06]} material={set.body} />
        </group>
      ))}
      {/* the bridge, a heavy rounded bar between the lenses */}
      <RoundedBox args={[0.2, 0.16, 0.16]} radius={0.07} position={[0, 0.08, 0.6]} material={set.body} />
      {/* the broad arms, flaring back from the frame and narrowing to the ends */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.86, 0.05, 0.18]} rotation={[0, s * -0.08, 0]}>
          <RoundedBox args={[0.1, 0.24, 0.7]} radius={0.045} position={[0, 0, -0.3]} material={set.body} />
          <RoundedBox args={[0.08, 0.13, 0.55]} radius={0.04} position={[0, -0.02, -0.88]} rotation={[0.12, 0, 0]} material={set.body} />
        </group>
      ))}
    </group>
  )
}

/** An energy drink: the tall slim can, a printed band in the accent, the neck, rim and ring pull. */
export function CanShape({ set }: Props) {
  const r = 0.27
  return (
    <group rotation={[0, 0, 0.12]}>
      <mesh material={set.body}>
        <cylinderGeometry args={[r, r, 1.3, 48]} />
      </mesh>
      {/* the printed band and a thin stripe above it */}
      <mesh position={[0, -0.08, 0]} material={set.accent}>
        <cylinderGeometry args={[r + 0.003, r + 0.003, 0.56, 48, 1, true]} />
      </mesh>
      <mesh position={[0, 0.3, 0]} material={set.accent}>
        <cylinderGeometry args={[r + 0.003, r + 0.003, 0.05, 48, 1, true]} />
      </mesh>
      {/* the neck and the bottom curving in */}
      <mesh position={[0, 0.7, 0]} material={set.body}>
        <cylinderGeometry args={[0.22, r, 0.1, 48]} />
      </mesh>
      <mesh position={[0, -0.69, 0]} material={set.body}>
        <cylinderGeometry args={[r, 0.22, 0.08, 48]} />
      </mesh>
      <mesh position={[0, 0.755, 0]} rotation={[Math.PI / 2, 0, 0]} material={set.body}>
        <torusGeometry args={[0.215, 0.018, 10, 48]} />
      </mesh>
      <mesh position={[0, 0.748, 0]} material={set.inset}>
        <cylinderGeometry args={[0.205, 0.205, 0.01, 40]} />
      </mesh>
      {/* the ring pull */}
      <group position={[0.05, 0.765, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh material={set.body}>
          <torusGeometry args={[0.055, 0.015, 10, 24]} />
        </mesh>
        <RoundedBox args={[0.07, 0.1, 0.02]} radius={0.01} position={[-0.08, 0, 0]} material={set.body} />
      </group>
    </group>
  )
}

/** Over-ear headphones: the arched headband with its padding, two big cups on yokes, soft cushions. */
export function HeadphonesShape({ set }: Props) {
  return (
    <group rotation={[0, 0.3, 0]}>
      {/* the headband: an arch, with a padded strip under it */}
      <mesh position={[0, 0.05, 0]} material={set.body}>
        <torusGeometry args={[0.62, 0.055, 16, 64, Math.PI]} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[0, 0, Math.PI * 0.18]} material={set.inset}>
        <torusGeometry args={[0.56, 0.05, 12, 48, Math.PI * 0.64]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.64, -0.12, 0]}>
          {/* the yoke from the band down to the cup */}
          <RoundedBox args={[0.06, 0.26, 0.1]} radius={0.025} position={[0, 0.13, 0]} material={set.body} />
          {/* the cup, its accent ring and the cushion facing in */}
          <group rotation={[0, 0, Math.PI / 2]}>
            <mesh material={set.body}>
              <cylinderGeometry args={[0.27, 0.29, 0.16, 48]} />
            </mesh>
            <mesh position={[0, s * -0.085, 0]} material={set.accent}>
              <torusGeometry args={[0.2, 0.018, 10, 40]} />
            </mesh>
          </group>
          <mesh position={[s * -0.11, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={set.inset}>
            <torusGeometry args={[0.2, 0.07, 14, 40]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** A game controller: the body with two grips, a d-pad, four face buttons, two thumbsticks. */
export function ControllerShape({ set }: Props) {
  return (
    <group rotation={[0.35, 0, 0]}>
      <RoundedBox args={[1.2, 0.52, 0.26]} radius={0.12} smoothness={4} material={set.body} />
      {/* the grips, sloping down and out */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.45, -0.3, -0.02]} rotation={[0, 0, s * 0.45]} material={set.body}>
          <capsuleGeometry args={[0.17, 0.28, 10, 24]} />
        </mesh>
      ))}
      {/* the d-pad */}
      <group position={[-0.36, 0.06, 0.14]}>
        <RoundedBox args={[0.2, 0.065, 0.04]} radius={0.015} material={set.inset} />
        <RoundedBox args={[0.065, 0.2, 0.04]} radius={0.015} material={set.inset} />
      </group>
      {/* the four face buttons, one in the accent */}
      {[
        [0.36, 0.15],
        [0.45, 0.06],
        [0.36, -0.03],
        [0.27, 0.06],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x!, y!, 0.14]} rotation={[Math.PI / 2, 0, 0]} material={i === 0 ? set.accent : set.inset}>
          <cylinderGeometry args={[0.04, 0.04, 0.04, 20]} />
        </mesh>
      ))}
      {/* the thumbsticks */}
      {[-0.17, 0.17].map((x) => (
        <group key={x} position={[x, -0.14, 0.13]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={set.inset}>
            <cylinderGeometry args={[0.04, 0.05, 0.06, 20]} />
          </mesh>
          <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]} material={set.body}>
            <cylinderGeometry args={[0.085, 0.085, 0.035, 28]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** The car key: a flip-key fob with three buttons, its blade out, on a key ring. */
export function KeysShape({ set }: Props) {
  return (
    <group rotation={[0, 0, -0.35]}>
      <RoundedBox args={[0.46, 0.8, 0.16]} radius={0.08} smoothness={4} material={set.body} />
      {/* the buttons: lock, unlock, boot */}
      {[0.18, 0, -0.18].map((y, i) => (
        <mesh key={y} position={[0, y + 0.04, 0.08]} rotation={[Math.PI / 2, 0, 0]} material={i === 0 ? set.accent : set.inset}>
          <cylinderGeometry args={[0.075, 0.075, 0.03, 28]} />
        </mesh>
      ))}
      {/* the blade, flipped out of the bottom, with its cuts */}
      <group position={[0.04, -0.4, 0]}>
        <RoundedBox args={[0.12, 0.72, 0.05]} radius={0.015} position={[0, -0.36, 0]} material={set.body} />
        {[-0.2, -0.38, -0.56].map((y) => (
          <mesh key={y} position={[0.06, y, 0]} material={set.inset}>
            <boxGeometry args={[0.04, 0.05, 0.055]} />
          </mesh>
        ))}
      </group>
      {/* the ring through the top */}
      <mesh position={[0, 0.58, 0]} rotation={[0, Math.PI / 2, 0]} material={set.body}>
        <torusGeometry args={[0.2, 0.025, 12, 48]} />
      </mesh>
    </group>
  )
}

/* ── The services' pieces in Co dělám: a cursor, a bag, a drop, an app icon ── */

/** Weby: a big chrome cursor arrow, deeply bevelled so it reads as poured metal. */
export function CursorBigShape({ set }: Props) {
  const geometry = useMemo(() => {
    const s = new Shape()
    const pts: [number, number][] = [[0, 0], [0, -1.15], [0.3, -0.86], [0.52, -1.32], [0.72, -1.22], [0.5, -0.78], [0.9, -0.78]]
    pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)))
    s.closePath()
    const g = new ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelSize: 0.09, bevelThickness: 0.12, bevelSegments: 10, curveSegments: 24 })
    g.center()
    return g
  }, [])
  return (
    <group rotation={[0, 0, 0.2]}>
      <mesh geometry={geometry} material={set.body} />
    </group>
  )
}

/** E-shopy: a shopping bag, soft and rounded, with two tube handles and a red tag. */
export function BagShape({ set }: Props) {
  return (
    <group position={[0, -0.12, 0]}>
      <RoundedBox args={[0.95, 0.85, 0.42]} radius={0.16} smoothness={8} material={set.body} />
      {[-0.2, 0.2].map((x) => (
        <mesh key={x} position={[x, 0.42, 0]} material={set.body}>
          <torusGeometry args={[0.13, 0.035, 16, 40, Math.PI]} />
        </mesh>
      ))}
      <RoundedBox args={[0.22, 0.14, 0.03]} radius={0.04} position={[0.28, -0.18, 0.22]} rotation={[0, 0, -0.2]} material={set.accent} />
    </group>
  )
}

/** Redesign: a drop of liquid chrome, with a smaller drop falling away from it. */
export function DropShape({ set }: Props) {
  const geometry = useMemo(() => {
    // a lathe profile: round at the bottom, drawn out into a point at the top
    const pts: Vector2[] = []
    for (let i = 0; i <= 40; i++) {
      const t = i / 40
      const y = -0.55 + t * 1.25
      const r = t < 0.5 ? Math.sin(Math.acos(1 - t * 2)) * 0.5 : 0.5 * Math.pow(1 - (t - 0.5) / 0.5, 1.6)
      pts.push(new Vector2(Math.max(0.0001, r), y))
    }
    return new LatheGeometry(pts, 64)
  }, [])
  return (
    <group rotation={[0, 0, -0.15]}>
      <mesh geometry={geometry} material={set.body} />
      <mesh position={[0.42, -0.62, 0.1]} material={set.body}>
        <sphereGeometry args={[0.12, 32, 24]} />
      </mesh>
    </group>
  )
}

/** Aplikace: an app icon, a chrome squircle with a glass face and a red notification bubble. */
export function AppIconShape({ set }: Props) {
  return (
    <group rotation={[0.1, 0, 0]}>
      <RoundedBox args={[1, 1, 0.24]} radius={0.12} smoothness={10} material={set.body} />
      <RoundedBox args={[0.74, 0.74, 0.04]} radius={0.16} smoothness={8} position={[0, 0, 0.12]} material={set.inset} />
      <mesh position={[0, 0, 0.16]} material={set.body}>
        <torusGeometry args={[0.18, 0.06, 20, 48]} />
      </mesh>
      <mesh position={[0.46, 0.46, 0.14]} material={set.accent}>
        <sphereGeometry args={[0.13, 32, 24]} />
      </mesh>
    </group>
  )
}

/* ── A card frame: a liquid chrome tube round a tall rounded rectangle ─ */

/**
 * The edge for the service cards: a closed tube following a tall rounded rectangle (about the
 * cards' shape), its thickness swelling and pinching along the way like poured chrome. Rendered
 * once to public/brand/card-frame.webp and used as the cards' border image.
 */
/** The four looks of the frame (one per service): slow bulges, big swells, quick ripples, drops. */
const FRAME_LOOKS = [
  // smooth tube with a few big drops
  { a: 0.12, f1: 3, f2: 2, b: 0.04, f3: 9, base: 0.05, blobs: 5, size: 2.2, width: 0.007, seed: 1 },
  // many small knots all round
  { a: 0.1, f1: 5, f2: 3, b: 0.06, f3: 15, base: 0.045, blobs: 14, size: 1.5, width: 0.005, seed: 7 },
  // quick ripples and two huge swells
  { a: 0.22, f1: 11, f2: 9, b: 0.18, f3: 27, base: 0.045, blobs: 3, size: 3.2, width: 0.01, seed: 3 },
  // lumpy, uneven, drips everywhere
  { a: 0.45, f1: 7, f2: 4, b: 0.1, f3: 13, base: 0.05, blobs: 9, size: 2.6, width: 0.008, seed: 11 },
]

export function FrameShape({ set, look = 0 }: Props & { look?: number }) {
  const L = FRAME_LOOKS[look % FRAME_LOOKS.length]!
  const geometry = useMemo(() => {
    const w = 1.0, h = 2.2, r = 0.22
    const pts: Vector3[] = []
    const corner = (cx: number, cy: number, a0: number) => {
      for (let k = 0; k <= 6; k++) {
        const a = a0 + (k / 6) * (Math.PI / 2)
        pts.push(new Vector3(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0))
      }
    }
    corner(w / 2 - r, h / 2 - r, 0)
    corner(-w / 2 + r, h / 2 - r, Math.PI / 2)
    corner(-w / 2 + r, -h / 2 + r, Math.PI)
    corner(w / 2 - r, -h / 2 + r, (3 * Math.PI) / 2)
    const curve = new CatmullRomCurve3(pts, true, 'centripetal')
    const tubular = 1100, radial = 56, base = L.base
    const g = new TubeGeometry(curve, tubular, base, radial, true)
    // swell and pinch along the length: a few slow bulges plus smaller ripples
    const pos = g.getAttribute('position')
    const v = new Vector3(), c = new Vector3()
    for (let i = 0; i < pos.count; i++) {
      const u = Math.floor(i / (radial + 1)) / tubular
      curve.getPointAt(u % 1, c)
      v.fromBufferAttribute(pos, i).sub(c)
      const t = u * Math.PI * 2
      let s = 1 + L.a * Math.sin(t * L.f1 + 0.7 + look) * Math.sin(t * L.f2 + 1.9) + L.b * Math.sin(t * L.f3 + look * 2)
      // the offshoots: round swells at places along the tube (fixed per look)
      for (let k = 0; k < L.blobs; k++) {
        const at = (Math.sin((k + 1) * 12.9898 * L.seed) * 43758.5453) % 1
        const c0 = at < 0 ? at + 1 : at
        let d = Math.abs(u - c0)
        d = Math.min(d, 1 - d)
        const size = L.size * (0.6 + 0.4 * Math.abs(Math.sin(k * 3.7 + L.seed)))
        s += size * Math.exp(-(d * d) / (2 * L.width * L.width))
      }
      const grow = Math.max(0.55, s)
      const out = new Vector3(c.x, c.y, 0).normalize().multiplyScalar(base * (grow - 1) * 0.9)
      v.multiplyScalar(grow).add(c).add(out)
      pos.setXYZ(i, v.x, v.y, v.z)
    }
    // keep the tube's own (radial) normals: recomputing them would crease the seam where it closes
    return g
  }, [L, look])
  // liquid chrome like the title: a hard mirror, deep blacks and bright highlights, no oily film
  const material = useMemo(() => {
    const m = (set.body as MeshPhysicalMaterial).clone()
    m.color.set('#ffffff')
    m.metalness = 1
    m.roughness = 0.015
    m.envMapIntensity = 2.4
    m.clearcoat = 1
    m.clearcoatRoughness = 0.01
    m.iridescence = 0
    return m
  }, [set.body])
  useEffect(() => () => material.dispose(), [material])
  return <mesh geometry={geometry} material={material} />
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
