import type { CSSProperties } from 'react'
import { Arrow } from '@/components/ui/Arrow'
import { home } from '@/content/home'
import { site } from '@/content/site'
import { typo } from '@/lib/typo/czech'
import { HeroStage } from './HeroStage'
import shared from './home.module.css'
import styles from './Hero.module.css'

/**
 * The opening: one screen, a cluster of polished chrome behind the copy — the things I make,
 * which you can push around with the cursor and knock with a click. The title is set large and
 * plain at the bottom left; the intro and the two ways on sit at the bottom right.
 */
export function Hero() {
  const { hero } = home
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <HeroStage />

      <div className={styles.inner}>
        <div className={styles.top}>
          <p className="label">{typo(hero.tag)}</p>
          <p className={`label ${styles.status}`}>
            <span className={styles.dot} data-open={site.availability.open} aria-hidden="true" />
            {typo(site.availability.label)}
          </p>
        </div>

        <div className={styles.bottom}>
          <h1 id="hero-title" className={styles.title}>
            {hero.title.map((line, i) => (
              <span key={line} className={styles.mask}>
                <span className={styles.line} style={{ '--li': i } as CSSProperties}>
                  {typo(line)}
                </span>
              </span>
            ))}
          </h1>

          <div className={styles.aside}>
            <p className={styles.intro}>{typo(hero.intro)}</p>
            <div className={styles.actions}>
              <a className={shared.button} href="#kontakt">
                {hero.ctaPrimary}
                <Arrow className={shared.arrow} />
              </a>
              <a className={shared.link} href="#co-delam">
                {hero.ctaSecondary}
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
