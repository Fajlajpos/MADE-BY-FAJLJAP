import type { Metadata, Viewport } from 'next'
import { site } from '@/content/site'
import { fontVariables } from './fonts'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: { default: `${site.brand} — weby, e-shopy, grafika`, template: `%s — ${site.brand}` },
  description: site.tagline,
}

export const viewport: Viewport = {
  themeColor: '#0e0d0c',
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
