'use client'

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from 'react'
import { InView } from '@/components/ascii/InView'
import { Spinner } from '@/components/ascii/Live'
import { home } from '@/content/home'
import { site } from '@/content/site'
import { typo } from '@/lib/typo/czech'
import {
  emptyInquiry,
  validateInquiry,
  type Inquiry,
  type InquiryField,
  type InquiryState,
} from './inquiry'
import { sendInquiry } from './sendInquiry'
import shared from './home.module.css'
import styles from './Receipt.module.css'

const { form } = home.contact

/**
 * FAJLAJP set in Martian Mono 800 and printed into the ramp ' .:-=+*#%@' once (84 × 9 cells),
 * like the bitmap logo a till prints. Static on purpose: a printed logo does not move, and a live
 * field here stalled the scroll while its GPU context started.
 */
const LOGO = `#@@@@@@@@-   =@@@@%    :@@@@@@@@*   *@@-         #@@@@*    =@@@@@@@@=  #@@@@@@#=
#@@@@@@@@-   #@%#@@:   :@@@@@@@@*   *@@-        .@@#@@@.   =@@@@@@@@=  #@@@@@@@@#
#@@-.....   .@@*-@@+    .....=@@*   *@@-        =@@-*@@-    .....*@@=  #@@-..:%@@:
#@@=.....   +@@:.@@%         =@@*   *@@-        #@@ -@@*         *@@=  #@@=::-@@@.
#@@@@@@@+   %@@++%@@-        =@@*   *@@-       .@@%++@@@.        *@@=  #@@@@@@@@+
#@@#****-  :@@@@@@@@*  %@%   =@@*   *@@-       =@@@@@@@@- -@@+   *@@=  #@@#**+=.
#@@-       +@@++++@@@  @@@.  +@@+   *@@-.....  %@@++++@@* -@@#   #@@-  #@@:
#@@-       %@%    *@@- +@@@#%@@@:   *@@@@@@@@.:@@*    %@@. %@@%#%@@%   #@@:
#@@-      :@@+    -@@*  =%@@@@#:    *@@@@@@@@.=@@-    +@@- .+@@@@@+.   #@@:`

/** The fields each step asks for; a step moves on only when its own are right. */
const STEP_FIELDS: Record<number, InquiryField[]> = {
  1: ['name', 'email', 'phone'],
  2: [],
  3: ['message', 'consent'],
}
const STEPS = form.sections.length

const dateFormat = new Intl.DateTimeFormat('cs-CZ', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Europe/Prague',
})

/** 18.10.2026 and 23:14, in Prague. */
function stamp(date: Date) {
  const p = Object.fromEntries(dateFormat.formatToParts(date).map((x) => [x.type, x.value]))
  return { date: `${p.day}.${p.month}.${p.year}`, time: `${p.hour}:${p.minute}` }
}

/** Bars drawn from the receipt number, so every receipt gets its own code. */
function Barcode({ code }: { code: string }) {
  const { bars, width } = useMemo(() => {
    const bars: { x: number; w: number }[] = []
    let x = 0
    for (const ch of `*${code}*FAJLAJP*`) {
      const n = ch.charCodeAt(0)
      for (let i = 0; i < 4; i++) {
        const w = ((n >> (i * 2)) & 3) + 1
        if (i % 2 === 0) bars.push({ x, w })
        x += w
      }
      x += 1
    }
    return { bars, width: x }
  }, [code])

  return (
    <svg
      className={styles.barcode}
      viewBox={`0 0 ${width} 40`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {bars.map((b) => (
        <rect key={b.x} x={b.x} y={0} width={b.w} height={40} fill="currentColor" />
      ))}
    </svg>
  )
}

/** A reverse-printed bar opening a step: its name, then „01/03" or, once done, „upravit". */
function Bar({ n, onEdit }: { n: number; onEdit?: () => void }) {
  const pad = (x: number) => String(x).padStart(2, '0')
  const name = form.sections[n - 1]
  return (
    <div className={styles.bar}>
      <h4 id={`r-step-${n}`}>{name}</h4>
      {onEdit ? (
        <button
          type="button"
          className={styles.edit}
          onClick={onEdit}
          aria-label={`${form.edit}: ${name}`}
        >
          [{form.edit}]
        </button>
      ) : (
        <span aria-hidden="true">
          {pad(n)}/{pad(STEPS)}
        </span>
      )}
    </div>
  )
}

/** A dotted till line: label ........ value. */
function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className={shared.fact}>
      <dt>{label}</dt>
      <span className={shared.leader} aria-hidden="true" />
      <dd className={styles.value}>{value}</dd>
    </div>
  )
}

/** Step 1, printed: who is asking. */
function PrintedWho({ v }: { v: Inquiry }) {
  return (
    <dl className={`${shared.facts} ${styles.sum} ${styles.printIn}`}>
      <Line label={form.fields.name.label} value={v.name} />
      <Line label={form.fields.email.label} value={v.email} />
      {v.phone.trim() ? <Line label={form.fields.phone.label} value={v.phone} /> : null}
    </dl>
  )
}

/** Step 2, printed: the services as till lines, then budget and deadline. */
function PrintedJob({ v }: { v: Inquiry }) {
  const empty = !v.company.trim() && v.services.length === 0 && !v.budget && !v.deadline
  if (empty) return <p className={`${styles.muted} ${styles.printIn}`}>{form.itemsEmpty}</p>
  return (
    <div className={`${styles.block} ${styles.printIn}`}>
      {v.services.length > 0 ? (
        <ul className={`${shared.facts} ${styles.sum}`} role="list">
          {v.services.map((s, i) => (
            <li key={s} className={shared.fact}>
              <span className={styles.qty}>
                <span className={styles.muted}>{String(i + 1).padStart(2, '0')}</span> 1x {s}
              </span>
              <span className={shared.leader} aria-hidden="true" />
              <span>{form.price}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <dl className={`${shared.facts} ${styles.sum}`}>
        {v.company.trim() ? <Line label={form.fields.company.label} value={v.company} /> : null}
        {v.budget ? <Line label={form.budgetLabel} value={typo(v.budget)} /> : null}
        {v.deadline ? <Line label={form.deadlineLabel} value={v.deadline} /> : null}
      </dl>
    </div>
  )
}

function Total() {
  return (
    <>
      <p className={`${styles.rule} ${styles.double}`} aria-hidden="true" />
      <p className={styles.total}>
        <span className={styles.tall}>{form.total}</span>
        <span className={styles.tall}>{form.totalValue}</span>
      </p>
    </>
  )
}

/** useSyncExternalStore pieces for „is this the browser?": false on the server, true after. */
const subscribeNever = () => () => {}
const inBrowser = () => true
const onServer = () => false

type Props = { reprint: boolean; onAgain: () => void }

function ReceiptForm({ reprint, onAgain }: Props) {
  const [state, action, pending] = useActionState<InquiryState, FormData>(sendInquiry, {
    status: 'idle',
  })
  const [v, setV] = useState<Inquiry>(emptyInquiry)
  // Fields checked in the browser; an explicit undefined clears a server error once fixed.
  const [checked, setChecked] = useState<Partial<Record<InquiryField, string | undefined>>>({})
  // Step by step only once the page runs: before hydration and without JS, one long receipt.
  const hydrated = useSyncExternalStore(subscribeNever, inBrowser, onServer)
  const [current, setStep] = useState(1)
  const step = hydrated ? current : 0
  const [meta, setMeta] = useState<{ no: string; date: string; time: string } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const openedAt = useRef(0)
  const thanksRef = useRef<HTMLHeadingElement>(null)

  const sent = state.status === 'sent'
  const errors = { ...(state.status === 'invalid' ? state.errors : {}), ...checked }
  const stepped = step > 0

  useEffect(() => {
    // With JS the receipt explains its own errors; without it the browser's checks stay on.
    if (formRef.current) formRef.current.noValidate = true
    openedAt.current = performance.now()
    const no = String(Date.now()).slice(-6)
    const tick = () => setMeta({ no, ...stamp(new Date()) })
    tick()
    const id = window.setInterval(tick, 15000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (sent) thanksRef.current?.focus()
  }, [sent])

  const set = <K extends keyof Inquiry>(key: K, value: Inquiry[K]) => {
    const next = { ...v, [key]: value }
    setV(next)
    if (key in errors && errors[key as InquiryField]) {
      setChecked((c) => ({ ...c, [key]: validateInquiry(next)[key as InquiryField] }))
    }
  }

  const check = (field: InquiryField) =>
    setChecked((c) => ({ ...c, [field]: validateInquiry(v)[field] }))

  const toggle = (service: string) =>
    set(
      'services',
      v.services.includes(service)
        ? v.services.filter((s) => s !== service)
        : form.services.filter((s) => s === service || v.services.includes(s)),
    )

  /** Shows a step and puts the cursor in its first control once it is printed in. */
  const go = (to: number, field?: InquiryField) => {
    setStep(to)
    requestAnimationFrame(() => {
      const panel = formRef.current?.querySelector<HTMLElement>(`[data-step="${to}"]`)
      const target = field
        ? panel?.querySelector<HTMLElement>(`[name="${field}"]`)
        : panel?.querySelector<HTMLElement>('input:not([type=hidden]), select, textarea')
      target?.focus()
    })
  }

  /** Marks the errors among `fields`; returns the first wrong one. */
  const report = (fields: InquiryField[]) => {
    const found = validateInquiry(v)
    const wrong = fields.filter((f) => found[f])
    setChecked((c) => {
      const next = { ...c }
      for (const f of fields) next[f] = found[f]
      return next
    })
    return wrong[0]
  }

  const next = () => {
    const wrong = report(STEP_FIELDS[step] ?? [])
    if (wrong) {
      formRef.current?.querySelector<HTMLElement>(`[name="${wrong}"]`)?.focus()
      return
    }
    go(step + 1)
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    // Enter in an early step moves on instead of sending
    if (stepped && step < STEPS) {
      event.preventDefault()
      next()
      return
    }
    const wrong = report(['name', 'email', 'phone', 'message', 'consent'])
    if (wrong) {
      event.preventDefault()
      const at = Number(Object.keys(STEP_FIELDS).find((k) => STEP_FIELDS[+k]!.includes(wrong)))
      if (stepped && at !== step) go(at, wrong)
      else formRef.current?.querySelector<HTMLElement>(`[name="${wrong}"]`)?.focus()
      return
    }
    const t = formRef.current?.elements.namedItem('t')
    if (t instanceof HTMLInputElement)
      t.value = String(Math.round(performance.now() - openedAt.current))
  }

  const no = (sent && state.no) || meta?.no || '------'
  const errorId = (field: InquiryField) => (errors[field] ? `r-${field}-err` : undefined)
  /** Is step n's bar printed yet, and are its fields the ones to fill now? */
  const reached = (n: number) => !stepped || n <= step
  const open = (n: number) => !stepped || n === step
  const done = (n: number) => stepped && n < step

  const error = (field: InquiryField) =>
    errors[field] ? (
      <p id={`r-${field}-err`} className={styles.error}>
        ! {errors[field]}
      </p>
    ) : null

  const textField = (key: 'name' | 'email' | 'company' | 'phone') => {
    const field = form.fields[key]
    const required = key === 'name' || key === 'email'
    const validated = key === 'company' ? undefined : key
    return (
      <div className={styles.field}>
        <label htmlFor={`r-${key}`} className={styles.label}>
          {field.label}
          {required ? <span aria-hidden="true">*</span> : null}
        </label>
        <input
          id={`r-${key}`}
          name={key}
          className={styles.input}
          type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
          autoComplete={
            key === 'name'
              ? 'name'
              : key === 'email'
                ? 'email'
                : key === 'phone'
                  ? 'tel'
                  : 'organization'
          }
          inputMode={key === 'email' ? 'email' : key === 'phone' ? 'tel' : undefined}
          placeholder={field.placeholder}
          required={required}
          maxLength={key === 'phone' ? 30 : 160}
          value={v[key]}
          onChange={(e) => set(key, e.target.value)}
          onBlur={validated ? () => check(validated) : undefined}
          aria-invalid={validated && errors[validated] ? true : undefined}
          aria-describedby={validated ? errorId(validated) : undefined}
        />
        {validated ? error(validated) : null}
      </div>
    )
  }

  const choice = (key: 'budget' | 'deadline', label: string, options: readonly string[]) => (
    <div className={styles.field}>
      <label htmlFor={`r-${key}`} className={styles.label}>
        {label}
      </label>
      <span className={styles.selectWrap}>
        <select
          id={`r-${key}`}
          name={key}
          className={`${styles.input} ${styles.select}`}
          value={v[key]}
          onChange={(e) => set(key, e.target.value)}
        >
          <option value="">{form.choose}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {typo(o)}
            </option>
          ))}
        </select>
      </span>
    </div>
  )

  const nextButton = stepped ? (
    <button type="button" className={styles.next} onClick={next}>
      {form.next}
      <span className={shared.arrow} aria-hidden="true">
        -&gt;
      </span>
    </button>
  ) : null

  return (
    <div id="poptavka" className={styles.wrap}>
      <InView className={styles.feed}>
        <form
          ref={formRef}
          action={action}
          onSubmit={onSubmit}
          className={`paper ${styles.receipt}`}
          data-reprint={reprint || undefined}
          aria-labelledby="poptavka-title"
          aria-busy={pending}
        >
          <header className={styles.head}>
            <pre className={styles.logo} aria-hidden="true">
              {LOGO}
            </pre>
            <p>{form.sub}</p>
            <p>{site.contact.email}</p>
          </header>

          <p className={`${styles.rule} ${styles.double}`} aria-hidden="true" />

          <h3 id="poptavka-title" className={styles.title}>
            <span className={styles.tall}>*** {form.title} ***</span>
          </h3>

          <div className={`${styles.row} ${styles.info}`}>
            <span>
              Č. <span suppressHydrationWarning>{no}</span>
            </span>
            <span>
              <time suppressHydrationWarning>{meta?.date ?? '--.--.----'}</time>{' '}
              <time suppressHydrationWarning>{meta?.time ?? '--:--'}</time>
            </span>
          </div>

          {sent ? (
            <div className={styles.printed}>
              <p className={styles.stamp} aria-hidden="true">
                {form.sent.stamp}
              </p>
              <h4 ref={thanksRef} tabIndex={-1} className={styles.thanks}>
                {form.sent.title}
              </h4>
              <p className={styles.note}>{typo(form.sent.body)}</p>
              <Bar n={1} />
              <PrintedWho v={v} />
              <Bar n={2} />
              <PrintedJob v={v} />
              <Bar n={3} />
              <p className={styles.message}>{v.message}</p>
              <Total />
              <button type="button" className={styles.again} onClick={onAgain}>
                {form.sent.again}
                <span className={shared.arrow} aria-hidden="true">
                  -&gt;
                </span>
              </button>
            </div>
          ) : (
            <>
              {/* 01 — who */}
              {reached(1) ? <Bar n={1} onEdit={done(1) ? () => go(1) : undefined} /> : null}
              {done(1) ? <PrintedWho v={v} /> : null}
              <div className={`${styles.step} ${styles.printIn}`} data-step={1} hidden={!open(1)}>
                {textField('name')}
                {textField('email')}
                {textField('phone')}
                {nextButton}
              </div>

              {/* 02 — the job */}
              {reached(2) ? <Bar n={2} onEdit={done(2) ? () => go(2) : undefined} /> : null}
              {done(2) ? <PrintedJob v={v} /> : null}
              <div className={`${styles.step} ${styles.printIn}`} data-step={2} hidden={!open(2)}>
                <fieldset className={styles.options}>
                  <legend className={styles.label}>{form.servicesLabel}</legend>
                  <div className={styles.chips}>
                    {form.services.map((s) => (
                      <label key={s} className={styles.chip}>
                        <input
                          type="checkbox"
                          name="services"
                          value={s}
                          checked={v.services.includes(s)}
                          onChange={() => toggle(s)}
                        />
                        <span>{s}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                {choice('budget', form.budgetLabel, form.budgets)}
                {choice('deadline', form.deadlineLabel, form.deadlines)}
                {textField('company')}
                {nextButton}
              </div>

              {/* 03 — the message, then send */}
              {reached(3) ? <Bar n={3} /> : null}
              <div className={`${styles.step} ${styles.printIn}`} data-step={3} hidden={!open(3)}>
                <div className={styles.block}>
                  <label htmlFor="r-message" className={styles.ask}>
                    {typo(form.messageHint)}
                    <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="r-message"
                    name="message"
                    className={styles.textarea}
                    rows={4}
                    required
                    minLength={10}
                    maxLength={5000}
                    value={v.message}
                    onChange={(e) => set('message', e.target.value)}
                    onBlur={() => check('message')}
                    aria-invalid={errors.message ? true : undefined}
                    aria-describedby={errorId('message')}
                  />
                  {error('message')}
                </div>

                <Total />

                <div className={styles.block}>
                  <label className={styles.consent}>
                    <input
                      type="checkbox"
                      name="consent"
                      required
                      checked={v.consent}
                      onChange={(e) => set('consent', e.target.checked)}
                      aria-invalid={errors.consent ? true : undefined}
                      aria-describedby={errorId('consent')}
                    />
                    <span>
                      {form.consent} (<a href="/ochrana-osobnich-udaju">{form.consentLink}</a>)
                      <span aria-hidden="true">*</span>
                    </span>
                  </label>
                  {error('consent')}
                </div>

                <button type="submit" className={styles.submit} disabled={pending}>
                  {pending ? (
                    <>
                      {form.pending} <Spinner />
                    </>
                  ) : (
                    <>
                      {form.submit}
                      <span className={shared.arrow} aria-hidden="true">
                        -&gt;
                      </span>
                    </>
                  )}
                </button>

                {state.status === 'failed' ? (
                  <p className={styles.error} role="alert">
                    ! {form.failed}{' '}
                    <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
                  </p>
                ) : null}
              </div>

              <input type="hidden" name="no" value={meta?.no ?? ''} />
              <input type="hidden" name="t" defaultValue="" />
              <div className={styles.trap} aria-hidden="true">
                <label>
                  Web
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
            </>
          )}

          <footer className={styles.foot}>
            <Barcode code={no} />
            <p className={styles.code}>{no}</p>
            <p>{typo(form.footer)}</p>
            <p className={styles.end}>{form.end}</p>
            <p className={styles.cut}>
              <span aria-hidden="true">8&lt;</span>
              <span>{form.cut}</span>
            </p>
          </footer>
        </form>
      </InView>

      <p className="visually-hidden" role="status">
        {pending
          ? form.pending
          : sent
            ? `${form.sent.stamp}. ${form.sent.title}`
            : step > 1
              ? `${step}/${STEPS} ${form.sections[step - 1]}`
              : ''}
      </p>
    </div>
  )
}

/** The inquiry form as a till receipt, printed step by step. „Napsat další" prints a fresh one. */
export function Receipt() {
  const [copy, setCopy] = useState(0)
  return <ReceiptForm key={copy} reprint={copy > 0} onAgain={() => setCopy((c) => c + 1)} />
}
