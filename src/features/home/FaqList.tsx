'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useContent } from '@/content/client'
import styles from './FaqList.module.css'

const no = (i: number) => String(i + 1).padStart(2, '0')

/**
 * Na co se lidi ptají as a small console, in the installer's materials: the questions on the left
 * as glossy chrome buttons (a tab list: ← → ↑ ↓ Home End), the answer on the right on a big black
 * screen — a huge chrome number behind it, the answer typing itself out with a blinking caret,
 * and Previous / Next underneath. Every answer is in the page for search engines and readers.
 */
export function FaqList({ head, faq }: { head: ReactNode; faq: { q: string; a: string }[] }) {
  const t = useContent().ui.faq
  const [active, setActive] = useState(0)
  const [typed, setTyped] = useState<number | null>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const total = faq.length
  const current = faq[active]!

  // the answer types itself out (whole at once under reduced motion)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const len = current.a.length
    let n = 0
    const step = Math.max(1, Math.ceil(len / 45))
    const timer = window.setInterval(() => {
      n = Math.min(len, n + step)
      setTyped(n >= len ? null : n)
      if (n >= len) window.clearInterval(timer)
    }, 16)
    return () => window.clearInterval(timer)
  }, [current.a])

  const go = (i: number, focus = false) => {
    const to = (i + total) % total
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setTyped(0)
    setActive(to)
    if (focus) tabs.current[to]?.focus()
  }

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const map: Record<string, number> = {
      ArrowDown: active + 1,
      ArrowRight: active + 1,
      ArrowUp: active - 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: total - 1,
    }
    if (!(e.key in map)) return
    e.preventDefault()
    go(map[e.key]!, true)
  }

  const shown = typed === null ? current.a : current.a.slice(0, typed)

  return (
    <div className={styles.faq}>
      <div className={styles.head}>{head}</div>

      <div className={styles.console}>
        <div
          className={styles.tabs}
          role="tablist"
          aria-label={t.chapters}
          aria-orientation="vertical"
          onKeyDown={onKey}
        >
          {faq.map((qa, i) => (
            <button
              key={qa.q}
              ref={(el) => {
                tabs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`faq-tab-${i}`}
              aria-selected={i === active}
              aria-controls={`faq-panel-${i}`}
              tabIndex={i === active ? 0 : -1}
              className={styles.tab}
              onClick={() => go(i)}
            >
              <span className={styles.tabNum} aria-hidden="true">
                {no(i)}
              </span>
              <span className={styles.tabText}>{qa.q}</span>
            </button>
          ))}
        </div>

        <div className={styles.screen}>
          <span key={`n${active}`} className={styles.bigNum} aria-hidden="true">
            {no(active)}
          </span>

          {faq.map((qa, i) => (
            <div
              key={qa.q}
              role="tabpanel"
              id={`faq-panel-${i}`}
              aria-labelledby={`faq-tab-${i}`}
              hidden={i !== active}
              className={styles.panel}
            >
              <p className={styles.meta}>
                {t.chapter} <b>{no(i)}</b> / {no(total - 1)}
              </p>
              <h4 className={styles.question}>{qa.q}</h4>
              <p className={styles.answer}>
                {/* the full answer for readers and search; the typed copy on top is only visual */}
                <span className={styles.ghost}>{qa.a}</span>
                <span className={styles.typed} aria-hidden="true">
                  {i === active ? shown : qa.a}
                  <span className={styles.caret} />
                </span>
              </p>
            </div>
          ))}

          <div className={styles.nav}>
            <button type="button" className={styles.navBtn} onClick={() => go(active - 1)}>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M10 3.5L5.5 8l4.5 4.5" />
              </svg>
              {t.prev}
            </button>
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navNext}`}
              onClick={() => go(active + 1)}
            >
              {t.next}
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M6 3.5L10.5 8 6 12.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
