'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { CSSProperties } from 'react'
import { site } from '@/content/site'

type Props = {
  className?: string
  itemClassName?: string
  linkClassName?: string
  indexClassName?: string
  /** Show the section numbers (01 …). */
  indexes?: boolean
  /** Called on every link click (the nav capsule closes itself). */
  onNavigate?: () => void
  /** The in-page section being read right now (`/#prace`), marked with aria-current="true". */
  currentHref?: string
}

export function isCurrent(pathname: string | null, href: string): boolean {
  if (!pathname || href.includes('#')) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** The site navigation as a list. Client only for usePathname → aria-current. */
export function NavList({
  className,
  itemClassName,
  linkClassName,
  indexClassName,
  indexes = false,
  onNavigate,
  currentHref,
}: Props) {
  const pathname = usePathname()
  return (
    <ol className={className} role="list">
      {site.nav.map((item, i) => {
        const current = isCurrent(pathname, item.href) ? 'page' : item.href === currentHref ? 'true' : undefined
        return (
          <li key={item.href} className={itemClassName} style={{ '--i': i } as CSSProperties}>
            <Link href={item.href} className={linkClassName} aria-current={current} onClick={onNavigate}>
              {indexes && (
                <span className={indexClassName} aria-hidden="true">
                  {item.index}
                </span>
              )}
              <span>{item.label}</span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
