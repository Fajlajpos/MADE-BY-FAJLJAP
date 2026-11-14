import { site } from '@/content/site'
import { typo } from '@/lib/typo/czech'
import { Slot3D } from '@/three/site/Slot3D'
import { NavList } from './NavList'
import { Status } from './Status'
import styles from './Footer.module.css'

const YEAR = 2026

/**
 * The foot of every page: the name in chrome across the full width, then quiet columns — a line
 * and the address, the sections, elsewhere, the operator's details (§ 435 OZ) — and the base row.
 */
export function Footer() {
  const { business } = site
  return (
    <footer className={styles.footer}>
      <Slot3D object="wordmark" className={styles.wordmark} label={site.brand} />

      <div className={styles.inner}>
        <div className={styles.lead}>
          <p className={styles.statement}>{typo('Weby, e-shopy a grafika od jednoho člověka. Od první skici po spuštění.')}</p>
          <a className={styles.mail} href={`mailto:${site.contact.email}`}>
            {site.contact.email}
          </a>
          <Status />
        </div>

        <nav className={`${styles.col} ${styles.colNav}`} aria-labelledby="pata-stranka">
          <h2 id="pata-stranka" className={styles.colTitle}>
            Na stránce
          </h2>
          <NavList className={styles.list} linkClassName={styles.link} indexClassName={styles.index} indexes />
        </nav>

        <section className={`${styles.col} ${styles.colElse}`} aria-labelledby="pata-jinde">
          <h2 id="pata-jinde" className={styles.colTitle}>
            Jinde
          </h2>
          <ul className={styles.list} role="list">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a className={styles.link} href={s.href}>
                  <span>{s.label}</span>
                  <svg className={styles.out} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${styles.col} ${styles.colOperator}`} aria-labelledby="pata-provozovatel">
          <h2 id="pata-provozovatel" className={styles.colTitle}>
            Provozovatel
          </h2>
          <address className={styles.operator}>
            <span>{business.name}</span>
            <span>{business.address}</span>
            <span>IČO {business.ico}</span>
            <span className={styles.registry}>{typo(business.registry)}</span>
          </address>
        </section>
      </div>

      <div className={styles.base}>
        <p>
          © {YEAR} {site.brand}
        </p>
        <a className={styles.top} href="#obsah">
          Zpátky nahoru
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 19V6M6 11l6-6 6 6" />
          </svg>
        </a>
      </div>
    </footer>
  )
}
