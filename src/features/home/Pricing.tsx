import type { CSSProperties } from 'react'
import { Arrow } from '@/components/ui/Arrow'
import { home } from '@/content/home'
import { Words } from '@/components/fx/Words'
import { typo } from '@/lib/typo/czech'
import { Slot3D } from '@/three/site/Slot3D'
import shared from './home.module.css'
import styles from './Pricing.module.css'

/** "od 25 000 Kč" → a small "od", the amount set large, the currency small. */
function Price({ value }: { value: string }) {
  const m = /^(od|do|cca)\s+(.+?)(\s+Kč)?$/i.exec(value.trim())
  if (!m) return <>{typo(value)}</>
  return (
    <>
      <span className={styles.from}>{m[1]}</span> <span className={styles.amount}>{typo(m[2] ?? '')}</span>
      {m[3] && <span className={styles.currency}> Kč</span>}
    </>
  )
}

/**
 * Kolik to stojí — heading and lead beside the chrome price tag, the price list as ruled rows
 * (job left, price large right), the small print, then the common questions as native <details>.
 */
export function Pricing() {
  const { pricing } = home
  return (
    <section id="cenik" className={shared.section} aria-labelledby="cenik-title">
      <p className={shared.label} data-reveal="">
        <b>{pricing.index}</b> {pricing.label}
      </p>

      <div className={styles.top}>
        <div className={styles.intro}>
          <h2 id="cenik-title" className={`${shared.h2} ${styles.title}`} data-reveal="">
            <Words text={pricing.heading} />
          </h2>
          <p className={shared.lead} data-reveal="" style={{ '--reveal-i': 1 } as CSSProperties}>
            {typo(pricing.lead)}
          </p>
        </div>
        <Slot3D object="tag" className={styles.tag} scale={1.15} />
      </div>

      <ul className={styles.items} role="list">
        {pricing.items.map((item, i) => (
          <li key={item.title} className={`${styles.item} glow-card`} data-reveal="" style={{ '--reveal-i': i } as CSSProperties}>
            <div className={styles.what}>
              <h3 className={styles.itemTitle}>{typo(item.title)}</h3>
              <p className={styles.itemBody}>{typo(item.body)}</p>
            </div>
            <p className={styles.price}>
              <Price value={item.from} />
            </p>
          </li>
        ))}
      </ul>
      <p className={styles.note}>{typo(pricing.note)}</p>

      <div className={styles.faq}>
        <div className={styles.faqHead}>
          <h3 className={styles.faqTitle}>{typo(pricing.faqLabel)}</h3>
          <a className={shared.button} href="#kontakt" data-magnetic="">
            Zeptej se na přesnou cenu
            <Arrow className={shared.arrow} />
          </a>
        </div>
        <div className={styles.qas}>
          {pricing.faq.map((qa) => (
            <details key={qa.q} className={`${styles.qa} glow-card`}>
              <summary className={styles.q}>
                <span>{typo(qa.q)}</span>
                <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path className={styles.iconV} d="M12 5v14" />
                </svg>
              </summary>
              <p className={styles.a}>{typo(qa.a)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
