import Link from 'next/link'
import { Clock, ScrollMeter } from '@/components/ascii/Live'
import { Scramble } from '@/components/ascii/Scramble'
import { site } from '@/content/site'
import { CommandPalette } from './CommandPalette'
import { MobileMenu } from './MobileMenu'
import { NavList } from './NavList'
import { Status } from './Status'
import styles from './Header.module.css'

/**
 * Site bar, a terminal status line: name · indexed nav · status · clock · scroll meter · Ctrl K.
 * Sticky and in the flow. Below 1024 px the nav moves into <MobileMenu/>.
 */
export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link href="/" className={styles.brand} aria-label={`${site.brand} – úvod`}>
          <Scramble text={site.brand} className={styles.brandText} />
          <span className={styles.brandDot} aria-hidden="true">
            .
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Hlavní navigace">
          <NavList
            className={styles.list}
            linkClassName={styles.link}
            indexClassName={`meta ${styles.index}`}
            labelClassName={styles.label}
          />
        </nav>

        <div className={`meta ${styles.readouts}`}>
          <Status className={styles.status} />
          <Clock className={styles.clock} />
          <ScrollMeter className={styles.meter} />
        </div>

        <CommandPalette triggerClassName={styles.command} />
        <MobileMenu />
      </div>
    </header>
  )
}
