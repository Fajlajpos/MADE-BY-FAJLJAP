import { Depth } from '@/components/fx/Depth'
import { Ground } from '@/components/fx/Ground'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#obsah">
        Přeskočit na obsah
      </a>
      <Ground />
      <Header />
      <main id="obsah" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <Depth />
    </>
  )
}
