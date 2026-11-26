import type { CSSProperties } from 'react'
import { content } from '@/content/server'
import { Words } from '@/components/fx/Words'
import { typo } from '@/lib/typo/czech'
import shared from './home.module.css'
import styles from './About.module.css'
import { IpodVoice } from './IpodVoice'

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
  const { home } = await content()
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
          <IpodVoice
            src={about.voice.src}
            title={about.voice.title}
            sub={typo(about.voice.sub)}
            soon={typo(about.voice.soon)}
            cover="/photos/ipod-cover.webp"
          />
        </div>

      </div>
    </section>
  )
}
