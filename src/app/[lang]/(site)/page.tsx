import type { Metadata } from 'next'
import { About } from '@/features/home/About'
import { Contact } from '@/features/home/Contact'
import { Depth } from '@/features/home/Depth'
import { Hero } from '@/features/home/Hero'
import { Pricing } from '@/features/home/Pricing'
import { Process } from '@/features/home/Process'
import { Reel } from '@/features/home/Reel'
import { Services } from '@/features/home/Services'
import { Work } from '@/features/home/Work'
import { content } from '@/content/server'

export async function generateMetadata(): Promise<Metadata> {
  const { site, ui } = await content()
  return {
    title: { absolute: `${site.brand} — ${ui.meta.title}` },
    description: site.tagline,
  }
}

export default function Home() {
  return (
    <>
      <Hero />
      <Reel />
      <Services />
      <Depth />
      <Process />
      <Work />
      <About />
      <Pricing />
      <Contact />
    </>
  )
}
