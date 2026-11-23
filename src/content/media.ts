import type { MediaSlot } from './types'

/**
 * Media slots — places for your own photos.
 * How to add a photo now (before the admin exists):
 *   1. put the original into "design obrazky/" and run `npm run photos`: it writes a light WebP
 *      (max 2000 px, metadata stripped) into /public/photos/
 *   2. set `src: '/photos/<file>.webp'` and write a real `alt` below
 * Photos keep their own colours. Until a slot has one, it shows a lit studio backdrop
 * (`placeholder`: warm, cold or dusk light).
 */
export const mediaSlots = {
  // the cinematic reel after the hero (landscape 16:9): set `video` (+ `src` as its poster)
  'home.reel': { alt: 'FAJLAJP při práci na webu, střih z natáčení', placeholder: 'dusk' },
  // the hero: me lying on the sofa with a laptop, shot from the side, cut out (transparent PNG/WebP)
  'home.sofa': { src: '/photos/cloud-me-v4.webp', alt: 'FAJLAJP sedí na mraku s notebookem', placeholder: 'dusk' },
  'home.about': {
    src: '/photos/o-mne.webp',
    alt: 'FAJLAJP leží na kapotě modré Škody Octavia v zasněženém lese, v ruce flašku',
    placeholder: 'cold',
    focal: [0.45, 0.45],
  },
  // the photo lying on the night desk (3D hero); drawn as a print on the polaroid
  'desk.photo': { alt: 'Fotka na stole', placeholder: 'dusk', focal: [0.5, 0.45] },
  'project.seda-zona': { alt: 'Ateliér Šedá Zóna, web', placeholder: 'cold' },
  'project.cukrarna-kapucin': {
    src: '/projects/cukrarnakapucin.webp',
    alt: 'Web Cukrárna Kapucín: krémová stránka s velkým nápisem Cukrárna Kapucín, podtitulem Poctivé zakázkové pečení a vaše vysněné dorty od roku 1991 a zlatým tlačítkem Poptat pečení',
    placeholder: 'warm',
  },
  'project.servis-brzda': { alt: 'Servis Brzda, objednávky v telefonu', placeholder: 'dusk' },
  'project.karbyvisuals': {
    src: '/projects/karbyvisuals.webp',
    alt: 'Web Karbyvisuals: velký nápis KARBYVISUALS, pod ním Video produkce, natáčení akcí a střih videa a vedle přehrávač s úvodním videem',
    placeholder: 'dusk',
  },
  'project.lindashop': {
    src: '/projects/lindashop-karty.webp',
    alt: 'E-shop Linda Fashion: dvě karty, Novinky sezóny právě dorazily a Dárkový poukaz potěší vždy, pod nimi doprava, vrácení, kamenná prodejna a poradenství',
    placeholder: 'warm',
  },
} satisfies Record<string, MediaSlot>

export type SlotKey = keyof typeof mediaSlots

export function getSlot(key: string): MediaSlot {
  return (mediaSlots as Record<string, MediaSlot>)[key] ?? { alt: '', placeholder: 'dusk' }
}
