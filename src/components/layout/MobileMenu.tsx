'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { site } from '@/content/site'
import { NavList } from './NavList'
import { Status } from './Status'
import styles from './MobileMenu.module.css'

const DESKTOP = '(min-width: 1024px)'
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Fullscreen menu below 1024 px. It opens as a circle growing from the button, the links rise in
 * one after another. Modal dialog: focus moves in, Tab is trapped, Esc closes and returns focus
 * to the opener, everything outside is inert and the page does not scroll.
 */
export function MobileMenu() {
  const dialogId = useId()
  const [open, setOpen] = useState(false)
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
        aria-label="Otevřít menu"
        onClick={() => setOpen(true)}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
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
        <div className={styles.top}>
          <Link href="/" className={styles.brand} aria-label={`${site.brand} – úvod`} onClick={onNavigate}>
            {site.brand}
            <span className={styles.dot} aria-hidden="true" />
          </Link>
          <button ref={closeRef} type="button" className={styles.close} onClick={() => close(true)} aria-label="Zavřít menu">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </button>
        </div>

        <nav className={styles.nav} aria-label="Hlavní navigace">
          <NavList
            indexes
            className={styles.list}
            itemClassName={styles.item}
            linkClassName={styles.link}
            indexClassName={`meta ${styles.index}`}
            onNavigate={onNavigate}
          />
        </nav>

        <div className={styles.foot}>
          <Status />
          <a className={styles.mail} href={`mailto:${site.contact.email}`}>
            {site.contact.email}
          </a>
        </div>
      </div>
    </>
  )
}
