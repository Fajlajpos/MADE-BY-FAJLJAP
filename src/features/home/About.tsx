import { AsciiScene } from '@/components/ascii/AsciiScene'
import { InView } from '@/components/ascii/InView'
import { Scramble } from '@/components/ascii/Scramble'
import { home } from '@/content/home'
import { typo } from '@/lib/typo/czech'
import shared from './home.module.css'
import styles from './About.module.css'

/**
 * Who I am, as a terminal manual page: `$ man fajlajp` in a window on the ground, name, usage,
 * the description in a human voice, the facts as options, one bug, links to the rest of the page,
 * and a portrait in characters as figure 1. Its entries print in one by one as it scrolls in.
 */
export function About() {
  const { about } = home
  const { man } = about
  const h = man.headings
  return (
    <section
      data-ground="lobes"
      id="o-mne"
      className={shared.section}
      aria-labelledby="o-mne-title"
    >
      <h2 id="o-mne-title" className={shared.label}>
        <span>{about.index}</span>
        <b>{about.label}</b>
      </h2>

      <InView className={styles.window}>
        <p className={`meta ${styles.bar}`}>
          <span className={styles.lights} aria-hidden="true">
            o o o
          </span>
          <span className={styles.prompt}>
            <span aria-hidden="true">~ $ </span>
            {man.command}
          </span>
          <span className={styles.page}>{man.page}</span>
        </p>

        <div className={styles.body}>
          <div className={styles.man}>
            <p className={`meta ${styles.running}`} aria-hidden="true">
              <span>{man.page}</span>
              <span>{man.manual}</span>
              <span>{man.page}</span>
            </p>

            <dl className={styles.entries}>
              <div className={styles.entry}>
                <dt>{h.name}</dt>
                <dd className={styles.name}>{man.name}</dd>
              </div>

              <div className={styles.entry}>
                <dt>{h.usage}</dt>
                <dd className={styles.usage}>
                  <code>
                    {man.usage.map((part, i) => (
                      <span key={part} data-first={i === 0 || undefined}>
                        {part}{' '}
                      </span>
                    ))}
                  </code>
                </dd>
              </div>

              <div className={styles.entry}>
                <dt>{h.description}</dt>
                <dd className={styles.description}>{typo(man.description)}</dd>
              </div>

              <div className={styles.entry}>
                <dt>{h.options}</dt>
                <dd>
                  <dl className={styles.options}>
                    {man.options.map((o) => (
                      <div key={o.flag}>
                        <dt>
                          <code>{o.flag}</code>
                        </dt>
                        <dd>{typo(o.text)}</dd>
                      </div>
                    ))}
                  </dl>
                </dd>
              </div>

              <div className={styles.entry}>
                <dt>{h.bugs}</dt>
                <dd>{typo(man.bugs)}</dd>
              </div>

              <div className={styles.entry}>
                <dt>{h.seeAlso}</dt>
                <dd className={styles.see}>
                  {man.seeAlso.map((link, i) => (
                    <span key={link.href}>
                      <a href={link.href}>
                        <Scramble text={link.label} />
                      </a>
                      {i < man.seeAlso.length - 1 ? ', ' : null}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>

            <p className={`meta ${styles.running}`} aria-hidden="true">
              <span>{man.footer}</span>
              <span className={styles.end}>
                {man.end}
                <span className="caret" />
              </span>
            </p>
          </div>

          <figure className={styles.figure}>
            <AsciiScene slot="home.about" seed={3} cellSize={7} className={styles.portrait} />
            <figcaption className="meta">{man.figure}</figcaption>
          </figure>
        </div>
      </InView>
    </section>
  )
}
