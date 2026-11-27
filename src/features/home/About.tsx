import type { CSSProperties } from 'react'
import Link from 'next/link'
import { Arrow } from '@/components/ui/Arrow'
import { content } from '@/content/server'
import { Words } from '@/components/fx/Words'
import { typo } from '@/lib/typo/czech'
import shared from './home.module.css'
import styles from './About.module.css'
import { IpodVoice } from './IpodVoice'
import { Earpods } from './Earpods'

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- the typed note is off for now, kept for later
/** The typed note beside the ID card. OVĚŘIT: přepiš si to vlastními slovy. */
const NOTE = {
  head: 'Pár řádků o mně',
  lines: [
    'Ahoj, jsem FAJLAJP.',
    'Weby dělám sám, od prvního nápadu až po poslední opravenou čárku. Žádná agentura, žádný přeposílání mailů.',
    'Nejvíc mi to jde večer, když je ticho. Přes den ale odpovídám taky.',
    'Baví mě, když web není jen hezkej, ale když je na něm poznat, čí je.',
  ],
  sign: '— F.',
}

/**
 * O mně — everything comes out of my wallet: the head (label, heading, two paragraphs), the open
 * wallet with the @fajlajpos tag, then what else is in it: my old iPod with a voice note on it,
 * and a typed note beside it.
 */
export async function About() {
  const { home, lang } = await content()
  const page = `${lang === 'cs' ? '' : '/en'}/o-mne`
  const { about } = home
  return (
    <section id="o-mne" className={`${shared.section} ${styles.section}`} aria-labelledby="o-mne-title">
      <header className={styles.head}>
        <p className={shared.label} data-reveal="">
          <b>{about.index}</b> {about.label}
        </p>
        <h2
          id="o-mne-title"
          className={`${shared.h2} ${styles.title}`}
          data-reveal=""
          style={{ '--reveal-i': 1 } as CSSProperties}
        >
          <Words text={about.heading} />
        </h2>
        <div className={styles.body} data-reveal="" style={{ '--reveal-i': 2 } as CSSProperties}>
          {about.body.map((p, i) => (
            <p key={i} className={i === 0 ? styles.first : styles.text}>
              {typo(p)}
            </p>
          ))}
        </div>
      </header>

      <figure className={styles.walletWrap} data-reveal="">
        {/* eslint-disable-next-line @next/next/no-img-element -- a cut-out photo */}
        <img className={styles.wallet} src="/photos/wallet-v3.webp" alt={typo(about.caption)} width={1903} height={1158} loading="lazy" />
        {/* an Instagram-style tag over my head on the photo */}
        <a className={styles.igTag} href="https://www.instagram.com/fajlajpos/" target="_blank" rel="noopener noreferrer">
          @fajlajpos
          <span className="visually-hidden"> na Instagramu (otevře se v novém okně)</span>
        </a>
      </figure>

      <div className={styles.contents}>
        {/* my old iPod out of the wallet, with my voice note on it (put the file in /public/audio
            and set content › about.voice.src) */}
        <div className={styles.player} data-reveal="">
          <div className={styles.stageWrap}>
            <IpodVoice
              src={about.voice.src}
              title={about.voice.title}
              sub={typo(about.voice.sub)}
              soon={typo(about.voice.soon)}
              cover="/photos/ipod-cover.webp"
            />
          </div>

          {/* five things about me as the iPod's playlist; each opens its chapter on /o-mne */}
          <nav className={styles.playlist} aria-labelledby="o-mne-playlist" data-earbuds="">
            <div className={styles.plHead}>
              <h3 id="o-mne-playlist" className={styles.plTitle}>
                {about.now.label}
              </h3>
              <span className={styles.plCount}>
                {about.now.tracks.length} {about.now.count}
              </span>
            </div>
            <ol className={styles.tracks} role="list">
              {about.now.tracks.map((t, i) => (
                <li key={t.slug}>
                  <Link href={`${page}/${t.slug}`} className={styles.track} data-on={i === 0 || undefined}>
                    <span className={styles.trNum} aria-hidden="true">
                      {i === 0 ? (
                        <span className={styles.eq}>
                          <i />
                          <i />
                          <i />
                        </span>
                      ) : (
                        String(i + 1).padStart(2, '0')
                      )}
                    </span>
                    <span className={styles.trText}>
                      <span className={styles.trTitle}>{typo(t.title)}</span>
                      <span className={styles.trNote}>{typo(t.note)}</span>
                    </span>
                    <span className={styles.trLen}>{t.len}</span>
                  </Link>
                </li>
              ))}
            </ol>
            <Link href={page} className={styles.more}>
              {about.now.more}
              <Arrow className={styles.moreIcon} />
            </Link>
          </nav>

          {/* the earphones: plugged into the iPod, the buds on the playlist's corners */}
          <Earpods />
        </div>
      </div>
    </section>
  )
}
