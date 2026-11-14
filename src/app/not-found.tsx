import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { NavList } from '@/components/layout/NavList'
import { Arrow } from '@/components/ui/Arrow'
import shared from '@/features/home/home.module.css'
import { typo } from '@/lib/typo/czech'
import { Slot3D } from '@/three/site/Slot3D'
import { ThreeRoot } from '@/three/site/ThreeRoot'
import styles from './not-found.module.css'

export const metadata: Metadata = {
  title: 'Stránka nenalezena',
  robots: { index: false },
}

/** 404: a huge number, a short line, the way back, and the chrome browser window that found nothing. */
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
              <span className={styles.heading}>{typo('Tahle stránka tu není.')}</span>
            </h1>
            <p className={styles.lead}>
              {typo('Buď jsem ji přesunul, nebo nikdy neexistovala. Zbytek webu je v pořádku.')}
            </p>
            <Link href="/" className={`${shared.button} ${styles.home}`}>
              Zpátky na úvod
              <Arrow className={shared.arrow} />
            </Link>
          </div>

          <Slot3D object="browser" className={styles.object} />

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
