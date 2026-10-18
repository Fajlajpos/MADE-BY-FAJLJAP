import Link from 'next/link'
import { home } from '@/content/home'
import { categoryLabels, projects } from '@/content/projects'
import { typo } from '@/lib/typo/czech'
import shared from './home.module.css'
import { WorkRows } from './WorkRows'
import styles from './Work.module.css'

/** Selected work: the names large, one open at a time with its preview. */
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
        <h2 id="prace-title" className={shared.label}>
          <span>{work.index}</span>
          <b>{work.label}</b>
        </h2>
        <p className={`meta ${styles.count}`}>
          {String(featured.length).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
        </p>
      </div>

      <WorkRows
        open={work.open}
        rows={featured.map((p) => ({
          slug: p.slug,
          index: p.index,
          title: typo(p.title),
          summary: typo(p.summary),
          field: p.categories.map((c) => categoryLabels[c]).join(' / '),
          year: p.year,
          slot: p.slot,
        }))}
      />

      <div className={styles.foot}>
        <Link className={`${shared.button} ${shared.ghost}`} href="/prace">
          {work.allLabel}
          <span className={shared.arrow} aria-hidden="true">
            -&gt;
          </span>
        </Link>
      </div>
    </section>
  )
}
