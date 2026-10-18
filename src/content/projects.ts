import type { ProjectSummary } from './types'

/** Three made-up projects (no photos yet). Phase 2: moved to the DB seed. */
export const projects: ProjectSummary[] = [
  {
    slug: 'seda-zona',
    index: '01',
    title: 'Ateliér Šedá Zóna',
    summary: 'Web a vizuální identita pro architektonické studio, které staví z betonu a ticha.',
    year: 2026,
    categories: ['web', 'branding'],
    role: 'Identita, design a vývoj webu',
    slot: 'project.seda-zona',
    featured: true,
  },
  {
    slug: 'kavarna-sum',
    index: '02',
    title: 'Kavárna Šum',
    summary: 'Identita a e-shop pro noční kavárnu, kde se pracuje do rána a nikdo se neptá proč.',
    year: 2026,
    categories: ['branding', 'web'],
    role: 'Logo, obaly, e-shop',
    slot: 'project.kavarna-sum',
    featured: true,
  },
  {
    slug: 'festival-tma',
    index: '03',
    title: 'Festival Tma',
    summary: 'Plakáty, vizuál a web pro festival audiovizuálního umění. Tři noci, jedno oko.',
    year: 2025,
    categories: ['grafika', 'web'],
    role: 'Plakátová série, web',
    slot: 'project.festival-tma',
    featured: true,
  },
]

export const categoryLabels = {
  web: 'Web',
  grafika: 'Grafika',
  branding: 'Branding',
  aplikace: 'Aplikace',
} as const
