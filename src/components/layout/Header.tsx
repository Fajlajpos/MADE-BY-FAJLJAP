import Link from 'next/link'
import { site } from '@/content/site'
import { HeaderShell } from './HeaderShell'
import { MobileMenu } from './MobileMenu'
import { NavList } from './NavList'
import styles from './Header.module.css'

/**
 * The bar: the name on the left, the sections and „Napiš mi“ on the right. It floats over the
 * hero, and once the page moves it gets a dark ground (HeaderShell). Below 1024 px the sections
 * move into <MobileMenu/>.
 */
export function Header() {
  return (
    <HeaderShell className={styles.header}>
      <div className={styles.bar}>
        <Link href="/" className={styles.brand} aria-label={`${site.brand} – úvod`}>
          {site.brand}
        </Link>

        <nav className={styles.nav} aria-label="Hlavní navigace">
          <NavList className={styles.list} linkClassName={styles.link} />
        </nav>

        <Link href="/#kontakt" className={styles.cta}>
          Napiš mi
        </Link>
        <MobileMenu />
      </div>
    </HeaderShell>
  )
}
