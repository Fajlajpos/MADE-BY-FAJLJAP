'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { site } from '@/content/site'
import { loadKit } from '@/lib/ascii/env'
import styles from './CommandPalette.module.css'

type Command = { id: string; label: string; hint: string; run: () => void | Promise<void> }

/**
 * Ctrl/⌘ K palette: jump anywhere, write or copy the e-mail, back to the top. The asciify kit
 * condenses it out of the trigger in characters and wires the keys (arrows, Enter, Escape);
 * without the kit the trigger and Escape still open and close it.
 */
export function CommandPalette({ triggerClassName }: { triggerClassName?: string }) {
  const router = useRouter()
  const uid = useId().replace(/:/g, '')
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [fallback, setFallback] = useState(false)
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')

  const commands = useMemo<Command[]>(
    () => [
      { id: 'home', label: 'Úvod', hint: '/', run: () => router.push('/') },
      ...site.nav.map((item) => ({
        id: item.href.slice(1),
        label: item.label,
        hint: item.href,
        run: () => router.push(item.href),
      })),
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
        hint: 'schránka',
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
      {
        id: 'top',
        label: 'Nahoru',
        hint: 'začátek stránky',
        run: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      },
    ],
    [router],
  )

  const needle = query.trim().toLocaleLowerCase('cs')
  const visible = needle
    ? commands.filter((c) => `${c.label} ${c.hint}`.toLocaleLowerCase('cs').includes(needle))
    : commands
  const visibleRef = useRef(visible)
  useEffect(() => {
    visibleRef.current = visible
  })

  useEffect(() => {
    const panel = panelRef.current
    const trigger = triggerRef.current
    if (!panel || !trigger) return
    let cancelled = false
    let cleanup = () => {}

    void loadKit().then((kit) => {
      if (cancelled) return
      if (kit) {
        const handle = kit.commandPalette(panel, {
          trigger,
          open: false,
          ink: '--ascii-ink-strong',
          onRun: (index) => void visibleRef.current[index]?.run(),
          onOpenChange: (open) => {
            trigger.setAttribute('aria-expanded', String(open))
            if (!open) setQuery('')
          },
        })
        cleanup = () => handle.destroy()
        return
      }
      // no kit: a plain toggle
      setFallback(true)
      const toggle = () => {
        panel.hidden = !panel.hidden
        trigger.setAttribute('aria-expanded', String(!panel.hidden))
        if (!panel.hidden) inputRef.current?.focus()
      }
      const onKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && !panel.hidden) toggle()
      }
      trigger.addEventListener('click', toggle)
      document.addEventListener('keydown', onKey)
      cleanup = () => {
        trigger.removeEventListener('click', toggle)
        document.removeEventListener('keydown', onKey)
      }
    })

    return () => {
      cancelled = true
      cleanup()
    }
  }, [])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={[styles.trigger, triggerClassName].filter(Boolean).join(' ')}
        aria-label="Příkazy (Ctrl K)"
        aria-haspopup="dialog"
        aria-expanded="false"
        aria-controls={`${uid}-panel`}
      >
        <span className="meta">Příkazy</span>
        <kbd className={styles.kbd}>Ctrl K</kbd>
      </button>

      <div
        ref={panelRef}
        id={`${uid}-panel`}
        className={styles.panel}
        role="dialog"
        aria-label="Příkazy"
        hidden
      >
        <label className={`meta ${styles.label}`} htmlFor={`${uid}-input`}>
          Kam to bude?
        </label>
        <div className={styles.prompt}>
          <span aria-hidden="true">&gt;</span>
          <input
            ref={inputRef}
            id={`${uid}-input`}
            className={styles.input}
            type="text"
            role="combobox"
            aria-controls={`${uid}-list`}
            aria-expanded="true"
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <ul id={`${uid}-list`} className={styles.list} role="listbox" aria-label="Příkazy">
          {visible.map((command) => (
            <li
              key={command.id}
              id={`${uid}-${command.id}`}
              className={styles.row}
              role="option"
              aria-selected="false"
              onClick={fallback ? () => void command.run() : undefined}
            >
              <span className={styles.rowLabel}>{command.label}</span>
              <span className={`meta ${styles.rowHint}`}>{command.hint}</span>
            </li>
          ))}
          {visible.length === 0 ? (
            <li className={`meta ${styles.empty}`} role="presentation">
              Nic. Zkus „práce“ nebo „e-mail“.
            </li>
          ) : null}
        </ul>
        <p className={`meta ${styles.foot}`} aria-hidden="true">
          [↑↓] vybrat · [Enter] spustit · [Esc] zavřít
        </p>
      </div>

      <p className={`meta ${styles.toast}`} role="status" data-show={message !== ''}>
        {message}
      </p>
    </>
  )
}
