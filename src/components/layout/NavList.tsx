'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { CSSProperties } from 'react'
import { Scramble } from '@/components/ascii/Scramble'
import { site } from '@/content/site'

type Props = {
  className?: string
  itemClassName?: string
  linkClassName?: string
  indexClassName?: string
  labelClassName?: string
  /** Scramble every label in on mount, one after another (the mobile menu re-keys the list). */
  cascade?: boolean
  /** Called on every link click (the mobile menu closes itself, even on the current page). */
  onNavigate?: () => void
}

export function isCurrent(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * The site navigation as an ordered list with mono indexes (01 Práce …). Labels roll through
 * characters on hover and focus. Client only for usePathname → aria-current.
 */
export function NavList({
  className,
  itemClassName,
  linkClassName,
  indexClassName,
  labelClassName,
  cascade = false,
  onNavigate,
}: Props) {
  const pathname = usePathname()

  return (
    <ol className={className} role="list">
      {site.nav.map((item, i) => {
        const current = isCurrent(pathname, item.href)
        return (
          <li key={item.href} className={itemClassName} style={{ '--i': i } as CSSProperties}>
            <Link
              href={item.href}
              className={linkClassName}
              aria-current={current ? 'page' : undefined}
              onClick={onNavigate}
            >
              <span className={indexClassName} aria-hidden="true">
                {item.index}
              </span>
              <Scramble
                text={item.label}
                className={labelClassName}
                autoplay={cascade}
                delay={120 + i * 70}
              />
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
