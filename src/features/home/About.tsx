import { InlinePhoto } from '@/components/media/InlinePhoto'
import { home } from '@/content/home'
import { typo } from '@/lib/typo/czech'
import shared from './home.module.css'
import styles from './About.module.css'

/**
 * Who I am, said as one long sentence in large type with small photos set between the words —
 * the portrait, the estate, the sketchbook, the desk at night. Point at a photo to lift it.
 */
export function About() {
  const { about } = home
  let seed = 0
  return (
    <section id="o-mne" data-ground="halo" className={shared.section} aria-labelledby="o-mne-title">
      <h2 id="o-mne-title" className={shared.label}>
        <span>{about.index}</span>
        <b>{about.label}</b>
      </h2>

      <div className={`${shared.veil} ${styles.talk}`} data-clear="">
        {about.talk.map((part, i) =>
          typeof part === 'string' ? (
            <span key={i}>{typo(part)}</span>
          ) : (
            <InlinePhoto key={i} slot={part.slot} alt={part.alt} seed={++seed} />
          ),
        )}
      </div>

      <dl className={`${shared.facts} ${styles.facts}`}>
        {about.facts.map((fact) => (
          <div key={fact.label} className={shared.fact}>
            <dt>{fact.label}</dt>
            <span className={shared.leader} aria-hidden="true" />
            <dd>{typo(fact.value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
