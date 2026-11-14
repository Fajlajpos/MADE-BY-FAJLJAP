'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { site } from '@/content/site'
import { scrollToTarget } from '@/three/scroll'
import styles from './CommandPalette.module.css'

const OPEN_EVENT = 'fajlajp:palette'

/** Open the palette from anywhere (the full-screen menu has a button for it). */
export function openPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT))
}

type Command = { id: string; label: string; hint: string; run: () => void | Promise<void> }

/**
 * Ctrl/⌘ K: jump to a section, write or copy the e-mail, back to the top.
 * A modal dialog with a filter field and a listbox: ↑ ↓ choose, Enter runs, Esc or a click
 * outside closes, focus returns to where it was.
 */
export function CommandPalette({ triggerClassName }: { triggerClassName?: string }) {
  const router = useRouter()
  const uid = useId().replace(/:/g, '')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const returnRef = useRef<HTMLElement | null>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const [message, setMessage] = useState('')

  const goTo = useCallback(
    (href: string) => {
      const hash = href.split('#')[1]
      const target = hash ? document.getElementById(hash) : null
      if (target) scrollToTarget(target)
      else router.push(href)
    },
    [router],
  )

  const commands = useMemo<Command[]>(
    () => [
      ...site.nav.map((item) => ({ id: item.href, label: item.label, hint: 'sekce', run: () => goTo(item.href) })),
      {
        id: 'mail',
        label: 'Napsat e-mail',
        hint: site.contact.email,
        run: () => {
          window.location.href = `mailto:${site.contact.email}`
        },
      },
      {
        id: 'copy',
        label: 'Zkopírovat e-mail',
        hint: 'do schránky',
        run: async () => {
          try {
            await navigator.clipboard.writeText(site.contact.email)
            setMessage(`Zkopírováno: ${site.contact.email}`)
          } catch {
            setMessage(`Kopírování nešlo. E-mail: ${site.contact.email}`)
          }
          window.setTimeout(() => setMessage(''), 2600)
        },
      },
      { id: 'top', label: 'Nahoru', hint: 'začátek stránky', run: () => scrollToTarget(0) },
    ],
    [goTo],
  )

  const needle = query.trim().toLocaleLowerCase('cs')
  const visible = needle
    ? commands.filter((c) => `${c.label} ${c.hint}`.toLocaleLowerCase('cs').includes(needle))
    : commands
  const current = Math.min(index, Math.max(0, visible.length - 1))

  const show = useCallback(() => {
    returnRef.current = document.activeElement as HTMLElement | null
    setQuery('')
    setIndex(0)
    setOpen(true)
  }, [])

  const hide = useCallback(() => {
    setOpen(false)
    ;(returnRef.current ?? triggerRef.current)?.focus()
  }, [])

  const run = useCallback(
    (command: Command | undefined) => {
      if (!command) return
      setOpen(false)
      void command.run()
    },
    [],
  )

  // Ctrl/⌘ K anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (open) hide()
        else show()
      }
    }
    document.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_EVENT, show)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_EVENT, show)
    }
  }, [open, show, hide])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={[styles.trigger, triggerClassName].filter(Boolean).join(' ')}
        aria-label="Rejstřík: hledat a přejít (Ctrl K)"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={show}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="1.6" fill="none" />
          <path d="M15 15l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
        </svg>
        <span className={styles.triggerText} aria-hidden="true">
          rejstřík
        </span>
        <kbd className={styles.kbd}>Ctrl K</kbd>
      </button>

      {open && (
        <div className={styles.backdrop} onMouseDown={(e) => e.target === e.currentTarget && hide()}>
          <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Kam to bude?">
            <p className={styles.head} aria-hidden="true">
              <span>rejstřík</span>
              <span>Ctrl K</span>
            </p>
            <label className="visually-hidden" htmlFor={`${uid}-input`}>
              Kam to bude?
            </label>
            <input
              ref={inputRef}
              id={`${uid}-input`}
              className={styles.input}
              type="text"
              placeholder="Kam to bude? Práce, e-mail…"
              role="combobox"
              aria-controls={`${uid}-list`}
              aria-expanded="true"
              aria-autocomplete="list"
              aria-activedescendant={visible[current] ? `${uid}-${current}` : undefined}
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setIndex(0)
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setIndex((current + 1) % Math.max(1, visible.length))
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setIndex((current - 1 + visible.length) % Math.max(1, visible.length))
                } else if (e.key === 'Enter') {
                  e.preventDefault()
                  run(visible[current])
                } else if (e.key === 'Escape') {
                  e.preventDefault()
                  hide()
                } else if (e.key === 'Tab') {
                  e.preventDefault()
                }
              }}
            />
            <ul id={`${uid}-list`} className={styles.list} role="listbox" aria-label="Příkazy">
              {visible.map((command, i) => (
                <li
                  key={command.id}
                  id={`${uid}-${i}`}
                  className={styles.row}
                  role="option"
                  aria-selected={i === current}
                  onMouseEnter={() => setIndex(i)}
                  onClick={() => run(command)}
                >
                  <span className={styles.label}>{command.label}</span>
                  <span className={styles.leader} aria-hidden="true" />
                  <span className={styles.hint}>{command.hint}</span>
                </li>
              ))}
              {visible.length === 0 && (
                <li className={styles.empty} role="presentation">
                  Nic. Zkus „práce“ nebo „e-mail“.
                </li>
              )}
            </ul>
            <p className={styles.foot} aria-hidden="true">
              ↑↓ vybrat · Enter spustit · Esc zavřít
            </p>
          </div>
        </div>
      )}

      <p className={styles.toast} role="status" data-show={message !== ''}>
        {message}
      </p>
    </>
  )
}
