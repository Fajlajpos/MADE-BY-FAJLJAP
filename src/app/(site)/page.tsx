import type { Metadata } from 'next'
import { About } from '@/features/home/About'
import { Contact } from '@/features/home/Contact'
import { Craft } from '@/features/home/Craft'
import { Gallery } from '@/features/home/Gallery'
import { Hero } from '@/features/home/Hero'
import { Work } from '@/features/home/Work'
import { site } from '@/content/site'

export const metadata: Metadata = {
  title: { absolute: `${site.brand} — grafik a webdesigner. Weby, grafika, identity` },
  description: site.tagline,
}

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Work />
      <Craft />
      <Gallery />
      <Contact />
    </>
  )
}
