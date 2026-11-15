import { Interactions } from '@/components/fx/Interactions'
import { MoodLight } from '@/components/fx/Mood'
import { Reveal } from '@/components/fx/Reveal'
import { SmoothScroll } from '@/components/fx/SmoothScroll'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { ThreeRoot } from '@/three/site/ThreeRoot'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThreeRoot>
      <MoodLight />
      <a className="skip-link" href="#obsah">
        Přeskočit na obsah
      </a>
      <Header />
      <main id="obsah" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <Reveal />
      <Interactions />
      <SmoothScroll />
    </ThreeRoot>
  )
}
