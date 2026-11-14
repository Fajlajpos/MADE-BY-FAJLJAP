import { CatmullRomCurve3, MathUtils, Vector3 } from 'three'

/**
 * The camera's path through the hero, as keyframes on the scroll progress (0–1).
 *  0     wide, from above the chair — the whole desk, the lamp on, the city outside
 *  0.3   along the desk, over the parcel, the phone and the sketchbook (the labels)
 *  0.62  back and up: the whole desk in view as the things start to lift off
 *  1     a little closer, the desk darker, as they fly out through the top of the frame
 * `film` shifts the frame sideways (PerspectiveCamera.filmOffset) so on a wide screen the desk
 * sits right of the copy.
 */

type V3 = [number, number, number]
type Key = { p: number; pos: V3; look: V3; fov: number; film: number }

const WIDE: Key[] = [
  { p: 0, pos: [1.3, 1.62, 1.75], look: [0.02, 0.98, -0.12], fov: 30, film: -7 },
  { p: 0.3, pos: [0.92, 1.3, 0.98], look: [0.18, 0.84, -0.02], fov: 32, film: -5 },
  { p: 0.62, pos: [0.46, 1.8, 1.9], look: [0.2, 0.98, -0.1], fov: 36, film: -3 },
  { p: 1, pos: [0.38, 1.72, 1.66], look: [0.2, 1.04, -0.12], fov: 36, film: -2 },
]

const TALL: Key[] = [
  { p: 0, pos: [1.15, 1.95, 2.3], look: [0.05, 0.86, -0.05], fov: 46, film: 0 },
  { p: 0.3, pos: [0.85, 1.42, 1.25], look: [0.3, 0.8, 0.05], fov: 46, film: 0 },
  { p: 0.62, pos: [0.32, 2.05, 2.4], look: [0.22, 0.92, -0.05], fov: 52, film: 0 },
  { p: 1, pos: [0.3, 1.98, 2.2], look: [0.22, 1.0, -0.1], fov: 52, film: 0 },
]

export type CameraSample = { fov: number; film: number }

export function createRig(tall: boolean) {
  const keys = tall ? TALL : WIDE
  const position = new CatmullRomCurve3(keys.map((k) => new Vector3(...k.pos)), false, 'centripetal')
  const look = new CatmullRomCurve3(keys.map((k) => new Vector3(...k.look)), false, 'centripetal')
  const last = keys.length - 1

  return function sample(p: number, outPos: Vector3, outLook: Vector3): CameraSample {
    const progress = MathUtils.clamp(p, 0, 1)
    let i = 0
    while (i < last - 1 && progress > (keys[i + 1] as Key).p) i++
    const a = keys[i] as Key
    const b = keys[i + 1] as Key
    const local = (progress - a.p) / (b.p - a.p)
    // half linear, half eased: it slows near each keyframe without stopping dead
    const eased = MathUtils.lerp(local, local * local * (3 - 2 * local), 0.55)
    const t = (i + eased) / last
    position.getPoint(t, outPos)
    look.getPoint(t, outLook)
    return {
      fov: MathUtils.lerp(a.fov, b.fov, eased),
      film: MathUtils.lerp(a.film, b.film, eased),
    }
  }
}
