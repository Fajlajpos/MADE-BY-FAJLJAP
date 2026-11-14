import type { ObjectKind } from './ChromeObject'
import { Slot3D } from './Slot3D'
import styles from './Drift.module.css'

type Props = {
  /** What floats there; the drop of liquid chrome by default. */
  object?: ObjectKind
  /** Which margin it hangs in. */
  side?: 'left' | 'right' | 'center'
  size?: 's' | 'm' | 'l'
  /** Parallax share (see <Depth/>): positive floats nearer and moves faster than the page. */
  depth?: number
  tone?: 'warm' | 'cold' | 'dusk'
  className?: string
}

/**
 * A chrome thing floating free between two sections, over the seam. It takes no room in the
 * layout (a zero-height band), never catches the pointer and never makes the page scroll
 * sideways; it drifts with its own parallax. Put it between two sections:
 *   <Drift side="right" size="m" />            a drop of liquid chrome
 *   <Drift object="tag" side="left" size="s" />
 */
export function Drift({ object = 'liquid', side = 'right', size = 'm', depth = 0.12, tone = 'dusk', className }: Props) {
  return (
    <div className={[styles.band, className].filter(Boolean).join(' ')} data-side={side} data-size={size} aria-hidden="true">
      <div className={styles.float} data-depth={depth}>
        <Slot3D object={object} tone={tone} className={styles.slot} />
      </div>
    </div>
  )
}
