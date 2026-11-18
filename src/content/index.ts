import { home as homeCs } from './home'
import { site as siteCs } from './site'
import { categoryLabels as categoriesCs, projects as projectsCs } from './projects'
import { getSlot as getSlotCs } from './media'
import { home as homeEn } from './en/home'
import { altText, categoryLabels as categoriesEn, projectText, site as siteEn } from './en/site'
import { ui } from './ui'
import type { MediaSlot, ProjectCategory, ProjectSummary } from './types'

/**
 * The site's languages. Czech lives at `/`, English at `/en` (src/proxy.ts maps `/` onto the
 * `cs` segment). Every piece of copy is read through `getContent(lang)`.
 */
export const LANGS = ['cs', 'en'] as const
export type Lang = (typeof LANGS)[number]
export const isLang = (value: unknown): value is Lang => LANGS.includes(value as Lang)

/** The root of the homepage in a language: '/' or '/en'. */
export const rootOf = (lang: Lang) => (lang === 'cs' ? '/' : '/en')

const projectsEn: ProjectSummary[] = projectsCs.map((p) => {
  const t = projectText[p.slug]
  return t ? { ...p, title: t.title ?? p.title, summary: t.summary, role: t.role } : p
})

function getSlotEn(key: string): MediaSlot {
  const slot = getSlotCs(key)
  return { ...slot, alt: altText[key] ?? slot.alt }
}

const categoriesCsMap: Record<ProjectCategory, string> = categoriesCs
const categoriesEnMap: Record<ProjectCategory, string> = categoriesEn

const content = {
  cs: { lang: 'cs' as Lang, site: siteCs, home: homeCs, projects: projectsCs, categories: categoriesCsMap, getSlot: getSlotCs, ui: ui.cs },
  en: { lang: 'en' as Lang, site: siteEn, home: homeEn, projects: projectsEn, categories: categoriesEnMap, getSlot: getSlotEn, ui: ui.en },
}

export type Content = (typeof content)['cs']

export function getContent(lang: Lang): Content {
  return content[lang]
}
