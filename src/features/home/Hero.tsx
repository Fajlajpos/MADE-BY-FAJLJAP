import { AsciiShape } from '@/components/ascii/AsciiShape'
import { CodePanel } from '@/components/ascii/CodePanel'
import { Glyphs } from '@/components/ascii/Glyphs'
import { Clock } from '@/components/ascii/Live'
import { home } from '@/content/home'
import { typo } from '@/lib/typo/czech'
import shared from './home.module.css'
import styles from './Hero.module.css'

/**
 * The opening: the claim set huge in characters, the code that describes me writing itself in a
 * panel, and a </> turning in characters on the right — it hangs over into the next section.
 */
export function Hero() {
  const { hero } = home
  return (
    <section data-ground="drift" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.inner}>
        <p className={`meta ${styles.tag}`}>
          <span>{hero.tag}</span>
          <span className={styles.clock}>
            <Clock />
          </span>
        </p>

        <div className={`${shared.veil} ${styles.claim}`} data-clear="">
          <Glyphs as="h1" id="hero-title" className={styles.title} cellSize={7} duration={1100}>
            {hero.title.map((line, i) => (
              <span key={line} className={styles.line} data-indent={i === 1 ? '' : undefined}>
                {line}
              </span>
            ))}
          </Glyphs>
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
        <AsciiShape shape="code" eager cellSize={8} />
      </div>
    </section>
  )
}
