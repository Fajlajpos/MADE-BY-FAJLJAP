import Image from 'next/image'
import { getSlot } from '@/content/media'
import styles from './Media.module.css'

type Props = {
  /** Media slot key (src/content/media.ts). */
  slot: string
  className?: string
  /** `sizes` for the responsive image. */
  sizes?: string
  /** A word or number printed large in the stand-in (e.g. the project number). */
  mark?: string
  priority?: boolean
  /** @deprecated photos always keep their own colours now */
  duotone?: boolean
}

/**
 * A photo from a media slot, or — until the slot has one — a quiet dark stand-in with the slot's
 * caption in the corner. Fills its box.
 */
export function Media({ slot, className, sizes = '(min-width: 1024px) 50vw, 100vw', mark, priority }: Props) {
  const media = getSlot(slot)
  const cls = [styles.media, className].filter(Boolean).join(' ')
  if (media.src) {
    const [fx, fy] = media.focal ?? [0.5, 0.5]
    return (
      <div className={cls}>
        <Image
          src={media.src}
          alt={media.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={styles.img}
          style={{ objectPosition: `${fx * 100}% ${(1 - fy) * 100}%` }}
        />
      </div>
    )
  }
  return (
    <div className={cls} data-tone={media.placeholder} role="img" aria-label={media.alt}>
      <span className={styles.wash} aria-hidden="true" />
      {mark && (
        <span className={styles.mark} aria-hidden="true">
          {mark}
        </span>
      )}
      <span className={`note ${styles.caption}`} aria-hidden="true">
        {media.alt}
      </span>
    </div>
  )
}
