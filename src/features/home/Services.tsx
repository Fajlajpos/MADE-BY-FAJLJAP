import type { CSSProperties } from 'react'
import { Arrow } from '@/components/ui/Arrow'
import type { Service } from '@/content/home'
import { content } from '@/content/server'
import { Words } from '@/components/fx/Words'
import { typo } from '@/lib/typo/czech'
import { Slot3D } from '@/three/site/Slot3D'
import shared from './home.module.css'
import styles from './Services.module.css'

/**
 * Your chrome art for each service (a cut-out PNG/WebP in /public/brand, transparent background).
 * Empty: the service's 3D chrome object stands in its place until you add one.
 */
/** The 3D piece each service shows here (its own, not the hero's). */
const PIECE = { weby: 'cursor', 'e-shopy': 'bag', redesign: 'drop', aplikace: 'appicon' } as const

const ART: Record<Service['id'], string> = {
  weby: '',
  'e-shopy': '',
  redesign: '',
  aplikace: '',
}

/**
 * 02 Co dělám — the four services as tiles side by side, each a dark card in a rendered
 * liquid-chrome frame: the service's object on top, then its number and name in chrome, what it
 * is and what you get. No glow. Each keeps its id (#sluzba-weby …): other parts link to them.
 */
export async function Services() {
  const { home } = await content()
  const { services } = home
  return (
    <section id="co-delam" className={shared.section} aria-labelledby="co-delam-title">
      <header className={styles.head}>
        <p className={`${shared.label} ${styles.label}`} data-reveal="">
          <b>{services.index}</b> {services.label}
        </p>
        <h2 id="co-delam-title" className={`${shared.h2} ${styles.h2}`} data-reveal="" style={{ '--reveal-i': 1 } as CSSProperties}>
          <Words text={services.heading} />
        </h2>
        <p className={`${shared.lead} ${styles.lead}`} data-reveal="" style={{ '--reveal-i': 2 } as CSSProperties}>
          {typo(services.lead)}
        </p>
      </header>

      <ul className={styles.grid} role="list">
        {services.items.map((item, i) => (
          <li
            key={item.id}
            id={`sluzba-${item.id}`}
            className={styles.tile}
            data-reveal=""
            style={{ '--reveal-i': i } as CSSProperties}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- the rendered chrome frame round the card */}
            <img className={styles.frameImg} src={`/brand/card-frame-${i % 4}.webp`} alt="" aria-hidden="true" loading="lazy" />
            <article aria-labelledby={`sluzba-${item.id}-title`} className={styles.inner}>
              <div className={styles.art}>
                {ART[item.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- a cut-out render, sized by the slot
                  <img src={ART[item.id]} alt="" className={styles.artImg} loading="lazy" />
                ) : (
                  <Slot3D object={PIECE[item.id]} className={styles.object} scale={1.3} label={item.title} />
                )}
              </div>
              <div className={styles.meta}>
                <span className={styles.num} aria-hidden="true">
                  {item.index}
                </span>
                {item.tag && <span className={styles.tag}>{item.tag}</span>}
              </div>
              <h3 id={`sluzba-${item.id}-title`} className={styles.title}>
                {item.title}
              </h3>
              <div className={styles.more}>
              <p className={styles.body}>{typo(item.body)}</p>
              <ul className={styles.points} role="list">
                {item.points.map((point) => (
                  <li key={point}>{typo(point)}</li>
                ))}
              </ul>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <p className={styles.cta}>
        <a className={shared.button} href="#kontakt" data-magnetic="">
          {services.cta}
          <Arrow className={shared.arrow} />
        </a>
      </p>
    </section>
  )
}
