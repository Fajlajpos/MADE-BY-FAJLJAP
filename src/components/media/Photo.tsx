import type { CSSProperties, ReactNode } from 'react'
import { AsciiScene } from '@/components/ascii/AsciiScene'
import { getSlot } from '@/content/media'
import styles from './Photo.module.css'

type Props = {
  /** Media slot key in src/content/media.ts. */
  slot: string
  /** Width / height, e.g. '4 / 5'. */
  ratio?: string
  /** Frame number printed in the corner, e.g. '01'. */
  no?: string
  caption?: ReactNode
  seed?: number
  cellSize?: number
  eager?: boolean
  className?: string
}

/**
 * Every photo on the site goes through this frame. With a photo: shown in black and white,
 * and on hover it dissolves into characters. Without one yet: the slot's placeholder runs in
 * characters and a small mark says a photo belongs here.
 */
export function Photo({
  slot,
  ratio = '4 / 5',
  no,
  caption,
  seed = 1,
  cellSize = 8,
  eager,
  className,
}: Props) {
  const media = getSlot(slot)
  return (
    <figure className={[styles.photo, className].filter(Boolean).join(' ')}>
      <div
        className={styles.frame}
        style={{ aspectRatio: ratio } as CSSProperties}
        data-has-photo={Boolean(media.src)}
      >
        {media.src ? (
          // eslint-disable-next-line @next/next/no-img-element -- local photos, sized by the frame
          <img
            className={styles.img}
            src={media.src}
            alt={media.alt}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : null}
        <AsciiScene
          slot={slot}
          seed={seed}
          cellSize={cellSize}
          decorative={Boolean(media.src)}
          className={media.src ? styles.dissolve : undefined}
        />
        {no ? (
          <span className={`meta ${styles.no}`} aria-hidden="true">
            {no}
          </span>
        ) : null}
        {media.src ? null : (
          <span className={`meta ${styles.pending}`} aria-hidden="true">
            [foto]
          </span>
        )}
      </div>
      {caption ? <figcaption className={`meta ${styles.caption}`}>{caption}</figcaption> : null}
    </figure>
  )
}
