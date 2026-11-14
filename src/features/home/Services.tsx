import type { CSSProperties } from 'react'
import { Showcase, type Corner, type Hue } from '@/components/showcase/Showcase'
import { Arrow } from '@/components/ui/Arrow'
import type { MockKind } from '@/components/ui/UiMock'
import { home, type Service } from '@/content/home'
import { Words } from '@/components/fx/Words'
import { typo } from '@/lib/typo/czech'
import shared from './home.module.css'
import styles from './Services.module.css'

/** What each service shows on its card: the picture, the light, where its object sits. */
const LOOK: Record<Service['id'], { mock: MockKind; hue: Hue; corner: Corner }> = {
  weby: { mock: 'web', hue: 'cold', corner: 'tr' },
  'e-shopy': { mock: 'shop', hue: 'warm', corner: 'tl' },
  navrh: { mock: 'design', hue: 'green', corner: 'tr' },
  aplikace: { mock: 'app', hue: 'violet', corner: 'tl' },
}

/**
 * 02 Co dělám — the four services as large cards: on a dark metal plate a picture of that kind
 * of work (a website, a coffee e-shop, a brand board, an app), its chrome object sitting on the
 * plate's corner; beside it the title, what it is and what you get. On a wide screen the cards
 * alternate sides. Each service keeps its id (#sluzba-weby …) — other parts of the site link to them.
 */
export function Services() {
  const { services } = home
  return (
    <section id="co-delam" className={shared.section} aria-labelledby="co-delam-title">
      <header className={styles.head}>
        <p className={`${shared.label} ${styles.label}`} data-reveal="">
          <b>{services.index}</b> {services.label}
        </p>
        <h2
          id="co-delam-title"
          className={`${shared.h2} ${styles.h2}`}
          data-reveal=""
          style={{ '--reveal-i': 1 } as CSSProperties}
        >
          <Words text={services.heading} />
        </h2>
        <p
          className={`${shared.lead} ${styles.lead}`}
          data-reveal=""
          style={{ '--reveal-i': 2 } as CSSProperties}
        >
          {typo(services.lead)}
        </p>
      </header>

      <div className={styles.list}>
        {services.items.map((item) => {
          const look = LOOK[item.id]
          return (
            <article
              key={item.id}
              id={`sluzba-${item.id}`}
              className={styles.item}
              aria-labelledby={`sluzba-${item.id}-title`}
            >
              <div className={styles.visual} data-reveal="">
                <Showcase mock={look.mock} object={item.object} hue={look.hue} corner={look.corner} />
              </div>
              <div className={styles.text}>
                <p className={styles.num} aria-hidden="true">
                  {item.index}
                </p>
                <div className={styles.titleRow}>
                  <h3 id={`sluzba-${item.id}-title`} className={styles.title}>
                    {item.title}
                  </h3>
                  {item.tag && <p className={styles.tag}>{item.tag}</p>}
                </div>
                <p className={styles.body}>{typo(item.body)}</p>
                <ul className={styles.points} role="list">
                  {item.points.map((point) => (
                    <li key={point}>{typo(point)}</li>
                  ))}
                </ul>
              </div>
            </article>
          )
        })}
      </div>

      <p className={styles.cta}>
        <a className={shared.button} href="#kontakt">
          {services.cta}
          <Arrow className={shared.arrow} />
        </a>
      </p>
    </section>
  )
}
