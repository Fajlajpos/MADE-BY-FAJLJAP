import type { MediaSlot } from './types'

/**
 * Media slots — places for your own photos.
 * How to add a photo now (before the admin exists):
 *   1. put the file into /public/photos/ (JPG/PNG/WebP, ideally ≥ 1600 px on the long side)
 *   2. set `src: '/photos/<file>'` and write a real `alt` below
 * The photo shows in black and white; on hover it dissolves into characters (Photo + AsciiScene).
 * Until then each slot runs its generative placeholder in characters.
 */
export const mediaSlots = {
  'home.hero': {
    alt: 'FAJLAJP, portrét',
    placeholder: 'bust',
    focal: [0.5, 0.6],
  },
  'home.about': {
    alt: 'FAJLAJP při práci',
    placeholder: 'bust',
  },
  'home.studio.1': { alt: 'Stůl v noci, světlo z obrazovky', placeholder: 'desk' },
  'home.studio.2': { alt: 'Skici a poznámky k projektu', placeholder: 'facade' },
  'home.studio.3': { alt: 'Oko a odraz monitoru', placeholder: 'eye' },
  'home.studio.4': { alt: 'Cestou domů, panelové sídliště', placeholder: 'facade' },
  'home.studio.5': { alt: 'Sídliště v noci', placeholder: 'facade' },
  'home.studio.6': { alt: 'Hrnek kávy na stole', placeholder: 'desk' },
  'project.seda-zona': { alt: 'Ateliér Šedá Zóna, panelový dům', placeholder: 'facade' },
  'project.kavarna-sum': { alt: 'Kavárna Šum, noční stůl', placeholder: 'desk' },
  'project.festival-tma': { alt: 'Festival Tma, plakát s okem', placeholder: 'eye' },
} satisfies Record<string, MediaSlot>

export type SlotKey = keyof typeof mediaSlots

export function getSlot(key: string): MediaSlot {
  return (mediaSlots as Record<string, MediaSlot>)[key] ?? { alt: '', placeholder: 'bust' }
}
