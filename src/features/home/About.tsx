import type { CSSProperties } from 'react'
import { content } from '@/content/server'
import { Words } from '@/components/fx/Words'
import { typo } from '@/lib/typo/czech'
import shared from './home.module.css'
import styles from './About.module.css'

/** Your own ID card render (a cut-out .webp in /public/photos, e.g. '/photos/id-card.webp'). Empty: the CSS card. */
const CARD_ART = ''

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
 * wallet with the @fajlajpos tag, then what else is in it: my "ID card" with the facts, and a few
 * polaroids lying next to it.
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
        {/* the ID card out of the wallet: your own render if there is one, else the CSS card */}
        {CARD_ART ? (
          <figure className={styles.cardArt} data-reveal="">
            {/* eslint-disable-next-line @next/next/no-img-element -- my own ID card render */}
            <img src={CARD_ART} alt="" width={1586} height={1000} loading="lazy" />
            <figcaption className="visually-hidden">
              {about.facts.map((f) => `${f.label}: ${f.value}`).join(', ')}
            </figcaption>
          </figure>
        ) : (
        <article className={styles.card} data-reveal="" aria-label="Moje karta">
          <div className={styles.cardTop}>
            <span className={styles.cardKind}>Průkaz · FAJLAJP</span>
            <span className={styles.chip} aria-hidden="true" />
          </div>
          <dl className={styles.fields}>
            {about.facts.map((f) => (
              <div key={f.label} className={styles.field}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
          <p className={styles.cardFoot}>{typo(about.caption)}</p>
        </article>
        )}

        {/* a sheet of paper typed on a typewriter */}
        <div className={styles.paper} data-reveal="">
          <p className={styles.paperHead}>{NOTE.head}</p>
          {NOTE.lines.map((l, i) => (
            <p key={i}>{typo(l)}</p>
          ))}
          <p className={styles.paperSign}>{NOTE.sign}</p>
        </div>
      </div>
    </section>
  )
}
