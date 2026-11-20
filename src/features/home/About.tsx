import { content } from '@/content/server'
import { typo } from '@/lib/typo/czech'
import shared from './home.module.css'
import styles from './About.module.css'

/**
 * O mně — my photo on the left as a real print (taped, dated, turn it over); the copy on
 * the right: heading, two paragraphs, then the facts as a ruled two-column list.
 */
export async function About() {
  const { home } = await content()
  const { about } = home
  return (
    <section id="o-mne" className={`${shared.section} ${styles.section}`} aria-labelledby="o-mne-title">
      {/* for now the whole section is my wallet, open (public/photos/wallet-v3.webp); the texts come back with the redesign */}
      <h2 id="o-mne-title" className="visually-hidden">
        {about.heading}
      </h2>
      <div className={styles.walletWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a cut-out photo */}
        <img className={styles.wallet} src="/photos/wallet-v3.webp" alt={typo(about.caption)} width={1903} height={1158} loading="lazy" />
        {/* an Instagram-style tag over my head on the photo */}
        <a className={styles.igTag} href="https://www.instagram.com/fajlajpos/" target="_blank" rel="noopener noreferrer">
          @fajlajpos
          <span className="visually-hidden"> na Instagramu (otevře se v novém okně)</span>
        </a>
      </div>
    </section>
  )
}
