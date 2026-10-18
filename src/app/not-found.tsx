import type { Metadata } from 'next'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { NavList } from '@/components/layout/NavList'
import { typo } from '@/lib/typo/czech'
import { HomeLink, LostArt, LostSignal } from './NotFoundArt'
import styles from './not-found.module.css'

export const metadata: Metadata = {
  title: 'Stránka nenalezena',
  robots: { index: false },
}

/** Renders outside the (site) layout, so it brings its own shell. */
export default function NotFound() {
  return (
    <>
      <a className="skip-link" href="#obsah">
        Přeskočit na obsah
      </a>
      <Header />
      <main id="obsah" tabIndex={-1} className={styles.main}>
        <LostSignal>
          <div className={`meta ${styles.strip}`} aria-hidden="true">
            <span>[ERR] 404</span>
            <span>signál: žádný</span>
            <span>znaků: 0 / 0</span>
          </div>

          <LostArt className={styles.art} />

          <div className={styles.copy}>
            <h1 className={styles.title}>{typo('Tahle stránka se rozpadla na znaky.')}</h1>
            <div className={styles.side}>
              <p className={styles.lead}>
                {typo(
                  'Buď jsem ji přesunul, nebo nikdy neexistovala. Zbylo z ní jen pár teček a dvojteček. Chyba 404.',
                )}
              </p>
              <HomeLink className={styles.home}>
                <span className={styles.homeArrow} aria-hidden="true">
                  &lt;-
                </span>
                Zpátky na úvod
              </HomeLink>
              <nav className={styles.nav} aria-labelledby="nf-kam">
                <p id="nf-kam" className={`meta ${styles.navTitle}`}>
                  Nebo zkus jinou stránku (nebo Ctrl K)
                </p>
                <NavList
                  className={styles.list}
                  linkClassName={styles.link}
                  indexClassName={`meta ${styles.index}`}
                />
              </nav>
            </div>
          </div>
        </LostSignal>
      </main>
      <Footer />
    </>
  )
}
