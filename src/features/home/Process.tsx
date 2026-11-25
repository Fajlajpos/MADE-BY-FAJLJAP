import type { CSSProperties } from 'react'
import { content } from '@/content/server'
import { Words } from '@/components/fx/Words'
import { typo } from '@/lib/typo/czech'
import shared from './home.module.css'
import styles from './Process.module.css'
import { Installer } from './Installer'

/**
 * 03 Jak to probíhá — for companies that want to know what happens and when. The heading, then
 * the four steps as an old-school setup wizard (Installer.tsx): the bar shows how long each step
 * really takes, and Finish leads to the contact form.
 */
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

      <Installer
        steps={process.steps.map((step) => ({ ...step, body: typo(step.body), check: step.check && typo(step.check) }))}
        copy={process.installer}
        finishHref="#kontakt"
      />
    </section>
  )
}
