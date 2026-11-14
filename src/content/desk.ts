/**
 * Copy for the night desk (the 3D hero). Every labelled thing on the desk is one of the services;
 * a label leads to that service further down (#sluzba-<id>). The personal things — the enamel
 * mug, the photo — stay unlabelled. The lamp is the one switch.
 * Raw strings — components run prose through typo(). Drafts to confirm (CHECKLIST).
 */

import type { Service } from './home'

export type HotspotId = Service['id'] | 'lamp'

export type Hotspot = {
  id: HotspotId
  index: string
  label: string
  note: string
}

export const desk = {
  /** What the canvas shows, for screen readers (the canvas itself is hidden from them). */
  description:
    'Můj pracovní stůl v noci. Na monitoru vzniká web, vedle leží zabalený balík z e-shopu, telefon s rozdělanou aplikací a skicák s logem a vzorníkem barev. Svítí zelená lampa a z plecháčku stoupá pára.',

  /** Beat 2: the things lift off the desk and turn to chrome. */
  closer: {
    // `line` is set huge in Gloock: keep it short. `meta` is the small typewriter note above it.
    meta: 'Každá věc na stole je jedna práce. Níž ji máš rozepsanou i s cenou.',
    line: 'Tohle všechno ti udělám.',
  },

  hint: 'Najeď myší na věci na stole, nebo na ně klikni. Každá patří k jedné práci, kterou dělám.',

  lamp: { on: 'Zhasnout lampu', off: 'Rozsvítit lampu' },

  hotspots: [
    { id: 'weby', index: '01', label: 'Weby', note: 'Na monitoru mám rozdělaný web. Klikni a ukážu ti, co ode mě dostaneš.' },
    { id: 'e-shopy', index: '02', label: 'E-shopy', note: 'Objednávka #0042 je zabalená a ráno jede.' },
    { id: 'aplikace', index: '03', label: 'Aplikace', note: 'Moje první aplikace. Zatím rozdělaná, dělám na ní po nocích.' },
    { id: 'grafika', index: '04', label: 'Logo a grafika', note: 'Logo nejdřív kreslím tužkou. Barvy pak vybírám ze vzorníku.' },
    { id: 'lamp', index: '·', label: 'Lampa', note: 'Bez ní zbyde jen světlo monitoru.' },
  ] satisfies Hotspot[],
}
