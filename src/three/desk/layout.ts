import type { HotspotId } from '@/content/desk'

/**
 * Where everything stands, in metres. The desk top is at y = 0.75, its front edge at z = 0.4,
 * the wall with the window behind it at z = -0.45. x runs left to right as seen from the chair.
 */

type V3 = [number, number, number]

export const DESK = { width: 1.6, depth: 0.8, top: 0.75, thickness: 0.035 }
export const WALL_Z = -0.45
export const WINDOW = { x0: 0.18, x1: 1.18, y0: 0.98, y1: 1.98 }

export const PLACE = {
  monitor: [-0.08, DESK.top, -0.24] as V3,
  keyboard: [-0.08, DESK.top, 0.1] as V3,
  mouse: [0.24, DESK.top, 0.12] as V3,
  mug: [0.27, DESK.top, -0.07] as V3,
  lamp: [-0.62, DESK.top, -0.24] as V3,
  sketchbook: [0.6, DESK.top, 0.2] as V3,
  polaroid: [-0.46, DESK.top, 0.17] as V3,
}

/** The lamp: base, elbow, head and the spot on the desk its light points at. */
export const LAMP = {
  base: PLACE.lamp,
  elbow: [-0.56, 1.2, -0.16] as V3,
  head: [-0.3, 1.24, -0.02] as V3,
  aim: [-0.12, DESK.top, 0.08] as V3,
}

/** The monitor's screen: centre and size. */
export const SCREEN = { center: [-0.08, 1.08, -0.225] as V3, width: 0.6, height: 0.375 }

/**
 * The four services on the desk, as they rest there (position, rotation, scale of a ~1 unit
 * object) and where they fly at the end of the hero.
 * The browser has no resting place: it is born out of the monitor.
 */
export type Flyer = {
  rest: V3
  rot: V3
  scale: number
  /** Where it ends, off the top of the frame. */
  away: V3
  /** Order of the lift-off, 0–3. */
  order: number
}

export const FLYERS = {
  browser: {
    rest: [SCREEN.center[0], SCREEN.center[1], SCREEN.center[2] + 0.02],
    rot: [0, 0, 0],
    scale: 0.3,
    away: [-0.55, 2.6, 0.2],
    order: 0,
  },
  parcel: { rest: [0.6, DESK.top + 0.085, -0.19], rot: [0, -0.35, 0], scale: 0.22, away: [0.9, 2.5, 0], order: 1 },
  phone: { rest: [0.28, DESK.top + 0.006, 0.27], rot: [-Math.PI / 2, 0, -0.32], scale: 0.12, away: [0.1, 2.4, 0.5], order: 2 },
  pen: { rest: [0.68, DESK.top + 0.03, 0.22], rot: [-Math.PI / 2, 0, 0.9], scale: 0.1, away: [1.1, 2.3, 0.4], order: 3 },
} satisfies Record<string, Flyer>

/** Points the DOM labels are pinned to. */
export const ANCHORS: Record<HotspotId, V3> = {
  weby: [0.16, 1.27, -0.22],
  'e-shopy': [0.6, 0.99, -0.19],
  aplikace: [0.28, 0.78, 0.27],
  grafika: [0.54, 0.79, 0.16],
  lamp: [-0.3, 1.27, -0.02],
}
