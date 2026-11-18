import type { CSSProperties } from 'react'
import { Media } from '@/components/media/Media'
import { Arrow } from '@/components/ui/Arrow'
import { Showcase, type Corner, type Hue } from '@/components/showcase/Showcase'
import { content } from '@/content/server'
import { Words } from '@/components/fx/Words'
import { typo } from '@/lib/typo/czech'
import shared from './home.module.css'
import styles from './Work.module.css'

const SIZES = ['(min-width: 768px) 92vw, 100vw', '(min-width: 768px) 46vw, 100vw']
const HUES: Hue[] = ['cold', 'warm', 'violet', 'warm']
const CORNERS: Corner[] = ['tr', 'tl', 'tr', 'tl']

/**
 * 04 Práce — three projects on metal plates, the first across the full width, the other two
 * side by side. Until a project has its photo, the plate shows a drawn picture of it; its chrome
 * object sits on the corner either way.
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

      <ol className={styles.grid} role="list">
        {featured.map((project, i) => {
          const media = getSlot(project.slot)
          const hasPhoto = Boolean(media.src)
          // the first and the last project run across the full width
          const wide = i === 0 || (i === featured.length - 1 && featured.length % 2 === 0)
          const shot =
            project.url && media.src
              ? { src: media.src, alt: media.alt, url: project.url, video: project.video, dark: project.window === 'dark' }
              : undefined
          return (
            <li
              key={project.slug}
              className={styles.cell}
              data-wide={wide || undefined}
              data-reveal=""
              style={{ '--reveal-i': i % 2 } as CSSProperties}
            >
              <article className={styles.project} aria-labelledby={`projekt-${project.slug}`}>
                {project.url ? (
                  <a
                    className={styles.cardLink}
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${ui.work.open} ${project.title} ${ui.newWindow}`}
                    tabIndex={-1}
                  >
                    <Showcase
                      mock={project.mock}
                      object={project.object}
                      hue={HUES[i % HUES.length]}
                      corner={CORNERS[i % CORNERS.length]}
                      wide={wide}
                      shot={shot}
                      chip={shot ? (project.categories.includes('e-shop') ? ui.chips.liveShop : ui.chips.liveWeb) : undefined}
                    >
                      {hasPhoto && !shot ? (
                        <Media
                          slot={project.slot}
                          className={styles.media}
                          sizes={SIZES[wide ? 0 : 1]}
                        />
                      ) : undefined}
                    </Showcase>
                  </a>
                ) : (
                  <Showcase
                    mock={project.mock}
                    object={project.object}
                    hue={HUES[i % HUES.length]}
                    corner={CORNERS[i % CORNERS.length]}
                    wide={wide}
                    shot={shot}
                    chip={shot ? (project.categories.includes('e-shop') ? ui.chips.liveShop : ui.chips.liveWeb) : undefined}
                  >
                    {hasPhoto && !shot ? (
                      <Media
                        slot={project.slot}
                        className={styles.media}
                        sizes={SIZES[wide ? 0 : 1]}
                      />
                    ) : undefined}
                  </Showcase>
                )}
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
                  {project.url && (
                    <a
                      className={`${shared.link} ${styles.visit}`}
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {ui.work.open} {project.url.replace(/^https?:\/\//, '')}
                      <Arrow className={`${shared.arrow} ${styles.visitIcon}`} />
                      <span className="visually-hidden"> {ui.newWindow}</span>
                    </a>
                  )}
                </div>
              </article>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
