import type { ProjectSummary } from './types'

/** Two real projects, then made-up samples (no photos yet), to be swapped for real work. Phase 2: moved to the DB seed. */
export const projects: ProjectSummary[] = [
  // A real project: the screenshot is the live site (public/projects/lindashop-karty.webp).
  // OVĚŘIT: rok, rozsah práce a text
  {
    slug: 'lindashop',
    index: '01',
    title: 'Linda Fashion',
    summary: 'Butik s dámskou módou v italském stylu ze Sokolova. Udělal jsem mu e-shop, kde si zákaznice projde kolekce podle druhu oblečení a objedná na pár kliknutí. Kamenná prodejna má na webu vlastní místo s otevírací dobou a mapou, protože spousta lidí si šaty chce nejdřív vyzkoušet.',
    year: 2026,
    categories: ['e-shop', 'navrh'],
    role: 'Návrh a stavba e-shopu',
    slot: 'project.lindashop',
    object: 'parcel',
    mock: 'shop',
    url: 'https://lindashop.cz',
    featured: true,
  },
  // A real project: the screenshot is the live site (public/projects/karbyvisuals.webp).
  // OVĚŘIT: rok, rozsah práce a text
  {
    slug: 'karbyvisuals',
    index: '02',
    title: 'Karbyvisuals',
    summary: 'Portfolio kameramana a fotografa, který točí videoklipy, akce a stříhá pro české youtubery. Hlavní roli tam hraje jeho video hned v úvodu, kolem tmavé filmové zrno a velké písmo, aby web působil jako jeho práce. Je česky i anglicky a poptávku pošleš rovnou z webu.',
    year: 2026,
    categories: ['web', 'navrh'],
    role: 'Návrh a stavba webu',
    slot: 'project.karbyvisuals',
    object: 'camera',
    mock: 'web',
    url: 'https://karbyvisuals.cz',
    window: 'dark',
    featured: true,
  },
  // OVĚŘIT: ukázkový projekt
  {
    slug: 'seda-zona',
    index: '03',
    title: 'Ateliér Šedá Zóna',
    summary: 'Web pro malé architektonické studio. Chtěli, aby tam byly hlavně jejich fotky, tak jsem kolem nich nechal hodně místa a písmo dal malý.',
    year: 2026,
    categories: ['navrh', 'web'],
    role: 'Návrh a stavba webu',
    slot: 'project.seda-zona',
    object: 'browser',
    mock: 'web',
    featured: true,
  },
  // A real project: the screenshot is the live site (public/projects/cukrarnakapucin.webp).
  // OVĚŘIT: rok, rozsah práce a text
  {
    slug: 'cukrarna-kapucin',
    index: '04',
    title: 'Cukrárna Kapucín',
    summary: 'Rodinná cukrárna, která peče dorty na zakázku už od roku 1991. Web jsem jí udělal teplý a klidný jako jejich výloha: krémová barva, elegantní písmo a drobné kresby zákusků. Dort si u nich poptáš rovnou z webu a je česky i německy.',
    year: 2026,
    categories: ['web', 'navrh'],
    role: 'Návrh a stavba webu',
    slot: 'project.cukrarna-kapucin',
    object: 'mug',
    mock: 'web',
    url: 'https://cukrarnakapucin.cz',
    featured: true,
  },
  // OVĚŘIT: ukázkový projekt
  {
    slug: 'servis-brzda',
    index: '05',
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
  redesign: 'Redesign',
  aplikace: 'Aplikace',
} as const
