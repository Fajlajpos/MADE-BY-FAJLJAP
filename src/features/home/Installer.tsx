'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import styles from './Installer.module.css'

/**
 * 03 Jak to probíhá as an old-school setup wizard. One chrome window: a picture panel on the left,
 * the current step on the right (its title, how long it takes, what happens, a line of "copying
 * files…" status), a progress bar whose segments are as long as the steps really take, and
 * Back / Next / Finish. Finish takes you to the contact form.
 */

/**
 * Your art for the picture panel, one per step (cut-outs in /public/brand, e.g.
 * '/brand/process-1.webp'). Empty: a chrome numeral on the holographic sheen.
 */
const STEP_ART = ['', '', '', '']

/** Your chrome window frame render around the whole wizard (optional). Empty: the CSS bevel. */
const FRAME_ART = ''

/** How much of the bar each step takes: roughly how long it really lasts (squeezed, so step 1 stays visible). */
const WEIGHTS = [1, 1.4, 4, 1.6]

export type InstallerStep = {
  title: string
  time: string
  body: string
  status: string[]
  check?: string
}

export type InstallerCopy = {
  window: string
  stepOf: string
  bar: string
  back: string
  next: string
  finish: string
  finishHint: string
}

type Props = { steps: InstallerStep[]; copy: InstallerCopy; finishHref: string }

const no = (i: number) => String(i + 1).padStart(2, '0')

export function Installer({ steps, copy, finishHref }: Props) {
  const total = steps.length
  const win = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  /** How far the status line has ticked through the current step, 0–1. */
  const [frac, setFrac] = useState(0)
  const [checks, setChecks] = useState<boolean[]>(() => steps.map(() => true))

  // the status line ticks along on its own while the window is on screen
  useEffect(() => {
    const el = win.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let timer = 0
    const io = new IntersectionObserver(([e]) => {
      window.clearInterval(timer)
      if (!e?.isIntersecting) return
      timer = window.setInterval(() => setFrac((f) => (f + 0.2 >= 1 ? 0 : f + 0.2)), 1700)
    })
    io.observe(el)
    return () => {
      io.disconnect()
      window.clearInterval(timer)
    }
  }, [step])

  const go = useCallback(
    (i: number) => {
      setStep(Math.max(0, Math.min(total - 1, i)))
      setFrac(0)
    },
    [total],
  )

  const current = steps[step]!
  const statuses = current.status
  const status = statuses[Math.min(statuses.length - 1, Math.floor(frac * statuses.length))]
  const last = step === total - 1
  const art = STEP_ART[step]
  /** "37 %": how much of the whole job is done after this step, by the bar's weights. */
  const sum = WEIGHTS.reduce((a, b) => a + b, 0)
  const pct = Math.round((WEIGHTS.slice(0, step + 1).reduce((a, b) => a + b, 0) / sum) * 100)

  /** How full each segment of the bar is. */
  const fill = (i: number) => {
    if (i < step) return 1
    if (i > step) return 0
    return 1
  }

  return (
    <div className={styles.stage}>
      <div ref={win} className={styles.win} data-reveal="">
        {FRAME_ART && (
          // eslint-disable-next-line @next/next/no-img-element -- a decorative chrome frame cut-out
          <img className={styles.frameArt} src={FRAME_ART} alt="" aria-hidden="true" />
        )}

        <div className={styles.titlebar}>
          <span className={styles.titleIcon} aria-hidden="true" />
          <p className={styles.titleText}>{copy.window}</p>
          <span className={styles.winButtons} aria-hidden="true">
            <span>
              <svg viewBox="0 0 10 10">
                <path d="M2 7.5h6" />
              </svg>
            </span>
            <span>
              <svg viewBox="0 0 10 10">
                <rect x="2" y="2" width="6" height="6" />
              </svg>
            </span>
            <span>
              <svg viewBox="0 0 10 10">
                <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" />
              </svg>
            </span>
          </span>
        </div>

        <div className={styles.body}>
          <div className={styles.side} aria-hidden="true" data-cloud-dock="">
            {art ? (
              // eslint-disable-next-line @next/next/no-img-element -- his own render per step
              <img key={art} className={styles.sideArt} src={art} alt="" />
            ) : (
              <span key={step} className={styles.sideNum}>
                {no(step)}
              </span>
            )}
          </div>

          <div className={styles.main} aria-live="polite">
            <p className={styles.stepOf}>
              {copy.stepOf.replace('{n}', String(step + 1)).replace('{total}', String(total))}
            </p>
            <div key={step} className={styles.panel}>
              <div className={styles.headRow}>
                <h3 className={styles.title}>{current.title}</h3>
                <p className={styles.time}>{current.time}</p>
              </div>
              <p className={styles.text}>{current.body}</p>
              {current.check && (
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={checks[step]}
                    onChange={(e) =>
                      setChecks((c) => c.map((v, j) => (j === step ? e.target.checked : v)))
                    }
                  />
                  <span className={styles.box} aria-hidden="true">
                    <svg viewBox="0 0 12 12">
                      <path d="M2.5 6.2l2.4 2.4 4.6-5" />
                    </svg>
                  </span>
                  <span>{current.check}</span>
                </label>
              )}
            </div>
            <p className={styles.status} aria-hidden="true">
              <span className={styles.spinner} />
              <span key={status}>{status}</span>
            </p>
          </div>
        </div>

        <div className={styles.barWrap}>
          <div
            className={styles.bar}
            role="progressbar"
            aria-label={copy.bar}
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={step + 1}
            aria-valuetext={`${copy.stepOf.replace('{n}', String(step + 1)).replace('{total}', String(total))}: ${current.title}`}
          >
            {steps.map((s, i) => (
              <span
                key={s.title}
                className={styles.seg}
                style={{ flexGrow: WEIGHTS[i] ?? 1, '--fill': fill(i) } as CSSProperties}
              />
            ))}
          </div>
          <ol className={styles.marks} role="list">
            {steps.map((s, i) => (
              <li key={s.title} style={{ flexGrow: WEIGHTS[i] ?? 1 }}>
                <button
                  type="button"
                  className={styles.mark}
                  aria-current={i === step ? 'step' : undefined}
                  onClick={() => go(i)}
                >
                  <b>{no(i)}</b> {s.time}
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.footer}>
            <p className={styles.pct} aria-hidden="true">
              <span key={pct}>{pct}</span>%
            </p>
          <button
            type="button"
            className={styles.btn}
            onClick={() => go(step - 1)}
            disabled={step === 0}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M10 3.5L5.5 8l4.5 4.5" />
            </svg>
            {copy.back}
          </button>
          {last ? (
            <a className={`${styles.btn} ${styles.primary}`} href={finishHref}>
              {copy.finish} <span className={styles.hint}>{copy.finishHint}</span>
            </a>
          ) : (
            <button
              type="button"
              className={`${styles.btn} ${styles.primary}`}
              onClick={() => go(step + 1)}
            >
              {copy.next}
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M6 3.5L10.5 8 6 12.5" />
              </svg>
            </button>
          )}
        </div>

        <p className={styles.statusbar} aria-hidden="true">
          <span>FAJLAJP Setup 1.0</span>
          <span>
            {no(step)} / {no(total - 1)}
          </span>
        </p>
      </div>
    </div>
  )
}

