import type { CSSProperties } from 'react'
import { Arrow } from '@/components/ui/Arrow'
import { content } from '@/content/server'
import { Words } from '@/components/fx/Words'
import { typo } from '@/lib/typo/czech'
import shared from './home.module.css'
import styles from './Services.module.css'

/**
 * 02 Co dělám — the four services as plain dark cards side by side (in the quiet style of 04 Práce):
 * a chrome number, the name, what it is and what you get. Each keeps its id (#sluzba-weby …): other parts link to them.
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
            className={styles.card}
            data-reveal=""
            style={{ '--reveal-i': i } as CSSProperties}
          >
            <article aria-labelledby={`sluzba-${item.id}-title`} className={styles.inner}>
              <div className={styles.top}>
                <span className={styles.num} aria-hidden="true">
                  {item.index}
                </span>
                {item.tag && <span className={styles.tag}>{item.tag}</span>}
              </div>
              <h3 id={`sluzba-${item.id}-title`} className={styles.title}>
                {item.title}
              </h3>
              <p className={styles.body}>{typo(item.body)}</p>
              <ul className={styles.points} role="list">
                {item.points.map((point) => (
                  <li key={point}>{typo(point)}</li>
                ))}
              </ul>
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
