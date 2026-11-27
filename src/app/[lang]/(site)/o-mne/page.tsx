import type { Metadata } from 'next'
import Link from 'next/link'
import { Arrow } from '@/components/ui/Arrow'
import { rootOf } from '@/content'
import { content } from '@/content/server'
import { typo } from '@/lib/typo/czech'
import shared from '@/features/home/home.module.css'
import styles from './page.module.css'

export async function generateMetadata(): Promise<Metadata> {
  const { home } = await content()
  return { title: home.about.now.page.title, description: home.about.now.page.lead }
}

/**
 * O mně — the long version of the playlist beside the iPod: one chapter per track, each with
 * its own anchor (#kdo-jsem …), so a click on a track in the playlist lands right on it.
 */
export default async function AboutPage() {
  const { home, lang } = await content()
  const { about } = home
  const t = about.now.page
  const root = rootOf(lang)
  const base = `${lang === 'cs' ? '' : '/en'}/o-mne`
  return (
    <section className={`${shared.section} ${styles.page}`} aria-labelledby="o-mne-title">
      <header className={styles.head}>
        <Link href={`${root}#o-mne`} className={styles.back}>
          <Arrow className={styles.backIcon} />
          {t.back}
        </Link>
        <p className={shared.label}>
          <b>{about.index}</b> {t.title}
        </p>
        <h1 id="o-mne-title" className={`${shared.h2} ${styles.title}`}>
          {t.heading}
        </h1>
        <p className={styles.lead}>{typo(t.lead)}</p>
      </header>

      <ol className={styles.chapters} role="list">
        {about.now.tracks.map((track, i) => (
          <li key={track.slug} id={track.slug} className={styles.chapter}>
            <div className={styles.side}>
              <span className={styles.num} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className={styles.meta}>
                {t.chapter} {i + 1} · {track.len}
              </span>
            </div>
            <div className={styles.body}>
              {/* the whole panel opens the track's own page */}
              <h2 className={styles.h}>
                <Link href={`${base}/${track.slug}`} className={styles.open}>
                  {typo(track.title)}
                </Link>
              </h2>
              <p className={styles.note}>{typo(track.note)}</p>
              <p className={styles.text}>{typo(track.story[0] ?? '')}</p>
              <span className={styles.play} aria-hidden="true">
                {t.open}
                <Arrow className={styles.ctaIcon} />
              </span>
            </div>
          </li>
        ))}
      </ol>

      <Link href={`${root}#kontakt`} className={styles.cta}>
        {t.cta}
        <Arrow className={styles.ctaIcon} />
      </Link>
    </section>
  )
}
