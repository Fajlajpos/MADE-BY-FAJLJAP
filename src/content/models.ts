/**
 * Model slots — places for your own 3D models in the night desk scene (src/three/desk).
 * Until a slot has a `src`, the scene draws its procedural stand-in, built in code.
 *
 * How to add a model:
 *   1. export it from Blender (or a phone scan: Polycam, Scaniverse) as .glb, Y up, metres
 *   2. compress it:  npx @gltf-transform/cli optimize in.glb public/models/<name>.glb --compress draco
 *   3. set `src: '/models/<name>.glb'` below; tune `scale`, `position` and `rotation` (radians)
 *      until it sits where the stand-in sat. Shadows are switched on for every mesh in it.
 */

export type ModelSlot = {
  /** Path under /public, e.g. '/models/mug.glb'. Empty = the procedural stand-in. */
  src?: string
  scale?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  /** What the object is, for the scene description and the hotspot. */
  label: string
}

export const modelSlots = {
  'desk.desk': { label: 'Stůl' },
  'desk.monitor': { label: 'Monitor' },
  'desk.keyboard': { label: 'Klávesnice' },
  'desk.mug': { label: 'Plecháček' },
  'desk.lamp': { label: 'Lampa' },
  'desk.phone': { label: 'Telefon' },
  'desk.sketchbook': { label: 'Skicák' },
  'desk.polaroid': { label: 'Fotka' },
  'desk.person': { label: 'Já u stolu' },
} satisfies Record<string, ModelSlot>

export type ModelKey = keyof typeof modelSlots

export function getModel(key: ModelKey): ModelSlot {
  return modelSlots[key]
}
