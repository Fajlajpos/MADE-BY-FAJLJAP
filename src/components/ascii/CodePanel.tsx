'use client'

import { useEffect, useRef, useState } from 'react'
import { loadKit, prefersReducedMotion } from '@/lib/ascii/env'
import styles from './CodePanel.module.css'

type Props = {
  filename: string
  code: string
  /** Label of the replay button. */
  replay: string
  className?: string
}

/** Splits code into small tokens (words, spaces, punctuation) so it streams like typing. */
function tokens(code: string): string[] {
  return code.match(/\s+|[A-Za-zÀ-ž0-9_]+|./gu) ?? [code]
}

/**
 * A panel of code that writes itself when it scrolls into view: each character rolls up through
 * glyphs and lands on the letter (asciify kit `streamText`). The whole code is in the HTML from
 * the start, so it reads without JS and the panel never changes height.
 */
export function CodePanel({ filename, code, replay, className }: Props) {
  const codeRef = useRef<HTMLElement>(null)
  const runRef = useRef<() => void>(() => {})
  const [busy, setBusy] = useState(false)
  const lines = code.split('\n').length

  useEffect(() => {
    const el = codeRef.current
    if (!el || prefersReducedMotion()) return
    let cancelled = false
    let timer = 0
    let cleanup = () => {}

    void loadKit().then((kit) => {
      if (cancelled || !kit) return
      const out = kit.streamText(el, { transition: 'roll', roll: 220, stagger: 6, caret: true })
      const run = () => {
        window.clearTimeout(timer)
        out.reset()
        setBusy(true)
        const list = tokens(code)
        let i = 0
        const next = () => {
          if (cancelled) return
          if (i >= list.length) {
            void out.done().then(() => setBusy(false))
            return
          }
          out.write(list[i++]!)
          timer = window.setTimeout(next, list[i - 1] === '\n' ? 90 : 26)
        }
        next()
      }
      runRef.current = run
      const io = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting) return
        run()
        io.disconnect()
      })
      io.observe(el)
      cleanup = () => {
        io.disconnect()
        window.clearTimeout(timer)
        out.destroy()
      }
    })

    return () => {
      cancelled = true
      cleanup()
    }
  }, [code])

  return (
    <div className={[styles.panel, className].filter(Boolean).join(' ')}>
      <div className={styles.bar}>
        <span className={styles.lights} aria-hidden="true">
          o o o
        </span>
        <span className={`meta ${styles.file}`}>{filename}</span>
        <button
          type="button"
          className={styles.replay}
          onClick={() => runRef.current()}
          disabled={busy}
        >
          {replay}
        </button>
      </div>
      <pre className={styles.pre} style={{ minHeight: `calc(${lines} * 1.75em + 2.5rem)` }}>
        <code ref={codeRef} className={styles.code}>
          {code}
        </code>
      </pre>
    </div>
  )
}
