import type { ProjectSummary } from './types'

/** Three made-up sample projects (no photos yet), to be swapped for real work. Phase 2: moved to the DB seed. */
export const projects: ProjectSummary[] = [
  // OVĚŘIT: ukázkový projekt
  {
    slug: 'seda-zona',
    index: '01',
    title: 'Ateliér Šedá Zóna',
    summary: 'Web a logo pro malé architektonické studio. Chtěli, aby na webu byly hlavně jejich fotky, tak jsem kolem nich nechal hodně místa a písmo dal malé.',
    year: 2026,
    categories: ['web', 'branding'],
    role: 'Logo, návrh a stavba webu',
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
    summary: 'Kavárna, která má otevřeno do rána. Udělal jsem jí logo, obaly na kávu a e-shop. Sedí tam hlavně lidi s notebookem, takže jsem to dělal pro lidi, jako jsem já.',
    year: 2026,
    categories: ['branding', 'web'],
    role: 'Logo, obaly, e-shop',
    slot: 'project.kavarna-sum',
    object: 'mug',
    mock: 'shop',
    featured: true,
  },
  // OVĚŘIT: ukázkový projekt
  {
    slug: 'festival-tma',
    index: '03',
    title: 'Festival Tma',
    summary: 'Plakáty a web pro festival audiovizuálního umění. Byly to tři noci v zatemněném sále, takže plakáty musely jít přečíst i večer na zastávce pod jednou lampou.',
    year: 2025,
    categories: ['grafika', 'web'],
    role: 'Série plakátů, web',
    slot: 'project.festival-tma',
    object: 'play',
    mock: 'poster',
    featured: true,
  },
]

export const categoryLabels = {
  web: 'Web',
  grafika: 'Grafika',
  branding: 'Logo a identita',
  aplikace: 'Aplikace',
} as const
