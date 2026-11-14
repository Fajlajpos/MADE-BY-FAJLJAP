import type { MediaSlot } from './types'

/**
 * Media slots — places for your own photos.
 * How to add a photo now (before the admin exists):
 *   1. put the file into /public/photos/ (JPG/PNG/WebP, ideally ≥ 1600 px on the long side)
 *   2. set `src: '/photos/<file>'` and write a real `alt` below
 * Photos are printed as a riso duotone (orange + black, blue halftone). Until a slot has one, it
 * shows a printed stand-in (`placeholder`: warm = mostly orange, cold = mostly blue dots, dusk = both).
 */
export const mediaSlots = {
  // the cinematic reel after the hero (landscape 16:9): set `video` (+ `src` as its poster)
  'home.reel': { alt: 'FAJLAJP při práci na webu, střih z natáčení', placeholder: 'dusk' },
  'home.about': { alt: 'FAJLAJP při práci', placeholder: 'dusk', focal: [0.5, 0.4] },
  'home.studio.1': { alt: 'Stůl v noci, světlo z obrazovky', placeholder: 'warm' },
  'home.studio.2': { alt: 'Skici a poznámky k projektu', placeholder: 'dusk' },
  'home.studio.3': { alt: 'Oko a odraz monitoru', placeholder: 'cold' },
  'home.studio.4': { alt: 'Cestou domů, mokrá ulice pod lampou', placeholder: 'cold' },
  'home.studio.5': { alt: 'Město v noci z okna pokoje', placeholder: 'dusk' },
  'home.studio.6': { alt: 'Hrnek kávy na stole', placeholder: 'warm' },
  // the photo lying on the night desk (3D hero); drawn as a print on the polaroid
  'desk.photo': { alt: 'Fotka na stole', placeholder: 'dusk', focal: [0.5, 0.45] },
  'project.seda-zona': { alt: 'Ateliér Šedá Zóna, web a identita', placeholder: 'cold' },
  'project.kavarna-sum': { alt: 'Kavárna Šum, e-shop a obaly', placeholder: 'warm' },
  'project.festival-tma': { alt: 'Festival Tma, plakát a web', placeholder: 'dusk' },
} satisfies Record<string, MediaSlot>

export type SlotKey = keyof typeof mediaSlots

export function getSlot(key: string): MediaSlot {
  return (mediaSlots as Record<string, MediaSlot>)[key] ?? { alt: '', placeholder: 'dusk' }
}
