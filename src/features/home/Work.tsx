import type { CSSProperties } from 'react'
import { Arrow } from '@/components/ui/Arrow'
import { content } from '@/content/server'
import { Words } from '@/components/fx/Words'
import { typo } from '@/lib/typo/czech'
import shared from './home.module.css'
import styles from './Work.module.css'

/**
 * 04 Práce — a plain base for now: one wide row per project. On the left a big chrome number,
 * the name, year and kind, a few lines about it and the way to it; on the right the site itself
 * in a simple dark browser window (its address in the bar). Rows alternate sides on a wide
 * screen; on a phone the picture comes first.
 */
export async function Work() {
  const { home, getSlot, projects, categories: categoryLabels, ui } = await content()
  const { work } = home
  const featured = projects.filter((p) => p.featured)
  return (
    <section id="prace" className={shared.section} aria-labelledby="prace-title">
      <header className={styles.head}>
        <p className={shared.label} data-reveal="">
          <b>{work.index}</b> {work.label}
        </p>
        <h2
          id="prace-title"
          className={`${shared.h2} ${styles.h2}`}
          data-reveal=""
          style={{ '--reveal-i': 1 } as CSSProperties}
        >
          <Words text={work.heading} />
        </h2>
      </header>

      <ol className={styles.list} role="list">
        {featured.map((project, i) => {
          const media = getSlot(project.slot)
          const host = project.url?.replace(/^https?:\/\//, '').replace(/\/$/, '')
          return (
            <li key={project.slug} className={styles.row} data-flip={i % 2 === 1 || undefined} data-reveal="">
              <article className={styles.project} aria-labelledby={`projekt-${project.slug}`}>
                <div className={styles.text}>
                  <span className={styles.num} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 id={`projekt-${project.slug}`} className={styles.title}>
                    {project.title}
                  </h3>
                  <p className={styles.meta}>
                    {project.year} · {project.categories.map((c) => categoryLabels[c]).join(', ')}
                  </p>
                  <p className={styles.summary}>{typo(project.summary)}</p>
                  {project.url && (
                    <a className={styles.visit} href={project.url} target="_blank" rel="noopener noreferrer">
                      {ui.work.open}
                      <Arrow className={styles.visitIcon} />
                      <span className="visually-hidden">
                        {' '}
                        {host} {ui.newWindow}
                      </span>
                    </a>
                  )}
                </div>

                {/* the site in a plain browser window */}
                <div className={styles.window} aria-hidden={media.src ? undefined : true}>
                  <div className={styles.bar}>
                    <span className={styles.dots} aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className={styles.address}>{host ?? project.title}</span>
                  </div>
                  <div className={styles.screen}>
                    {media.src ? (
                      // eslint-disable-next-line @next/next/no-img-element -- a screenshot of the site
                      <img src={media.src} alt={media.alt} loading="lazy" decoding="async" />
                    ) : (
                      <span className={styles.empty}>{project.title}</span>
                    )}
                  </div>
                </div>
              </article>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
