import Image from 'next/image'
import { Arrow } from '@/components/ui/Arrow'
import { home } from '@/content/home'
import { getSlot } from '@/content/media'
import { site } from '@/content/site'
import { typo } from '@/lib/typo/czech'
import { HeroStage } from './HeroStage'
import shared from './home.module.css'
import styles from './Hero.module.css'

/**
 * The opening: „MADE BY FAJLAJP“ in one line, bent over the top in an arch;
 * under it me on the sofa with a laptop (a cut-out photo; until it comes, a framed stand-in);
 * short notes on either side, the intro and the way on at the bottom. The chrome cluster stays
 * behind, at the sides.
 */
export function Hero() {
  const { hero } = home
  const sofa = getSlot('home.sofa')
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

        <div className={styles.stage}>
          <h1 id="hero-title" className={styles.arch}>
            <span className="visually-hidden">{hero.arch.join(' ')} – webdesignér, weby a e-shopy</span>
            <Image
              src="/brand/made-by-fajlajp.webp"
              alt=""
              width={2400}
              height={615}
              priority
              unoptimized
              className={styles.archImg}
            />
            {/* a white flash running across the metal now and then, clipped to the letters */}
            <span className={styles.archGlint} aria-hidden="true" />
          </h1>

          <div className={styles.photo}>
            {sofa.src ? (
              <Image src={sofa.src} alt={sofa.alt} fill priority sizes="(min-width: 1024px) 50vw, 90vw" className={styles.photoImg} />
            ) : (
              <div className={styles.photoStandIn} role="img" aria-label={sofa.alt}>
                <span>Sem přijde fotka: já na gauči s notebookem</span>
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
