import type { CSSProperties } from 'react'
import { Media } from '@/components/media/Media'
import { Showcase, type Corner, type Hue } from '@/components/showcase/Showcase'
import { home } from '@/content/home'
import { getSlot } from '@/content/media'
import { categoryLabels, projects } from '@/content/projects'
import { Words } from '@/components/fx/Words'
import { typo } from '@/lib/typo/czech'
import shared from './home.module.css'
import styles from './Work.module.css'

const SIZES = ['(min-width: 768px) 92vw, 100vw', '(min-width: 768px) 46vw, 100vw']
const HUES: Hue[] = ['cold', 'warm', 'violet']
const CORNERS: Corner[] = ['tr', 'tl', 'tr']

/**
 * 04 Práce — three projects on metal plates, the first across the full width, the other two
 * side by side. Until a project has its photo, the plate shows a drawn picture of it; its chrome
 * object sits on the corner either way.
 */
export function Work() {
  const { work } = home
  const featured = projects.filter((p) => p.featured).slice(0, 3)
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

      <ol className={styles.grid} role="list">
        {featured.map((project, i) => {
          const hasPhoto = Boolean(getSlot(project.slot).src)
          return (
            <li
              key={project.slug}
              className={styles.cell}
              data-reveal=""
              style={{ '--reveal-i': i % 2 } as CSSProperties}
            >
              <article className={styles.project} aria-labelledby={`projekt-${project.slug}`}>
                <Showcase
                  mock={project.mock}
                  object={project.object}
                  hue={HUES[i % HUES.length]}
                  corner={CORNERS[i % CORNERS.length]}
                  wide={i === 0}
                >
                  {hasPhoto ? <Media slot={project.slot} className={styles.media} sizes={SIZES[i === 0 ? 0 : 1]} /> : undefined}
                </Showcase>
                <div className={styles.caption}>
                  <div className={styles.titleRow}>
                    <h3 id={`projekt-${project.slug}`} className={styles.title}>
                      {project.title}
                    </h3>
                    <p className={styles.year}>{project.year}</p>
                  </div>
                  <p className={styles.meta}>
                    {project.categories.map((c) => categoryLabels[c]).join(', ')}
                  </p>
                  <p className={styles.summary}>{typo(project.summary)}</p>
                </div>
              </article>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
