import type { CSSProperties } from 'react'
import { home } from '@/content/home'
import { typo } from '@/lib/typo/czech'
import shared from './home.module.css'
import styles from './Process.module.css'

/**
 * 03 Jak to probíhá — for companies that want to know what happens and when. Four steps on one
 * horizontal axis (four columns on a wide screen, stacked on a phone): the number, a line that
 * draws itself in as the step appears, the title, how long it takes, and a short description.
 */
export function Process() {
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
          {typo(process.heading)}
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
        {process.steps.map((step, i) => (
          <li
            key={step.title}
            className={styles.step}
            data-reveal=""
            style={{ '--reveal-i': i } as CSSProperties}
          >
            <span className={styles.num} aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className={styles.rule} aria-hidden="true" />
            <h3 className={styles.title}>{step.title}</h3>
            <p className={styles.time}>{step.time}</p>
            <p className={styles.body}>{typo(step.body)}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
