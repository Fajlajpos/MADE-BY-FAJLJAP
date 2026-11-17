'use client'

import { RoundedBoxGeometry } from 'three-stdlib'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CanvasTexture,
  Euler,
  Matrix4,
  MathUtils,
  MeshPhysicalMaterial,
  Quaternion,
  Raycaster,
  Vector2,
  SRGBColorSpace,
  Vector3,
  type Group,
  type Texture,
} from 'three'
import type { ChromeKit } from '../chrome/materials'
import { tokenColor } from '../tokens'

/**
 * Shared with the FAQ chapters, read and written every frame:
 *  - open: the chapter that is open, hover: the one focused in the contents (−1: none)
 *  - ndc: where the cursor is over the view (−1…1, y up), null when it is not over it
 *  - click: set by a click on the view; the pile answers it with `pick` on the case under the cursor
 *  - hit: the case under the cursor this frame (the page sets the cursor from it)
 */
export type PileState = {
  open: number
  hover: number
  ndc: { x: number; y: number } | null
  click: boolean
  hit: number
  pick?: (index: number) => void
}
export type PileRef = { current: PileState }

/** One case on the pile: its question, the colour of its band, how it lies (yaw in degrees, shift in case widths). */
export type CaseSpec = { q: string; band: 'accent' | 'blue' | 'grey'; tilt: number; shift: number }

// a case, in world units: X along the spine, Y its thickness, Z front (spine) to back
const W = 1.9
const T = 0.2
const D = 1.36
const GAP = 0.012 // the seam between tray and lid
const LID_OPEN = Math.PI * 0.78
/** How big a case is once it is out and open (the spread must fit the view). */
const OPEN_SCALE = 0.64
/** The whole scene, so the pile and an opened case both fit the slot. */
const SCENE_SCALE = 0.86

/**
 * The common questions as a pile of game cases on the desk, seen from their spines: black
 * plastic under a clear coat, each spine printed with its number and question. Hovering a
 * question slides its case a little out of the pile; opening it takes the case out, turns its
 * front to you and opens it like a book: the question printed on the inner sleeve on the left,
 * an iridescent disc turning in the tray on the right. The cases above drop into the gap.
 */
export function CasePile({ kit, pile, cases, still = false }: { kit: ChromeKit; pile?: PileRef; cases: CaseSpec[]; still?: boolean }) {
  const mats = useMemo(() => {
    const physical = (p: ConstructorParameters<typeof MeshPhysicalMaterial>[0]) => new MeshPhysicalMaterial({ envMap: kit.env, ...p })
    return {
      plastic: physical({ color: '#0c0c0f', roughness: 0.34, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.1 }),
      tray: physical({ color: '#16161a', roughness: 0.55, metalness: 0, envMapIntensity: 0.6 }),
      disc: physical({
        color: '#eef0f6',
        metalness: 1,
        roughness: 0.06,
        envMapIntensity: 2.6,
        iridescence: 1,
        iridescenceIOR: 2.1,
        iridescenceThicknessRange: [120, 1200],
        clearcoat: 1,
        clearcoatRoughness: 0.02,
      }),
      // clear plastic hub: a light glossy grey (no transmission: it would draw the scene twice a frame)
      hub: physical({ color: '#cfd3db', metalness: 0, roughness: 0.15, clearcoat: 1, envMapIntensity: 1 }),
      hole: physical({ color: '#050506', roughness: 0.9 }),
    }
  }, [kit])
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])
  // one rounded shell for every tray and lid
  const shell = useMemo(() => new RoundedBoxGeometry(W, T / 2 - GAP / 2, D, 2, 0.025), [])
  useEffect(() => () => shell.dispose(), [shell])

  // which case is under the cursor: a ray from the view's own camera
  const group = useRef<Group>(null)
  const camera = useThree((st) => st.camera)
  const gl = useThree((st) => st.gl)
  const scene = useThree((st) => st.scene)
  // compile the cases' shaders off the main path before they show: the pile is held at nothing
  // until then, so scrolling to it does not freeze on a first-frame compile
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const g = group.current
    if (!g) return
    let live = true
    gl.compileAsync(g, camera, scene)
      .catch(() => undefined)
      .finally(() => {
        if (live) setReady(true)
      })
    return () => {
      live = false
    }
  }, [gl, camera, scene])
  const ray = useMemo(() => new Raycaster(), [])
  const ndc = useMemo(() => new Vector2(), [])
  useFrame(() => {
    const s = pile?.current
    const g = group.current
    if (!s || !g) return
    let hit = -1
    if (s.ndc) {
      ndc.set(s.ndc.x, s.ndc.y)
      ray.setFromCamera(ndc, camera)
      for (const h of ray.intersectObject(g, true)) {
        let o: typeof h.object | null = h.object
        while (o && o.userData.caseIndex === undefined) o = o.parent
        if (o) {
          hit = o.userData.caseIndex as number
          break
        }
      }
    }
    s.hit = hit
    if (s.click) {
      s.click = false
      if (hit >= 0 && hit !== s.open) s.pick?.(hit)
    }
  })

  return (
    // the pile seen a little from above, so the top cover shows too
    <group ref={group} rotation={[0.34, 0, 0]} position={[0, 0, 0]} scale={ready ? SCENE_SCALE : 0.0001}>
      {cases.map((c, i) => (
        <Case key={c.q} index={i} spec={c} pile={pile} mats={mats} shell={shell} still={still} />
      ))}
    </group>
  )
}

type Mats = { plastic: MeshPhysicalMaterial; tray: MeshPhysicalMaterial; disc: MeshPhysicalMaterial; hub: MeshPhysicalMaterial; hole: MeshPhysicalMaterial }

function Case({ index, spec, pile, mats, shell, still }: { index: number; spec: CaseSpec; pile?: PileRef; mats: Mats; shell: RoundedBoxGeometry; still: boolean }) {
  const root = useRef<Group>(null)
  const lid = useRef<Group>(null)
  const disc = useRef<Group>(null)
  const prog = useRef({ open: 0, hover: 0, y: -1 })
  const restPos = useMemo(() => new Vector3(), [])
  const openPos = useMemo(() => new Vector3(), [])
  const tex = useCaseTextures(spec, index)

  // where it lies on the pile, and how it stands when it is open
  const rest = useMemo(() => new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), MathUtils.degToRad(spec.tilt * 3)), [spec.tilt])
  const openQ = useMemo(() => {
    // top face to the viewer, spine (the hinge) on the left: it opens like a book
    const basis = new Matrix4().makeBasis(new Vector3(0, -1, 0), new Vector3(0, 0, 1), new Vector3(-1, 0, 0))
    const q = new Quaternion().setFromRotationMatrix(basis)
    // turned a little, so it reads as an object and not a flat picture
    const turn = new Quaternion().setFromEuler(new Euler(-0.16, 0.38, 0))
    return turn.multiply(q)
  }, [])
  const q = useMemo(() => new Quaternion(), [])

  useFrame((state, dt) => {
    const g = root.current
    if (!g) return
    const p = prog.current
    const s = pile?.current ?? { open: -1, hover: -1, hit: -1 }
    const pointed = s.hit >= 0 ? s.hit : s.hover
    const isOpen = s.open === index
    const k = still ? 100 : 1
    p.open = MathUtils.damp(p.open, isOpen ? 1 : 0, 3.2 * k, dt)
    p.hover = MathUtils.damp(p.hover, pointed === index && !isOpen ? 1 : 0, 9 * k, dt)
    // the cases above an opened one drop into its place
    const slot = index - (s.open >= 0 && index > s.open ? 1 : 0)
    p.y = still || p.y < 0 ? slot : MathUtils.damp(p.y, slot, 7, dt)

    const e = p.open * p.open * (3 - 2 * p.open)
    restPos.set(spec.shift * W, -1.15 + p.y * (T + 0.004) + p.hover * 0.03, p.hover * 0.16)
    // once open it hangs in the air, breathing a little
    const t = still ? 0 : state.clock.elapsedTime
    openPos.set(D * 0.5 * OPEN_SCALE, 0.74 + Math.sin(t * 1.3) * 0.025, 0.45)
    // out of the pile first (toward you), then up to where it opens
    const out = Math.sin(Math.PI * Math.min(1, e * 1.15)) * 0.7
    g.position.lerpVectors(restPos, openPos, e)
    g.position.z += out
    q.slerpQuaternions(rest, openQ, e)
    g.quaternion.copy(q)
    g.scale.setScalar(MathUtils.lerp(1, OPEN_SCALE, e))

    const l = lid.current
    if (l) l.rotation.x = MathUtils.smoothstep(p.open, 0.55, 1) * LID_OPEN
    const d = disc.current
    if (d && !still) d.rotation.y += dt * (0.4 + 3 * MathUtils.smoothstep(p.open, 0.7, 1))
  })

  const half = T / 2 - GAP / 2
  return (
    <group ref={root} userData={{ caseIndex: index }}>
      {/* the tray, its floor, the disc */}
      <mesh geometry={shell} position={[0, -T / 2 + half / 2, 0]} material={mats.plastic} />
      <mesh position={[0, -GAP / 2 + 0.0005, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.tray}>
        <planeGeometry args={[W * 0.94, D * 0.9]} />
      </mesh>
      <group ref={disc} position={[0, -GAP / 2 + 0.004, 0]}>
        <mesh material={mats.disc}>
          <cylinderGeometry args={[0.56, 0.56, 0.006, 96]} />
        </mesh>
        <mesh position={[0, 0.0035, 0]} material={mats.hub}>
          <cylinderGeometry args={[0.13, 0.13, 0.002, 48]} />
        </mesh>
        <mesh position={[0, 0.004, 0]} material={mats.hole}>
          <cylinderGeometry args={[0.04, 0.04, 0.002, 32]} />
        </mesh>
      </group>
      {/* the spine, printed under the plastic */}
      <mesh position={[0, 0, D / 2 + 0.0015]}>
        <planeGeometry args={[W * 0.975, T * 0.9]} />
        <meshStandardMaterial map={tex.spine} envMap={mats.plastic.envMap} roughness={0.32} />
      </mesh>
      {/* the lid, hinged at the spine */}
      <group ref={lid} position={[0, GAP / 2, D / 2]}>
        <mesh geometry={shell} position={[0, half / 2, -D / 2]} material={mats.plastic} />
        <mesh position={[0, half + 0.0015, -D / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W * 0.95, D * 0.93]} />
          <meshStandardMaterial map={tex.cover} envMap={mats.plastic.envMap} roughness={0.32} />
        </mesh>
        <mesh position={[0, -0.0015, -D / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W * 0.93, D * 0.9]} />
          {/* paper: lit a little from within, so the sleeve reads in the dark scene */}
          <meshStandardMaterial map={tex.insert} emissiveMap={tex.insert} emissive="#ffffff" emissiveIntensity={0.45} roughness={0.7} />
        </mesh>
      </group>
    </group>
  )
}

/** The printed parts of a case (spine, front cover, inner sleeve), drawn on canvases once the fonts are in. */
function useCaseTextures(spec: CaseSpec, index: number) {
  const [tex] = useState(() => ({
    spine: canvasTexture(2048, 216, 0.6),
    cover: canvasTexture(1400, 1000, 0.5),
    insert: canvasTexture(1400, 1000, 0.55),
  }))
  useEffect(() => {
    let live = true
    const draw = () => {
      if (!live) return
      const font = getComputedStyle(document.body).fontFamily
      const band = spec.band === 'accent' ? tokenColor('orange') : spec.band === 'blue' ? tokenColor('blue') : '#8a8a90'
      const no = String(index + 1).padStart(2, '0')
      drawSpine(tex.spine, { font, band, no, q: spec.q, vol: index + 1 })
      drawCover(tex.cover, { font, band, no, vol: index + 1 })
      drawInsert(tex.insert, { font, band, no, q: spec.q })
    }
    draw()
    void document.fonts?.ready.then(draw)
    return () => {
      live = false
    }
  }, [tex, spec, index])
  useEffect(() => () => Object.values(tex).forEach((t) => t.dispose()), [tex])
  return tex
}

/** A canvas texture drawn in `w`×`h` logical units, stored at `res` of that (smaller to upload). */
function canvasTexture(w: number, h: number, res = 1): CanvasTexture {
  const c = document.createElement('canvas')
  c.width = Math.round(w * res)
  c.height = Math.round(h * res)
  c.dataset.res = String(res)
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  t.anisotropy = 8
  return t
}

/** The canvas's context set to draw in logical units, and those units' size. */
function ctxOf(t: Texture) {
  const el = t.image as HTMLCanvasElement
  const res = Number(el.dataset.res ?? 1)
  const g = el.getContext('2d')!
  g.setTransform(res, 0, 0, res, 0, 0)
  return { c: { width: el.width / res, height: el.height / res }, g, res }
}

type Print = { font: string; band: string; no: string }

function drawSpine(t: CanvasTexture, p: Print & { q: string; vol: number }) {
  const { c, g } = ctxOf(t)
  const h = c.height
  g.fillStyle = '#111114'
  g.fillRect(0, 0, c.width, h)
  // the coloured band with the number turned on its side
  g.fillStyle = p.band
  g.fillRect(0, 0, 150, h)
  g.save()
  g.translate(75, h / 2)
  g.rotate(-Math.PI / 2)
  g.fillStyle = '#08080a'
  g.font = `800 64px ${p.font}`
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(p.no, 0, 4)
  g.restore()
  // the question
  g.fillStyle = '#f4f4f2'
  g.textAlign = 'left'
  g.textBaseline = 'middle'
  let size = 92
  const q = p.q.toUpperCase()
  const room = c.width - 150 - 70 - 420
  do {
    g.font = `700 ${size}px ${p.font}`
    size -= 4
  } while (g.measureText(q).width > room && size > 40)
  g.fillText(q, 210, h / 2 + 4)
  // the edition mark at the end
  g.font = `600 40px ${p.font}`
  const mark = `FAQ · VOL. ${p.vol}`
  const mw = g.measureText(mark).width
  const x = c.width - 70 - mw
  g.strokeStyle = 'rgba(244,244,242,0.35)'
  g.lineWidth = 3
  g.strokeRect(x - 22, h / 2 - 40, mw + 44, 80)
  g.fillStyle = '#8a8a90'
  g.fillText(mark, x, h / 2 + 3)
  t.needsUpdate = true
}

function drawCover(t: CanvasTexture, p: Print & { vol: number }) {
  const { c, g } = ctxOf(t)
  const { width: w, height: h } = c
  const bg = g.createLinearGradient(0, 0, w, h)
  bg.addColorStop(0, '#1c1c22')
  bg.addColorStop(1, '#0a0a0c')
  g.fillStyle = bg
  g.fillRect(0, 0, w, h)
  // a soft light of the band's colour from one corner
  const glow = g.createRadialGradient(w * 0.85, h * 0.15, 0, w * 0.85, h * 0.15, w * 0.8)
  glow.addColorStop(0, withAlpha(p.band, 0.55))
  glow.addColorStop(1, withAlpha(p.band, 0))
  g.fillStyle = glow
  g.fillRect(0, 0, w, h)
  g.fillStyle = p.band
  g.fillRect(0, 0, w, 70)
  g.fillStyle = '#08080a'
  g.font = `800 40px ${p.font}`
  g.textBaseline = 'middle'
  g.fillText('FAJLAJP', 50, 37)
  g.textAlign = 'right'
  g.fillText(`VOL. ${p.vol}`, w - 50, 37)
  g.textAlign = 'left'
  g.fillStyle = '#f4f4f2'
  g.font = `800 520px ${p.font}`
  g.textBaseline = 'alphabetic'
  g.fillText(p.no, 40, h - 150)
  g.font = `700 64px ${p.font}`
  g.fillText('NA CO SE LIDI PTAJÍ', 56, h - 70)
  t.needsUpdate = true
}

function drawInsert(t: CanvasTexture, p: Print & { q: string }) {
  const { c, g, res } = ctxOf(t)
  const { width: w, height: h } = c
  g.fillStyle = '#ecebe6'
  g.fillRect(0, 0, w, h)
  // the sleeve stands upright when the case is open: its page runs across the canvas turned
  g.setTransform(0, -res, res, 0, 0, h * res)
  const pw = h
  const ph = w
  g.fillStyle = p.band
  g.fillRect(0, 0, 30, ph)
  g.fillStyle = '#5a5a60'
  g.font = `600 44px ${p.font}`
  g.textBaseline = 'top'
  g.fillText(`KAPITOLA ${p.no}`, 90, 80)
  g.fillStyle = '#0c0c0f'
  g.font = `800 92px ${p.font}`
  wrap(g, p.q.toUpperCase(), 90, 180, pw - 150, 104)
  g.fillStyle = '#5a5a60'
  g.font = `500 40px ${p.font}`
  g.fillText('Čti dál vedle  →', 90, ph - 110)
  t.needsUpdate = true
}

function wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number) {
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (g.measureText(next).width > max && line) {
      g.fillText(line, x, y)
      y += lh
      line = word
    } else line = next
  }
  if (line) g.fillText(line, x, y)
}

function withAlpha(color: string, a: number) {
  const c = document.createElement('canvas').getContext('2d')!
  c.fillStyle = color
  const hex = c.fillStyle as string
  if (!hex.startsWith('#')) return color
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}
