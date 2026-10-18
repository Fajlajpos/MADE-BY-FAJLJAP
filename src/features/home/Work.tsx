import Link from 'next/link'
import { Photo } from '@/components/media/Photo'
import { home } from '@/content/home'
import { categoryLabels, projects } from '@/content/projects'
import { typo } from '@/lib/typo/czech'
import shared from './home.module.css'
import styles from './Work.module.css'

/** Selected work: a plain row of project cards — preview, a line of facts, the name, one sentence. */
export function Work() {
  const { work } = home
  const featured = projects.filter((p) => p.featured)

  return (
    <section
      data-ground="contour"
      id="prace"
      className={shared.section}
      aria-labelledby="prace-title"
    >
      <div className={styles.head}>
        <div className={styles.headCopy}>
          <p className={shared.label}>
            <span>{work.index}</span>
            <b>{work.label}</b>
          </p>
          <h2 id="prace-title" className={styles.heading}>
            {typo(work.heading)}
          </h2>
        </div>
        <Link className={`${shared.button} ${shared.ghost}`} href="/prace">
          {work.allLabel}
          <span className={shared.arrow} aria-hidden="true">
            -&gt;
          </span>
        </Link>
      </div>

      <ul className={styles.grid} role="list">
        {featured.map((p, i) => (
          <li key={p.slug}>
            <Link href={`/prace/${p.slug}`} className={styles.card}>
              <div className={styles.media}>
                <Photo slot={p.slot} ratio="4 / 3" seed={i + 3} cellSize={7} />
              </div>
              <p className={`meta ${styles.meta}`}>
                <span>{p.index}</span>
                <span>{p.categories.map((c) => categoryLabels[c]).join(' / ')}</span>
                <span>{p.year}</span>
              </p>
              <h3 className={styles.title}>{typo(p.title)}</h3>
              <p className={styles.summary}>{typo(p.summary)}</p>
              <span className={`meta ${styles.more}`} aria-hidden="true">
                {work.open} -&gt;
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
