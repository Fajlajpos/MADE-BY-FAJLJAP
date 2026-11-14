import type { Metadata } from 'next'
import { About } from '@/features/home/About'
import { Contact } from '@/features/home/Contact'
import { Gallery } from '@/features/home/Gallery'
import { Hero } from '@/features/home/Hero'
import { Pricing } from '@/features/home/Pricing'
import { Process } from '@/features/home/Process'
import { Reel } from '@/features/home/Reel'
import { Services } from '@/features/home/Services'
import { Work } from '@/features/home/Work'
import { site } from '@/content/site'

export const metadata: Metadata = {
  title: { absolute: `${site.brand} — grafik a webdesignér. Weby, e-shopy, grafika` },
  description: site.tagline,
}

export default function Home() {
  return (
    <>
      <Hero />
      <Reel />
      <Services />
      <Process />
      <Work />
      <About />
      <Pricing />
      <Gallery />
      <Contact />
    </>
  )
}
