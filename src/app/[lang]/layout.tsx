import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { LANGS, isLang } from '@/content'
import { LangProvider } from '@/content/client'
import { content, getLang } from '@/content/server'
import { fontVariables } from '../fonts'
import '@/styles/globals.css'

/** Both languages are built ahead; no other first segment exists. */
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}
export const dynamicParams = false

export async function generateMetadata(): Promise<Metadata> {
  const { site, ui } = await content()
  return {
    // OVĚŘIT: skutečná doména webu (nebo NEXT_PUBLIC_SITE_URL)
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fajlajp.cz'),
    title: { default: `${site.brand} — ${ui.meta.default}`, template: `%s — ${site.brand}` },
    description: site.tagline,
    // the same page in the other language, for search engines
    alternates: { languages: { cs: '/', en: '/en' } },
    openGraph: {
      type: 'website',
      locale: ui.meta.locale,
      siteName: site.brand,
      title: `${site.brand} — ${ui.meta.og}`,
      description: site.tagline,
    },
    twitter: { card: 'summary_large_image' },
  }
}

export const viewport: Viewport = {
  themeColor: '#08080a',
  colorScheme: 'dark',
}

export default async function RootLayout({ children }: LayoutProps<'/[lang]'>) {
  const lang = await getLang()
  if (!isLang(lang)) notFound()
  return (
    <html lang={lang} className={fontVariables} suppressHydrationWarning>
      <head>
        {/* before the first paint: things that only reveal or step with JS may start hidden */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <LangProvider lang={lang}>{children}</LangProvider>
      </body>
    </html>
  )
}
