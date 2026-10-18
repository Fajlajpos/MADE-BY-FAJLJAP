import { AsciiShape } from '@/components/ascii/AsciiShape'
import { Photo } from '@/components/media/Photo'
import { home } from '@/content/home'
import { typo } from '@/lib/typo/czech'
import shared from './home.module.css'
import { Strip } from './Strip'
import styles from './Gallery.module.css'

/**
 * The personal layer: my own photos on a strip you can throw sideways. A cursor turning in
 * characters hangs off its lower edge into the contact section.
 */
export function Gallery() {
  const { gallery } = home
  return (
    <section
      data-ground="rain"
      id="mimo"
      className={`${shared.section} ${styles.gallery}`}
      aria-labelledby="mimo-title"
    >
      <div className={`${shared.veil} ${styles.head}`}>
        <h2 id="mimo-title" className={shared.label}>
          <span>{gallery.index}</span>
          <b>{gallery.label}</b>
        </h2>
        <p className={shared.lead}>{typo(gallery.lead)}</p>
        <p className={`meta ${styles.hint}`} aria-hidden="true">
          &lt;-- {gallery.hint} --&gt;
        </p>
      </div>

      <Strip label={gallery.label}>
        {gallery.frames.map((frame, i) => (
          <li key={frame.slot} className={styles.cell} style={{ aspectRatio: frame.ratio }}>
            <Photo
              slot={frame.slot}
              ratio={frame.ratio}
              no={frame.no}
              seed={10 + i}
              cellSize={7}
              caption={typo(frame.caption)}
            />
          </li>
        ))}
      </Strip>

      <div className={styles.model}>
        <AsciiShape shape="cursor" seed={2} cellSize={7} />
      </div>
    </section>
  )
}
