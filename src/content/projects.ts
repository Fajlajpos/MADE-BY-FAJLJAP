import type { ProjectSummary } from './types'

/** Three made-up sample projects (no photos yet), to be swapped for real work. Phase 2: moved to the DB seed. */
export const projects: ProjectSummary[] = [
  // OVĚŘIT: ukázkový projekt
  {
    slug: 'seda-zona',
    index: '01',
    title: 'Ateliér Šedá Zóna',
    summary: 'Web pro malé architektonické studio. Chtěli, aby na webu byly hlavně jejich fotky, tak jsem kolem nich nechal hodně místa a písmo dal malé.',
    year: 2026,
    categories: ['navrh', 'web'],
    role: 'Návrh a stavba webu',
    slot: 'project.seda-zona',
    object: 'browser',
    mock: 'web',
    featured: true,
  },
  // OVĚŘIT: ukázkový projekt
  {
    slug: 'kavarna-sum',
    index: '02',
    title: 'Kavárna Šum',
    summary: 'Kavárna, která má otevřeno do rána a prodává i vlastní kávu. Udělal jsem jí e-shop, kde si ji objednáš na tři kliknutí. Sedí tam hlavně lidi s notebookem, takže jsem to dělal pro lidi, jako jsem já.',
    year: 2026,
    categories: ['e-shop'],
    role: 'Návrh a stavba e-shopu',
    slot: 'project.kavarna-sum',
    object: 'mug',
    mock: 'shop',
    featured: true,
  },
  // OVĚŘIT: ukázkový projekt
  {
    slug: 'servis-brzda',
    index: '03',
    title: 'Servis Brzda',
    summary: 'Malý cykloservis, kde se opravy domlouvaly po telefonu a na papírku. Teď si zákazník opravu objedná v telefonu a dostane zprávu, když je kolo hotové.',
    year: 2025,
    categories: ['aplikace', 'navrh'],
    role: 'Návrh obrazovek a webová aplikace',
    slot: 'project.servis-brzda',
    object: 'phone',
    mock: 'app',
    featured: true,
  },
]

export const categoryLabels = {
  web: 'Web',
  'e-shop': 'E-shop',
  navrh: 'Návrh',
  aplikace: 'Aplikace',
} as const
