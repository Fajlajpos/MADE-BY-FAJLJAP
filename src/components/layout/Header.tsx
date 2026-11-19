import Image from 'next/image'
import Link from 'next/link'
import { rootOf } from '@/content'
import { content } from '@/content/server'
import { LangSwitch } from './LangSwitch'
import { HeaderShell } from './HeaderShell'
import { LogoEgg } from './LogoEgg'
import { MobileMenu } from './MobileMenu'
import { NavList } from './NavList'
import styles from './Header.module.css'

/**
 * The bar: the chrome logotype on the left, the sections and „Napiš mi“ on the right. It floats over the
 * hero, and once the page moves it gets a dark ground (HeaderShell). Below 1024 px the sections
 * move into <MobileMenu/>.
 */
export async function Header() {
  const { site, ui, lang } = await content()
  return (
    <HeaderShell className={styles.header}>
      <div className={styles.bar}>
        <Link href={rootOf(lang)} className={styles.brand} aria-label={`${site.brand} – ${ui.homeLabel}`}>
          {/* the liquid chrome logotype (public/brand, the FAJLAJP of the hero title, scripts/title-cutout.mjs) */}
          <Image
            src="/brand/logo-fajlajp-liquid.webp"
            alt=""
            width={768}
            height={288}
            priority
            unoptimized
            className={styles.logo}
          />
          {/* a glint that runs across the metal on hover, clipped to the letters */}
          <span className={styles.glint} aria-hidden="true" />
          <LogoEgg />
        </Link>

        <nav className={styles.nav} aria-label={ui.mainNav}>
          <NavList className={styles.list} linkClassName={styles.link} />
        </nav>

        <LangSwitch className={styles.lang} />
        <Link href={`${rootOf(lang)}#kontakt`} className={styles.cta} data-magnetic="">
          {ui.cta}
        </Link>
        <MobileMenu />
      </div>
    </HeaderShell>
  )
}
