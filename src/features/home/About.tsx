import type { CSSProperties } from 'react'
import { PhotoPrint } from '@/components/print/PhotoPrint'
import { home } from '@/content/home'
import { Words } from '@/components/fx/Words'
import { typo } from '@/lib/typo/czech'
import { Slot3D } from '@/three/site/Slot3D'
import shared from './home.module.css'
import styles from './About.module.css'

/**
 * O mně — my photo on the left as a real print (taped, dated, turn it over), the chrome mug
 * standing over its corner; the copy on
 * the right: heading, two paragraphs, then the facts as a ruled two-column list.
 */
export function About() {
  const { about } = home
  return (
    <section id="o-mne" className={`${shared.section} ${styles.section}`} aria-labelledby="o-mne-title">
      <p className={shared.label} data-reveal="">
        <b>{about.index}</b> {about.label}
      </p>

      <div className={styles.layout}>
        <figure className={styles.figure} data-reveal="">
          <div className={styles.frame}>
            <PhotoPrint
              slot={about.portraitSlot}
              stamp={about.print.stamp}
              note={typo(about.caption)}
              back={about.print.back}
              sizes="(min-width: 1024px) 40vw, 92vw"
            >
              {/* the mug stands just over the print's corner */}
              <Slot3D object="mug" className={styles.mug} scale={1.1} label="Chromový plecháček, můj hrnek ze stolu" />
            </PhotoPrint>
          </div>
          <figcaption className="visually-hidden">{typo(about.caption)}</figcaption>
        </figure>

        <div className={styles.copy}>
          <h2 id="o-mne-title" className={`${shared.h2} ${styles.title}`} data-reveal="">
            <Words text={about.heading} />
          </h2>

          <div className={styles.body}>
            {about.body.map((p, i) => (
              <p key={p.slice(0, 24)} className={i === 0 ? styles.first : styles.text} data-reveal="" style={{ '--reveal-i': i + 1 } as CSSProperties}>
                {typo(p)}
              </p>
            ))}
          </div>

          <dl className={styles.facts} data-reveal="" style={{ '--reveal-i': 2 } as CSSProperties}>
            {about.facts.map((f) => (
              <div key={f.label} className={`${styles.fact} glow-card`}>
                <dt>{f.label}</dt>
                <dd>{typo(f.value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
