import { Archivo, Martian_Mono } from 'next/font/google'

// Martian Mono: the machine voice — headlines, UI, metadata and every character field.
// The wdth axis (75–112.5 %) stretches the same letter sideways: the typographic smear.
export const martian = Martian_Mono({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  display: 'swap',
  variable: '--font-martian',
})

// Archivo: the human voice, only for longer paragraphs.
export const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-archivo',
})
