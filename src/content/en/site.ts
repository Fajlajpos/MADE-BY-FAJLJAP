import type { SiteContent } from '../types'
import { site as cs } from '../site'

/** Site-wide content in English: the Czech file with its words swapped. */
export const site: SiteContent = {
  ...cs,
  tagline:
    'FAJLAJP is a web designer from Czechia. He designs and builds websites, online shops and web apps for companies and individuals. He replies to inquiries within two days.',
  nav: [
    { href: '/en#video', label: 'Video', index: '01' },
    { href: '/en#co-delam', label: 'What I do', index: '02' },
    { href: '/en#prace', label: 'Work', index: '04' },
    { href: '/en#o-mne', label: 'About', index: '05' },
    { href: '/en#cenik', label: 'Pricing', index: '06' },
    { href: '/en#kontakt', label: 'Contact', index: '07' },
  ],
  availability: { ...cs.availability, label: 'Taking new work from November' },
  contact: { ...cs.contact, city: 'Czechia' },
  business: { ...cs.business, registry: 'Sole trader registered in the Czech Trade Register' },
}

/** Projects in English: only the words change (by slug); everything else comes from the Czech list. */
export const projectText: Record<string, { title?: string; summary: string; role: string }> = {
  lindashop: {
    summary:
      "A women's fashion boutique in Italian style from Sokolov. I built them an online shop where customers browse collections by type of clothing and order in a few clicks. The physical store has its own spot on the site with opening hours and a map, because plenty of people want to try the dresses on first.",
    role: 'Design and build of the shop',
  },
  karbyvisuals: {
    summary:
      "A portfolio for a cinematographer and photographer who shoots music videos and events and edits for Czech YouTubers. His video plays the lead right at the top, wrapped in dark film grain and big type, so the site feels like his work. It's in Czech and English and you can send an inquiry straight from the site.",
    role: 'Design and build of the website',
  },
  'seda-zona': {
    title: 'Grey Zone Studio',
    summary: 'A website for a small architecture studio. They wanted it to be mostly about their photos, so I left lots of room around them and kept the type small.',
    role: 'Design and build of the website',
  },
  'cukrarna-kapucin': {
    title: 'Kapucín Patisserie',
    summary:
      "A family patisserie that has been baking cakes to order since 1991. I made their site warm and calm like their shop window: cream colours, elegant type and little drawings of pastries. You can ask for a cake right from the site, in Czech or German.",
    role: 'Design and build of the website',
  },
  'servis-brzda': {
    title: 'Brzda Bike Service',
    summary: 'A small bike repair shop where repairs used to be arranged by phone and on scraps of paper. Now customers book a repair on their phone and get a message when the bike is ready.',
    role: 'Screen design and a web app',
  },
}

export const categoryLabels = {
  web: 'Website',
  'e-shop': 'Online shop',
  navrh: 'Design',
  redesign: 'Redesign',
  aplikace: 'App',
} as const

/** Image descriptions in English, by media slot. */
export const altText: Record<string, string> = {
  'home.reel': 'FAJLAJP at work on a website, a cut from the shoot',
  'home.sofa': 'FAJLAJP lying on a sofa with a laptop',
  'home.about': 'FAJLAJP lying on the bonnet of a blue Škoda Octavia in a snowy forest, a bottle in hand',
  'desk.photo': 'A photo on the desk',
  'project.seda-zona': 'Grey Zone Studio, website',
  'project.cukrarna-kapucin':
    'The Kapucín Patisserie website: a cream page with the big title Cukrárna Kapucín, the line “honest custom baking and your dream cakes since 1991” and a golden button to ask for baking',
  'project.servis-brzda': 'Brzda Bike Service, orders on a phone',
  'project.karbyvisuals':
    'The Karbyvisuals website: the big title KARBYVISUALS, below it “video production, event filming and video editing” and beside it a player with the intro video',
  'project.lindashop':
    'The Linda Fashion shop: two cards, new season arrivals and a gift voucher, below them delivery, returns, the physical store and advice',
}
