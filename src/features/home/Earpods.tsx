'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import dynamic from 'next/dynamic'
import { detectTier } from '@/three/quality'
import type { Pt, Wire } from './earpodsGeometry'
import { smoothPath } from './earpodsGeometry'
import styles from './Earpods.module.css'

/** The two buds cut out of his photo: size, and where the cable leaves each (shares of the picture). */
const BUD = {
  l: { src: '/photos/earpod-l.webp', w: 312, h: 801, ax: 0.7067, ay: 0.992, rot: 4 },
  r: { src: '/photos/earpod-r.webp', w: 306, h: 696, ax: 0.201, ay: 0.991, rot: -6 },
} as const

const Cable3D = dynamic(() => import('./EarpodsCable3D'), { ssr: false })

export type Layout = {
  w: number
  h: number
  /** iPod width in px / 100: the unit everything is sized by */
  u: number
  jack: Pt
  wires: Wire[]
  /** splitter and remote: a point and the direction the cable runs there */
  beads: { at: Pt; dir: Pt; r: number; len: number }[]
  buds: { key: 'l' | 'r'; at: Pt; scale: number }[]
}

const add = (a: Pt, x: number, y: number, z = 0): Pt => [a[0] + x, a[1] + y, (a[2] ?? 0) + z]

/**
 * Measure the iPod and the playlist inside the player and lay the cable between them: out of
 * the jack at the iPod's bottom, a loose tangle under it, up to a splitter beside the playlist,
 * then one branch to each bud — the buds perched on the playlist's top corners.
 */
function measure(player: HTMLElement): Layout | null {
  const ipod = player.querySelector<HTMLElement>('[data-ipod]')
  const panel = player.querySelector<HTMLElement>('[data-earbuds]')
  if (!ipod || !panel) return null
  const o = player.getBoundingClientRect()
  const I = ipod.getBoundingClientRect()
  const P = panel.getBoundingClientRect()
  // only when the playlist stands beside the iPod (wide screens)
  if (P.left < I.right) return null

  const ix = I.left - o.left
  const iy = I.top - o.top
  const px = P.left - o.left
  const py = P.top - o.top
  const u = I.width / 100
  const jx = ix + 59.4 * u
  const c0: Pt = [jx, iy + 171 * u, 0]

  // the buds: standing by the playlist's left and right edges, level with its second track
  const budH = 0.34 * I.height
  const by = py + 0.35 * P.height + budH * 0.45
  const la: Pt = [px - 0.13 * budH, by, 0]
  const ra: Pt = [px + P.width + 0.09 * budH, by, 0]
  // where it splits: in the gap left of the playlist, a third of the way down
  const s: Pt = [la[0] - 2 * u, py + 0.8 * P.height, 0]

  // the main cable: down from the jack, a loop crossing over itself, then up to the splitter
  const loopEnd = add(c0, 44 * u, 46 * u, -1)
  const main: Pt[] = [
    c0,
    add(c0, 0, 14 * u),
    add(c0, 6 * u, 30 * u, 1),
    add(c0, 24 * u, 40 * u, 2),
    add(c0, 44 * u, 34 * u, 1),
    add(c0, 46 * u, 20 * u, 0),
    add(c0, 34 * u, 16 * u, -1),
    add(c0, 28 * u, 30 * u, -2),
    loopEnd,
    [s[0] - 2 * u, (loopEnd[1] + s[1]) / 2 + 18 * u, 0],
    // one gentle curl under the splitter
    [s[0] - 8 * u, s[1] + 30 * u, 1],
    [s[0] - 2 * u, s[1] + 14 * u, 0],
    s,
  ]
  const left: Pt[] = [s, [s[0] + 4 * u, (s[1] + la[1]) / 2, 1], add(la, 1 * u, 12 * u), la]
  // the right branch: down the left side, under the playlist, and up its right side into the bud
  const pb = py + P.height
  const right: Pt[] = [
    s,
    [s[0] + 6 * u, s[1] + 14 * u, -1],
    [s[0] + 7 * u, pb - 0.02 * P.height, -1],
    [px + 0.14 * P.width, pb + 40, 0],
    [px + 0.55 * P.width, pb + 30, 0],
    [px + P.width + 10 * u, pb - 0.08 * P.height, 1],
    add(ra, 2 * u, 26 * u),
    ra,
  ]

  // bud scale: a bud with its stem stands about a third of the iPod's height (real size)
  const scale = budH / 760
  const r = 1.1 * u
  return {
    w: o.width,
    h: o.height,
    u,
    jack: [jx, iy + 160 * u, 0],
    wires: [
      { pts: main, r },
      { pts: left, r: r * 0.8 },
      { pts: right, r: r * 0.8 },
    ],
    beads: [
      { at: s, dir: [s[0] - main[main.length - 2]![0], s[1] - main[main.length - 2]![1], 0], r: 2 * u, len: 5 * u },
      { at: right[4]!, dir: [right[5]![0] - right[3]![0], right[5]![1] - right[3]![1], 0], r: 2.2 * u, len: 9 * u },
    ],
    buds: [
      { key: 'l', at: la, scale },
      { key: 'r', at: ra, scale },
    ],
  }
}

/**
 * The earphones: plugged into the iPod, the cable tangled on the desk, the two buds (cut out
 * of his photo) resting on the corners of the playlist beside it. The cable is a 3D tube where
 * the device draws 3D, a drawn line elsewhere. Placed over the whole player, clicks pass through.
 */
export function Earpods() {
  const root = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<Layout | null>(null)
  const [three, setThree] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setThree(detectTier() === 'high'), 0)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    const player = root.current?.parentElement
    if (!player) return
    let raf = 0
    const run = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setLayout(measure(player)))
    }
    const ro = new ResizeObserver(run)
    ro.observe(player)
    player.querySelectorAll('[data-ipod],[data-earbuds]').forEach((el) => ro.observe(el))
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <div ref={root} className={styles.root} aria-hidden="true">
      {layout &&
        (three ? (
          <Cable3D layout={layout} />
        ) : (
          <svg className={styles.wire} viewBox={`0 0 ${layout.w} ${layout.h}`} width={layout.w} height={layout.h}>
            {layout.wires.map((w, i) => (
              <path key={i} d={smoothPath(w.pts)} strokeWidth={w.r * 2} />
            ))}
          </svg>
        ))}
      {layout?.buds.map(({ key, at, scale }) => {
        const b = BUD[key]
        const w = b.w * scale
        const h = b.h * scale
        return (
          // eslint-disable-next-line @next/next/no-img-element -- earbud cut-out
          <img
            key={key}
            className={styles.bud}
            src={b.src}
            alt=""
            width={b.w}
            height={b.h}
            style={
              {
                width: w,
                left: at[0] - b.ax * w,
                top: at[1] - b.ay * h,
                transformOrigin: `${b.ax * 100}% ${b.ay * 100}%`,
                rotate: `${b.rot}deg`,
              } as CSSProperties
            }
          />
        )
      })}
    </div>
  )
}
