import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Arrow } from '@/components/ui/Arrow'
import { getContent, LANGS } from '@/content'
import { content } from '@/content/server'
import { typo } from '@/lib/typo/czech'
import shared from '@/features/home/home.module.css'
import styles from './page.module.css'

type Photo = { src: string; alt: string; caption: string }
type Item = { k: string; v: string }

/** One page per playlist track, built ahead in both languages. */
export function generateStaticParams() {
  return LANGS.flatMap((lang) => getContent(lang).home.about.now.tracks.map((t) => ({ lang, slug: t.slug })))
}
export const dynamicParams = false

export async function generateMetadata({ params }: PageProps<'/[lang]/o-mne/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const { home } = await content()
  const track = home.about.now.tracks.find((t) => t.slug === slug)
  return track ? { title: track.title, description: track.note } : {}
}

/**
 * A track from the playlist beside the iPod, opened: every one is built differently —
 * photos of me, a timeline, what I'm on (as progress bars), my day, and what I do outside
 * websites. At the bottom the previous / next track, like on the player.
 */
export default async function TrackPage({ params }: PageProps<'/[lang]/o-mne/[slug]'>) {
  const { slug } = await params
  const { home, lang } = await content()
  const { now } = home.about
  const i = now.tracks.findIndex((t) => t.slug === slug)
  const track = now.tracks[i]
  if (!track) notFound()
  const t = now.page
  const base = `${lang === 'cs' ? '' : '/en'}/o-mne`
  const prev = now.tracks[i - 1]
  const next = now.tracks[i + 1]
  const photos: Photo[] = track.photos
  const items: Item[] = track.items
  const num = String(i + 1).padStart(2, '0')

  return (
    <article className={`${shared.section} ${styles.page}`} data-kind={track.kind} aria-labelledby="skladba-title">
      <Link href={base} className={styles.back}>
        <Arrow className={styles.backIcon} />
        {t.backList}
      </Link>

      {/* the "now playing" head: track number, the bars, how long it plays */}
      <header className={styles.head}>
        <p className={styles.meta}>
          <span className={styles.eq} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          {t.chapter} {num} / {String(now.tracks.length).padStart(2, '0')} · {track.len}
        </p>
        <h1 id="skladba-title" className={`${shared.h2} ${styles.title}`}>
          {typo(track.title)}
        </h1>
        <div className={styles.story}>
          {track.story.map((p, k) => (
            <p key={k} className={k === 0 ? styles.first : styles.text}>
              {typo(p)}
            </p>
          ))}
        </div>
      </header>

      {/* ── what the track is made of: different for each ── */}
      {photos.length > 0 && (
        <ul className={styles.photos} role="list">
          {photos.map((ph, k) => (
            <li key={k} className={styles.photo} style={{ '--tilt': `${[-2, 1.5, -1, 2][k % 4]}deg` } as CSSProperties}>
              <div className={styles.frame}>
                {ph.src ? (
                  // eslint-disable-next-line @next/next/no-img-element -- my photos
                  <img src={ph.src} alt={ph.alt} loading={k < 2 ? 'eager' : 'lazy'} decoding="async" />
                ) : (
                  <span className={styles.empty}>{t.empty}</span>
                )}
              </div>
              <span className={styles.caption}>{typo(ph.caption)}</span>
            </li>
          ))}
        </ul>
      )}

      {track.kind === 'timeline' ? (
        <ol className={styles.timeline} role="list">
          {items.map((it, k) => (
            <li key={k} className={styles.step}>
              <span className={styles.year}>{it.k}</span>
              <p className={styles.stepText}>{typo(it.v)}</p>
            </li>
          ))}
        </ol>
      ) : track.kind === 'now' ? (
        <ul className={styles.bars} role="list">
          {items.map((it, k) => (
            <li key={k} className={styles.bar}>
              <span className={styles.barHead}>
                <span>{typo(it.k)}</span>
                <span className={styles.barPct}>{it.v} %</span>
              </span>
              <span className={styles.rail} aria-hidden="true">
                <span className={styles.fill} style={{ '--p': Number(it.v) / 100 } as CSSProperties} />
              </span>
            </li>
          ))}
        </ul>
      ) : track.kind === 'day' ? (
        <ol className={styles.day} role="list">
          {items.map((it, k) => (
            <li key={k} className={styles.slot}>
              <time className={styles.time}>{it.k}</time>
              <p className={styles.stepText}>{typo(it.v)}</p>
            </li>
          ))}
        </ol>
      ) : (
        <dl className={styles.facts}>
          {items.map((it, k) => (
            <div key={k} className={styles.fact}>
              <dt>{it.k}</dt>
              <dd>{typo(it.v)}</dd>
            </div>
          ))}
        </dl>
      )}

      {track.kind === 'outside' && (
        <a className={styles.cta} href="https://www.instagram.com/fajlajpos/" target="_blank" rel="noopener noreferrer">
          {t.instagram}
          <Arrow className={styles.ctaIcon} />
        </a>
      )}

      {/* previous / next track, like on the player */}
      <nav className={styles.skip} aria-label={t.chapter}>
        {prev ? (
          <Link href={`${base}/${prev.slug}`} className={styles.skipLink}>
            <span className={styles.skipLabel}>
              <Arrow className={styles.skipBack} />
              {t.prev}
            </span>
            <span className={styles.skipTitle}>{typo(prev.title)}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`${base}/${next.slug}`} className={`${styles.skipLink} ${styles.skipNext}`}>
            <span className={styles.skipLabel}>
              {t.next}
              <Arrow className={styles.skipIcon} />
            </span>
            <span className={styles.skipTitle}>{typo(next.title)}</span>
          </Link>
        ) : (
          <Link href={base} className={`${styles.skipLink} ${styles.skipNext}`}>
            <span className={styles.skipLabel}>{t.backList}</span>
            <span className={styles.skipTitle}>{t.heading}</span>
          </Link>
        )}
      </nav>
    </article>
  )
}
