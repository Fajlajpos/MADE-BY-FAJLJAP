import type { Metadata, Viewport } from 'next'
import { site } from '@/content/site'
import { fontVariables } from './fonts'
import '@/styles/globals.css'

export const metadata: Metadata = {
  // OVĚŘIT: skutečná doména webu (nebo NEXT_PUBLIC_SITE_URL)
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fajlajp.cz'),
  title: { default: `${site.brand} — weby, e-shopy, aplikace`, template: `%s — ${site.brand}` },
  description: site.tagline,
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    siteName: site.brand,
    title: `${site.brand} — weby a e-shopy od jednoho člověka`,
    description: site.tagline,
  },
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = {
  themeColor: '#08080a',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="cs"
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        {/* before the first paint: things that only reveal or step with JS may start hidden */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
