'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Clock } from '@/components/ascii/Live'
import { Scramble } from '@/components/ascii/Scramble'
import { site } from '@/content/site'
import { NavList } from './NavList'
import { Status } from './Status'
import styles from './MobileMenu.module.css'

const DESKTOP = '(min-width: 1024px)'
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Fullscreen menu below 1024 px. Rows of characters wipe down over the page, then every label
 * rolls in through glyphs. Modal dialog: focus moves in, Tab is trapped, Esc closes and returns
 * focus to the opener, everything outside is inert and the page does not scroll.
 */
export function MobileMenu() {
  const dialogId = useId()
  const [open, setOpen] = useState(false)
  const [round, setRound] = useState(0)
  const openerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // close when the route changes (state derived during render, no effect needed)
  const pathname = usePathname()
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false)
    if (returnFocus) openerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    if (!dialog) return

    const html = document.documentElement
    const prevOverflow = html.style.overflow
    html.style.overflow = 'hidden'

    // everything outside the header's subtree becomes inert (skip link, main, footer…)
    const host = dialog.closest('header') ?? dialog
    const inerted: HTMLElement[] = []
    for (const el of Array.from(document.body.children)) {
      if (el instanceof HTMLElement && !el.contains(host) && !el.inert) {
        el.inert = true
        inerted.push(el)
      }
    }

    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close(true)
        return
      }
      if (e.key !== 'Tab') return
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) return
      const first = items[0]!
      const last = items[items.length - 1]!
      const active = document.activeElement
      if (e.shiftKey && (active === first || !dialog.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || !dialog.contains(active))) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)

    const mq = window.matchMedia(DESKTOP)
    const onMq = () => mq.matches && close(false)
    mq.addEventListener('change', onMq)

    return () => {
      html.style.overflow = prevOverflow
      for (const el of inerted) el.inert = false
      document.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', onMq)
    }
  }, [open, close])

  const onNavigate = useCallback(() => close(false), [close])

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        className={styles.opener}
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => {
          setRound((n) => n + 1)
          setOpen(true)
        }}
      >
        <span className="meta">Menu</span>
        <span className={styles.bars} aria-hidden="true">
          [=]
        </span>
      </button>

      <div
        ref={dialogRef}
        id={dialogId}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={styles.sheet}
        data-open={open}
        inert={!open}
      >
        <div className={styles.wipe} aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} style={{ '--i': i } as React.CSSProperties} />
          ))}
        </div>

        <div className={styles.top}>
          <Link
            href="/"
            className={styles.brand}
            aria-label={`${site.brand} – úvod`}
            onClick={onNavigate}
          >
            {site.brand}
            <span className={styles.dot} aria-hidden="true">
              .
            </span>
          </Link>
          <button ref={closeRef} type="button" className={styles.close} onClick={() => close(true)}>
            <span className="meta">Zavřít</span>
            <span aria-hidden="true">[x]</span>
          </button>
        </div>

        <nav className={styles.nav} aria-label="Hlavní navigace">
          <p className={`meta ${styles.kicker}`} aria-hidden="true">
            $ ls ./rejstrik — {String(site.nav.length).padStart(2, '0')} položek
          </p>
          <NavList
            key={round}
            cascade={open}
            className={styles.list}
            itemClassName={styles.item}
            linkClassName={styles.link}
            indexClassName={`meta ${styles.index}`}
            labelClassName={styles.label}
            onNavigate={onNavigate}
          />
        </nav>

        <div className={styles.foot}>
          <Status />
          <a className={styles.mail} href={`mailto:${site.contact.email}`}>
            <Scramble text={site.contact.email} />
          </a>
          <p className={`meta ${styles.time}`}>
            <Clock />
          </p>
        </div>
      </div>
    </>
  )
}
