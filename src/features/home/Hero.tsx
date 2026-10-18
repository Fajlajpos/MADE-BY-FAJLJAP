import { AsciiShape } from '@/components/ascii/AsciiShape'
import { CodePanel } from '@/components/ascii/CodePanel'
import { Glyphs } from '@/components/ascii/Glyphs'
import { Clock } from '@/components/ascii/Live'
import { home } from '@/content/home'
import { site } from '@/content/site'
import { typo } from '@/lib/typo/czech'
import shared from './home.module.css'
import styles from './Hero.module.css'

/**
 * The opening: the name set huge in characters, the claim under it, the code that describes me
 * writing itself in a panel, and a </> turning in characters on the right.
 */
export function Hero() {
  const { hero } = home
  return (
    <section data-ground="smear" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.inner}>
        <p className={`meta ${styles.tag}`}>
          <span>{hero.tag}</span>
          <span className={styles.clock}>
            <Clock />
          </span>
        </p>

        <div className={`${shared.veil} ${styles.claim}`}>
          <Glyphs as="h1" id="hero-title" className={styles.name} cellSize={8} duration={1200}>
            {site.brand}
          </Glyphs>
          <p className={styles.title}>
            {hero.title.map((line, i) => (
              <span key={line} className={styles.line} data-indent={i === 1 ? '' : undefined}>
                {line}
              </span>
            ))}
          </p>
        </div>

        <div className={styles.row}>
          <div className={`${shared.veil} ${styles.copy}`}>
            <p className={shared.lead}>{typo(hero.intro)}</p>
            <div className={styles.actions}>
              <a className={shared.button} href="#kontakt">
                {hero.ctaPrimary}
                <span className={shared.arrow} aria-hidden="true">
                  -&gt;
                </span>
              </a>
              <a className={`${shared.button} ${shared.ghost}`} href="#prace">
                {hero.ctaSecondary}
                <span className={shared.arrow} aria-hidden="true">
                  v
                </span>
              </a>
            </div>
          </div>
          <CodePanel
            className={styles.code}
            filename={hero.codeFile}
            code={hero.code}
            replay={hero.replay}
          />
        </div>
      </div>

      <div className={styles.model}>
        <AsciiShape shape="code" cellSize={8} />
      </div>
    </section>
  )
}
