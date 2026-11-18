import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { NavList } from '@/components/layout/NavList'
import { Arrow } from '@/components/ui/Arrow'
import shared from '@/features/home/home.module.css'
import { typo } from '@/lib/typo/czech'
import { content } from '@/content/server'
import { rootOf } from '@/content'
import { PhotoPrint } from '@/components/print/PhotoPrint'
import { ThreeRoot } from '@/three/site/ThreeRoot'
import styles from './not-found.module.css'

export async function generateMetadata(): Promise<Metadata> {
  const { ui } = await content()
  return { title: ui.notFound.title, robots: { index: false } }
}

/** 404: a huge number, a joke, the way back, and my photo from the snow — I got stuck too. */
export default async function NotFound() {
  const { ui, lang } = await content()
  const t = ui.notFound
  return (
    <ThreeRoot>
      <a className="skip-link" href="#obsah">
        {ui.skipLink}
      </a>
      <Header />
      <main id="obsah" tabIndex={-1} className={styles.main}>
        <div className={styles.inner}>
          <div className={styles.copy}>
            <p className={styles.code}>{t.code}</p>
            <h1 className={styles.title}>
              <span className={styles.number} aria-hidden="true">
                404
              </span>
              <span className={styles.heading}>{typo(t.heading)}</span>
            </h1>
            <p className={styles.lead}>
              {typo(t.body)}
            </p>
            <Link href={rootOf(lang)} className={`${shared.button} ${styles.home}`} data-magnetic="">
              {t.back}
              <Arrow className={shared.arrow} />
            </Link>
          </div>

          <div className={styles.object}>
            <PhotoPrint
              slot="home.about"
              stamp="'26 1 31"
              note={typo(t.note)}
              back={t.printBack}
              sizes="(min-width: 1024px) 30vw, 80vw"
            />
          </div>

          <nav className={styles.nav} aria-labelledby="nf-kam">
            <p id="nf-kam" className={styles.navTitle}>
              {t.nav}
            </p>
            <NavList className={styles.list} linkClassName={styles.link} indexClassName={styles.index} indexes />
          </nav>
        </div>
      </main>
      <Footer />
    </ThreeRoot>
  )
}
