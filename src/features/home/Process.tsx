import type { CSSProperties } from 'react'
import { content } from '@/content/server'
import { Words } from '@/components/fx/Words'
import { typo } from '@/lib/typo/czech'
import shared from './home.module.css'
import styles from './Process.module.css'

/**
 * 03 Jak to probíhá — for companies that want to know what happens and when. Four steps as metal
 * cards (four columns stepping down on a wide screen, two by two on a tablet, stacked on a
 * phone): the number and how long it takes, the title, and a short description.
 */
/** Your liquid chrome tube render to run along the steps (a cut-out in /public/brand). Empty: the holographic track in CSS. */
const TRACK_ART = ''

export async function Process() {
  const { home } = await content()
  const { process } = home
  return (
    <section id="jak-to-probiha" className={shared.section} aria-labelledby="proces-title">
      <header className={styles.head}>
        <p className={`${shared.label} ${styles.label}`} data-reveal="">
          <b>{process.index}</b> {process.label}
        </p>
        <h2
          id="proces-title"
          className={`${shared.h2} ${styles.h2}`}
          data-reveal=""
          style={{ '--reveal-i': 1 } as CSSProperties}
        >
          <Words text={process.heading} />
        </h2>
        <p
          className={`${shared.lead} ${styles.lead}`}
          data-reveal=""
          style={{ '--reveal-i': 2 } as CSSProperties}
        >
          {typo(process.lead)}
        </p>
      </header>

      <ol className={styles.steps} role="list">
        {TRACK_ART && (
          // eslint-disable-next-line @next/next/no-img-element -- a decorative cut-out tube along the steps
          <img className={styles.trackArt} src={TRACK_ART} alt="" aria-hidden="true" />
        )}
        {process.steps.map((step, i) => (
          <li
            key={step.title}
            className={`${styles.step} glow-card`}
            data-reveal=""
            style={{ '--reveal-i': i } as CSSProperties}
          >
            <div className={styles.top}>
              <span className={styles.num} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className={styles.time}>{step.time}</p>
            </div>
            <h3 className={styles.title}>{step.title}</h3>
            <p className={styles.body}>{typo(step.body)}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
