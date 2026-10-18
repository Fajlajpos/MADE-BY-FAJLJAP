import { AsciiWordmark } from '@/components/ascii/AsciiWordmark'
import { Scramble } from '@/components/ascii/Scramble'
import { site } from '@/content/site'
import { typo } from '@/lib/typo/czech'
import { NavList } from './NavList'
import { Status } from './Status'
import styles from './Footer.module.css'

const YEAR = 2026

/**
 * The colophon: index, elsewhere, operator (§ 435 OZ), and the
 * name in characters cut by the bottom edge of the page.
 */
export function Footer() {
  const { business } = site
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <p className={styles.name}>
            {site.brand}
            <span aria-hidden="true">.</span>
          </p>
          <p className={styles.tagline}>
            {typo('Grafik a webdesignér. Weby, identity a plakáty s rukopisem.')}
          </p>
          <Status />
          <a className={styles.mail} href={`mailto:${site.contact.email}`}>
            <Scramble text={site.contact.email} />
          </a>
        </div>

        <section aria-labelledby="pata-rejstrik">
          <h2 id="pata-rejstrik" className={`meta ${styles.colTitle}`}>
            Rejstřík
          </h2>
          <nav aria-labelledby="pata-rejstrik">
            <NavList
              className={styles.list}
              linkClassName={styles.link}
              indexClassName={`meta ${styles.index}`}
            />
          </nav>
        </section>

        <section aria-labelledby="pata-jinde">
          <h2 id="pata-jinde" className={`meta ${styles.colTitle}`}>
            Jinde
          </h2>
          <ul className={styles.list} role="list">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a className={styles.link} href={s.href}>
                  <Scramble text={s.label} />
                  <span className={styles.index} aria-hidden="true">
                    [&#8599;]
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="pata-provozovatel">
          <h2 id="pata-provozovatel" className={`meta ${styles.colTitle}`}>
            Provozovatel
          </h2>
          <dl className={styles.facts}>
            <div>
              <dt className="meta">Jméno</dt>
              <dd>{business.name}</dd>
            </div>
            <div>
              <dt className="meta">Místo podnikání</dt>
              <dd>{business.address}</dd>
            </div>
            <div>
              <dt className="meta">IČO</dt>
              <dd>{business.ico}</dd>
            </div>
            <div>
              <dt className="meta">Zápis</dt>
              <dd>{typo(business.registry)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className={`meta ${styles.base}`}>
        <p>
          (c) {YEAR} {site.brand}
        </p>
        <p>Martian Mono + Archivo · znaky &apos; .:-=+*#%@&apos;</p>
        <p>Ctrl K = příkazy</p>
      </div>

      <AsciiWordmark
        text={site.brand}
        className={styles.mark}
        cellSize={9}
        artHeight={300}
        decorative
      />
    </footer>
  )
}
