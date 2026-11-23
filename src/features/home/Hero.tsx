import Image from 'next/image'
import { Arrow } from '@/components/ui/Arrow'
import { content } from '@/content/server'
import { typo } from '@/lib/typo/czech'
import { ArchTitle } from './ArchTitle'
import { HeroStage } from './HeroStage'
import shared from './home.module.css'
import styles from './Hero.module.css'

/**
 * The opening: „MADE BY FAJLAJP“ in one line, bent over the top in an arch;
 * under it me on the sofa with a laptop (a cut-out photo; until it comes, a framed stand-in);
 * short notes on either side, the intro and the way on at the bottom. The chrome cluster stays
 * behind, at the sides.
 */
export async function Hero() {
  const { home, getSlot, ui } = await content()
  const { hero } = home
  const sofa = getSlot('home.sofa')
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <HeroStage />

      <div className={styles.inner}>
        <div className={styles.top}>
          <p className="label">{typo(hero.tag)}</p>
        </div>

        <div className={styles.stage}>
          <h1 id="hero-title" className={styles.arch}>
            <span className="visually-hidden">{hero.arch.join(' ')} – {ui.hero.label}</span>
            <ArchTitle />
          </h1>

          <div className={styles.photo} data-cloud-slot="">
            {sofa.src ? (
              <Image src={sofa.src} alt={sofa.alt} fill priority sizes="(min-width: 1024px) 50vw, 90vw" className={styles.photoImg} />
            ) : (
              <div className={styles.photoStandIn} role="img" aria-label={sofa.alt}>
                <span>{ui.hero.photoSoon}</span>
              </div>
            )}
          </div>

          <ul className={styles.notes} role="list">
            {hero.notes.map((n) => (
              <li key={n.k}>
                <b>{n.k}</b>
                <span>{typo(n.v)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.bottom}>
          <p className={styles.intro}>{typo(hero.intro)}</p>
          <div className={styles.actions}>
            <a className={shared.button} href="#kontakt" data-magnetic="">
              {hero.ctaPrimary}
              <Arrow className={shared.arrow} />
            </a>
            <a className={shared.link} href="#co-delam">
              {hero.ctaSecondary}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
