/**
 * Content contracts for the public site.
 * Phase 1b: data lives in src/content/*.ts. Phase 2: the same shapes come from the DB
 * (SiteText, Setting, MediaSlot, Project) and these files become the seed.
 */

/** Generative stand-in shown in a media slot until a real photo is uploaded. */
export type PlaceholderVariant = 'bust' | 'facade' | 'eye' | 'desk'

export type MediaSlot = {
  /** Path under /public (e.g. '/photos/portrait.jpg'). Empty = generative placeholder. */
  src?: string
  /** Required — describes the photo for screen readers and search engines. */
  alt: string
  placeholder: PlaceholderVariant
  /** Focal point for cropping, 0–1 from the left / bottom. Default [0.5, 0.5]. */
  focal?: [number, number]
}

export type ProjectCategory = 'web' | 'grafika' | 'branding' | 'aplikace'

export type ProjectSummary = {
  slug: string
  /** Display index, e.g. '03'. */
  index: string
  title: string
  /** One or two sentences: what it is and for whom. */
  summary: string
  year: number
  categories: ProjectCategory[]
  role: string
  /** Key into mediaSlots, e.g. 'project.seda-zona'. */
  slot: string
  featured: boolean
}

export type NavItem = { href: string; label: string; index: string }

export type SiteContent = {
  brand: string
  /** One-line who/what for metadata and GEO. */
  tagline: string
  nav: NavItem[]
  availability: { open: boolean; label: string }
  contact: { email: string; city: string }
  socials: { label: string; href: string }[]
  /** § 435 OZ — filled in later (see CHECKLIST.md). */
  business: { name: string; address: string; ico: string; registry: string }
}
