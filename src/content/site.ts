import type { SiteContent } from './types'

/** Site-wide content. Phase 2: editable in the admin (Setting / SiteText). */
export const site: SiteContent = {
  brand: 'FAJLAJP',
  tagline: 'FAJLAJP — grafik a webdesigner. Weby, grafika a vizuální identity.',
  nav: [
    { href: '/prace', label: 'Práce', index: '01' },
    { href: '/o-mne', label: 'O mně', index: '02' },
    { href: '/sluzby', label: 'Služby', index: '03' },
    { href: '/journal', label: 'Journal', index: '04' },
    { href: '/kontakt', label: 'Kontakt', index: '05' },
  ],
  availability: { open: true, label: 'Volná kapacita od listopadu' },
  // Placeholders — real values in CHECKLIST.md › „Doplní FAJLAJP později“.
  contact: { email: 'hello@fajlajp.cz', city: 'Česko' },
  socials: [
    { label: 'Instagram', href: '#' },
    { label: 'Behance', href: '#' },
    { label: 'LinkedIn', href: '#' },
  ],
  business: {
    name: '[Jméno a příjmení]',
    address: '[Místo podnikání]',
    ico: '[IČO]',
    registry: 'Fyzická osoba zapsaná v živnostenském rejstříku',
  },
}
