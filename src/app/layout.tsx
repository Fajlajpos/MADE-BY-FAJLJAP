import type { Metadata, Viewport } from 'next'
import { site } from '@/content/site'
import { archivo, martian } from './fonts'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: { default: `${site.brand} — weby, grafika, identity`, template: `%s — ${site.brand}` },
  description: site.tagline,
}

export const viewport: Viewport = {
  themeColor: '#0b0b0a',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={`${martian.variable} ${archivo.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
