import type { SiteContent } from './types'

/** Site-wide content. Phase 2: editable in the admin (Setting / SiteText). */
export const site: SiteContent = {
  brand: 'FAJLAJP',
  tagline:
    'FAJLAJP je grafik a webdesignér z Česka. Navrhuje a staví weby a e-shopy pro firmy i jednotlivce a dělá loga a tiskovou grafiku. Na poptávky odpovídá do dvou dnů.',
  // Sections of the homepage until the sub-pages exist (phase 2: /prace, /o-mne, /sluzby …).
  nav: [
    { href: '/#video', label: 'Video', index: '01' },
    { href: '/#co-delam', label: 'Co dělám', index: '02' },
    { href: '/#prace', label: 'Práce', index: '04' },
    { href: '/#o-mne', label: 'O mně', index: '05' },
    { href: '/#cenik', label: 'Ceny', index: '06' },
    { href: '/#kontakt', label: 'Kontakt', index: '08' },
  ],
  // OVĚŘIT: od kdy bere nové zakázky
  availability: { open: true, label: 'Beru nové zakázky od listopadu' },
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
