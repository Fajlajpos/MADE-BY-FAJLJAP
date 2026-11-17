'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import type { CaseSpec, PileState } from '@/three/objects/cases'
import { useThreeEnabled } from '@/three/site/context'
import { Slot3D } from '@/three/site/Slot3D'
import styles from './Faq.module.css'

/**
 * How each case lies on the pile: a slight turn (deg), a nudge sideways (share of its width)
 * and the colour of its spine band. Hand-set, so the pile looks put down by hand.
 */
const PILE = [
  { tilt: -0.8, shift: 0.015, band: 'accent' },
  { tilt: 0.6, shift: -0.01, band: 'grey' },
  { tilt: -0.3, shift: 0.03, band: 'blue' },
  { tilt: 0.9, shift: 0, band: 'accent' },
  { tilt: -0.6, shift: -0.02, band: 'blue' },
  { tilt: 0.4, shift: 0.02, band: 'grey' },
] as const

const no = (i: number) => String(i + 1).padStart(2, '0')

/**
 * The common questions as chapters of a small collection: a pile of game cases in 3D, one case
 * per question. Click a case (or a chapter number) and it leaves the pile and opens; beside it
 * the chapter reads: its number, the question, the answer, the way to the next one.
 * Underneath it is a plain tab list: the numbers are tabs (← → Home End), every answer is in the
 * page. Without 3D the chapters work the same, just without the pile.
 */
export function FaqCases({ head, faq }: { head: ReactNode; faq: { q: string; a: string }[] }) {
  const three = useThreeEnabled()
  const [active, setActive] = useState(0)
  const pile = useRef<PileState>({ open: 0, hover: -1, ndc: null, click: false, hit: -1 })
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const cases = useMemo<CaseSpec[]>(() => faq.map((qa, i) => ({ q: qa.q, ...PILE[i % PILE.length]! })), [faq])
  const count = faq.length

  const open = useCallback((i: number) => {
    setActive(i)
    pile.current.open = i
  }, [])
  useEffect(() => {
    pile.current.pick = open
  }, [open])

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const to = { ArrowRight: (i + 1) % count, ArrowLeft: (i - 1 + count) % count, Home: 0, End: count - 1 }[e.key]
    if (to === undefined) return
    e.preventDefault()
    open(to)
    tabs.current[to]?.focus()
  }

  // the cursor over the pile: where it is (for the 3D ray) and a hand over a case
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    pile.current.ndc = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -(((e.clientY - r.top) / r.height) * 2 - 1) }
    const over = pile.current.hit >= 0 && pile.current.hit !== pile.current.open
    e.currentTarget.style.cursor = over ? 'pointer' : ''
  }
  const onLeave = (e: PointerEvent<HTMLDivElement>) => {
    pile.current.ndc = null
    e.currentTarget.style.cursor = ''
  }

  const qa = faq[active]!
  return (
    <div className={styles.faq} data-three={three ? '' : undefined}>
      <div className={styles.head}>{head}</div>

      {three && (
        <div
          className={styles.stage}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          onClick={() => (pile.current.click = true)}
        >
          <Slot3D object="cases" className={styles.pile} pile={pile} cases={cases} />
          <p className={styles.hint} aria-hidden="true">
            Klikni na krabičku
          </p>
        </div>
      )}

      <div className={styles.book}>
        <div role="tablist" aria-label="Kapitoly" className={styles.toc}>
          {faq.map((item, i) => (
            <button
              key={item.q}
              ref={(el) => {
                tabs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`faq-tab-${i}`}
              aria-controls={`faq-panel-${i}`}
              aria-selected={i === active}
              aria-label={`Kapitola ${i + 1}: ${item.q}`}
              tabIndex={i === active ? 0 : -1}
              className={styles.tab}
              data-band={PILE[i % PILE.length]!.band}
              onClick={() => open(i)}
              onKeyDown={(e) => onTabKey(e, i)}
              onFocus={() => (pile.current.hover = i)}
              onBlur={() => (pile.current.hover = -1)}
              onPointerEnter={() => (pile.current.hover = i)}
              onPointerLeave={() => (pile.current.hover = -1)}
            >
              {no(i)}
            </button>
          ))}
        </div>

        {faq.map((item, i) => (
          <div
            key={item.q}
            role="tabpanel"
            id={`faq-panel-${i}`}
            aria-labelledby={`faq-tab-${i}`}
            hidden={i !== active}
            className={styles.chapter}
            data-band={PILE[i % PILE.length]!.band}
          >
            <p className={styles.kicker}>
              Kapitola <b>{no(i)}</b> <span>/ {no(count - 1)}</span>
            </p>
            <h4 className={styles.question}>{item.q}</h4>
            <p className={styles.answer}>{item.a}</p>
          </div>
        ))}

        <div className={styles.nav}>
          <button type="button" className={styles.navBtn} onClick={() => open((active - 1 + count) % count)}>
            <span aria-hidden="true">←</span> Předchozí
          </button>
          <button type="button" className={`${styles.navBtn} ${styles.next}`} onClick={() => open((active + 1) % count)}>
            <span className={styles.nextLabel}>
              Další kapitola
              <small>{faq[(active + 1) % count]!.q}</small>
            </span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
      <span className="visually-hidden" aria-live="polite">
        Kapitola {active + 1}: {qa.q}
      </span>
    </div>
  )
}
