import { IG_BARCODE } from './igBarcode'
import styles from './BarcodeLabel.module.css'

/**
 * A torn paper price label with a real barcode on it (Code 128 of instagram.com/fajlajpos, my profile):
 * Google Lens or a scanner reads it as the link, and on the page it is a link too.
 */
export function BarcodeLabel({ label }: { label: string }) {
  return (
    <a className={styles.label} href="https://www.instagram.com/fajlajpos/" target="_blank" rel="noopener noreferrer" aria-label={label}>
      <svg className={styles.bars} viewBox={IG_BARCODE.viewBox} preserveAspectRatio="none" aria-hidden="true">
        {IG_BARCODE.paths.map((p) => (
          <path key={p.w} d={p.d} strokeWidth={p.w} />
        ))}
      </svg>
      <span className={styles.digits} aria-hidden="true">
        <span>@fajlajpos</span>
        <span>1 ks</span>
      </span>
    </a>
  )
}
