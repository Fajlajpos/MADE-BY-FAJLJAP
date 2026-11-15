import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { NavList } from '@/components/layout/NavList'
import { Arrow } from '@/components/ui/Arrow'
import shared from '@/features/home/home.module.css'
import { typo } from '@/lib/typo/czech'
import { PhotoPrint } from '@/components/print/PhotoPrint'
import { ThreeRoot } from '@/three/site/ThreeRoot'
import styles from './not-found.module.css'

export const metadata: Metadata = {
  title: 'Stránka nenalezena',
  robots: { index: false },
}

/** 404: a huge number, a joke, the way back, and my photo from the snow — I got stuck too. */
export default function NotFound() {
  return (
    <ThreeRoot>
      <a className="skip-link" href="#obsah">
        Přeskočit na obsah
      </a>
      <Header />
      <main id="obsah" tabIndex={-1} className={styles.main}>
        <div className={styles.inner}>
          <div className={styles.copy}>
            <p className={styles.code}>Chyba 404</p>
            <h1 className={styles.title}>
              <span className={styles.number} aria-hidden="true">
                404
              </span>
              <span className={styles.heading}>{typo('Tahle stránka zapadla sněhem.')}</span>
            </h1>
            <p className={styles.lead}>
              {typo('Buď jsem ji přesunul, nebo nikdy neexistovala. Já jsem se taky jednou zasekl, viz fotka. Zbytek webu ale jede.')}
            </p>
            <Link href="/" className={`${shared.button} ${styles.home}`} data-magnetic="">
              Zpátky na úvod
              <Arrow className={shared.arrow} />
            </Link>
          </div>

          <div className={styles.object}>
            <PhotoPrint
              slot="home.about"
              stamp="'26 1 31"
              note={typo('Taky jsem se zasekl.')}
              back={['Zadní strana', 'Nakonec jsme vyjeli.', 'Ty se vrať na úvod.']}
              sizes="(min-width: 1024px) 30vw, 80vw"
            />
          </div>

          <nav className={styles.nav} aria-labelledby="nf-kam">
            <p id="nf-kam" className={styles.navTitle}>
              Nebo rovnou sem
            </p>
            <NavList className={styles.list} linkClassName={styles.link} indexClassName={styles.index} indexes />
          </nav>
        </div>
      </main>
      <Footer />
    </ThreeRoot>
  )
}
