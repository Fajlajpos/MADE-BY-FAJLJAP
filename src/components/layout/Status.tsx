import { content } from '@/content/server'
import styles from './Status.module.css'

/** ● Volná kapacita od listopadu — a breathing dot, orange when I take work, grey when not. */
export async function Status({ className }: { className?: string }) {
  const { site, ui } = await content()
  const { open, label } = site.availability
  return (
    <p className={[styles.status, className].filter(Boolean).join(' ')}>
      <span className={styles.dot} data-open={open} aria-hidden="true" />
      <span className="visually-hidden">{ui.status} </span>
      {label}
    </p>
  )
}
