import styles from './Showcase.module.css'

/**
 * A frame of liquid chrome round a card, in the style of the MADE BY FAJLAJP title: a cut-out
 * render (public/brand/liquid-frame.webp, made with scripts/title-cutout.mjs) stretched over the
 * card's edge. Odd cards get it mirrored, so neighbours do not repeat the same drips.
 */
export function LiquidFrame({ seed = 0 }: { seed?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a decorative frame stretched to the card
    <img
      className={styles.frame}
      src="/brand/liquid-frame.webp"
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      data-flip={seed % 2 === 1 || undefined}
    />
  )
}
