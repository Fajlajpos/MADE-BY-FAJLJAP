import { AsciiScene } from '@/components/ascii/AsciiScene'
import { getSlot } from '@/content/media'
import styles from './InlinePhoto.module.css'

/**
 * A small photo set inside a sentence, between the words. Pointing at it lifts it up larger.
 * With a photo it shows in black and white; until then the slot's placeholder runs in characters.
 */
export function InlinePhoto({ slot, alt, seed = 1 }: { slot: string; alt: string; seed?: number }) {
  const media = getSlot(slot)
  return (
    <span className={styles.chip} tabIndex={0} role="img" aria-label={media.src ? media.alt : alt}>
      <span className={styles.inner} aria-hidden="true">
        {media.src ? (
          // eslint-disable-next-line @next/next/no-img-element -- a few px inline, sized by the chip
          <img className={styles.img} src={media.src} alt="" loading="lazy" decoding="async" />
        ) : (
          <AsciiScene slot={slot} seed={seed} cellSize={5} decorative />
        )}
      </span>
    </span>
  )
}
