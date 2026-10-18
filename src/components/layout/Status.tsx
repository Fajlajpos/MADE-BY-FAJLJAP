import { Spinner } from '@/components/ascii/Live'
import { site } from '@/content/site'
import styles from './Status.module.css'

/** [|] Volná kapacita od listopadu — the turning bar is the only print colour in the bar. */
export function Status({ className }: { className?: string }) {
  const { open, label } = site.availability
  return (
    <p className={['meta', styles.status, className].filter(Boolean).join(' ')}>
      <span className={styles.bracket} data-open={open} aria-hidden="true">
        [<Spinner className={styles.spin} />]
      </span>
      <span className="visually-hidden">Stav: </span>
      {label}
    </p>
  )
}
