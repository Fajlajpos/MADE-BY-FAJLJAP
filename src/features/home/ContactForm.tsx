'use client'

import Link from 'next/link'
import { useActionState, useEffect, useId, useRef, useState } from 'react'
import { Arrow } from '@/components/ui/Arrow'
import { useContent } from '@/content/client'
import { typo } from '@/lib/typo/czech'
import {
  emptyInquiry,
  validateInquiry,
  type Inquiry,
  type InquiryErrors,
  type InquiryField,
  type InquiryState,
} from './inquiry'
import { sendInquiry } from './sendInquiry'
import shared from './home.module.css'
import { SentChat } from './SentChat'
import styles from './Contact.module.css'


/** Which fields each step checks before moving on. */
const STEP_FIELDS: InquiryField[][] = [['name', 'email', 'phone'], [], ['message', 'consent']]

/**
 * The inquiry in three steps: who you are → what it is → the message. Each step checks its own
 * fields and shows the error under the field; the last one sends through the server action
 * (honeypot + time check there). Without JS all three steps show as one long form.
 * `onSent` fires once it is through (the paper plane takes off).
 */
export function ContactForm({ onSent, onAgain }: { onSent?: () => void; onAgain?: () => void }) {
  const { home, site, ui, lang } = useContent()
  const { form } = home.contact
  const uid = useId().replace(/:/g, '')
  const [state, action, pending] = useActionState<InquiryState, FormData>(sendInquiry, {
    status: 'idle',
  })
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Inquiry>(emptyInquiry)
  const [errors, setErrors] = useState<InquiryErrors>({})
  const formRef = useRef<HTMLFormElement>(null)
  const openedAt = useRef(0)
  const stepHeading = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    openedAt.current = Date.now()
  }, [])

  useEffect(() => {
    if (state.status === 'sent') onSent?.()
  }, [state, onSent])

  const serverErrors: InquiryErrors = state.status === 'invalid' ? state.errors : {}
  const errorOf = (field: InquiryField) => errors[field] ?? serverErrors[field]

  const set = <K extends keyof Inquiry>(key: K, value: Inquiry[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    if (errors[key as InquiryField]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const check = (fields: InquiryField[]) => {
    const all = validateInquiry(values, lang)
    const found: InquiryErrors = {}
    for (const f of fields) if (all[f]) found[f] = all[f]
    setErrors((e) => ({ ...e, ...Object.fromEntries(fields.map((f) => [f, found[f]])) }))
    const first = fields.find((f) => found[f])
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
    return !first
  }

  const goTo = (next: number) => {
    setStep(next)
    requestAnimationFrame(() => stepHeading.current[next]?.focus())
  }

  if (state.status === 'sent') {
    return (
      <div className={styles.sent} role="status">
        <p className={styles.sentTitle}>{typo(form.sent.title)}</p>
        <SentChat name={values.name} message={values.message} reply={form.sent.chat} no={String(state.no)} />
        <button type="button" className={`${shared.link} ${styles.back}`} onClick={onAgain}>
          {form.sent.again}
          <Arrow className={shared.arrow} />
        </button>
      </div>
    )
  }

  const field = (
    name: 'name' | 'email' | 'company' | 'phone',
    type = 'text',
    autoComplete?: string,
  ) => {
    const err = name === 'company' ? undefined : errorOf(name)
    const f = form.fields[name]
    return (
      <div className={styles.field}>
        <label htmlFor={`${uid}-${name}`} className={styles.fieldLabel}>
          {f.label}
          {(name === 'name' || name === 'email') && <span className={styles.req}> *</span>}
        </label>
        <input
          id={`${uid}-${name}`}
          name={name}
          type={type}
          autoComplete={autoComplete}
          placeholder={f.placeholder}
          value={values[name]}
          aria-invalid={err ? true : undefined}
          aria-describedby={err ? `${uid}-${name}-err` : undefined}
          onChange={(e) => set(name, e.target.value)}
        />
        {err && (
          <p id={`${uid}-${name}-err`} className={styles.error}>
            {err}
          </p>
        )}
      </div>
    )
  }

  // choices as toggle chips: the picked ones turn white
  const choices = (
    name: 'services' | 'budget' | 'deadline',
    label: string,
    options: string[],
    multiple = false,
  ) => (
    <fieldset className={styles.group}>
      <legend className={styles.groupLabel}>
        {label}
        {multiple && <span className={styles.groupHint}> {ui.form.many}</span>}
      </legend>
      <div className={styles.choices}>
        {options.map((option) => {
          const checked = multiple ? values.services.includes(option) : values[name] === option
          return (
            <label key={option} className={styles.choice} data-checked={checked || undefined}>
              <input
                type={multiple ? 'checkbox' : 'radio'}
                name={name}
                value={option}
                checked={checked}
                onChange={() => {
                  if (multiple)
                    set(
                      'services',
                      checked
                        ? values.services.filter((s) => s !== option)
                        : [...values.services, option],
                    )
                  else set(name as 'budget' | 'deadline', checked ? '' : option)
                }}
              />
              <span>{option}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )

  return (
    <form
      ref={formRef}
      className={styles.form}
      action={action}
      noValidate
      onSubmit={(e) => {
        // the first step's fields may have been skipped without JS-side checks: check both
        const all = validateInquiry(values, lang)
        if (Object.keys(all).length > 0) {
          e.preventDefault()
          setErrors(all)
          const back = (STEP_FIELDS[0] ?? []).some((f) => all[f])
          if (back) goTo(0)
          else check(STEP_FIELDS[2] ?? [])
          return
        }
        const data = e.currentTarget
        ;(data.elements.namedItem('t') as HTMLInputElement).value = String(
          Date.now() - openedAt.current,
        )
        ;(data.elements.namedItem('no') as HTMLInputElement).value = String(
          Math.floor(1000 + Math.random() * 9000),
        )
      }}
    >
      <div className={styles.formHead}>
        <p className={styles.formTitle}>{form.title}</p>
        <ol className={styles.steps} aria-label={ui.form.steps}>
          {form.steps.map((label, i) => (
            <li
              key={label}
              data-current={step === i || undefined}
              data-done={step > i || undefined}
              aria-current={step === i ? 'step' : undefined}
            >
              <span className={styles.stepNo}>
                <span className="visually-hidden">{ui.form.step} </span>
                {i + 1}/{form.steps.length}
              </span>{' '}
              <span className={styles.stepName}>{label}</span>
            </li>
          ))}
        </ol>
      </div>

      <fieldset className={styles.step} data-current={step === 0 || undefined}>
        <legend
          className={styles.legend}
          tabIndex={-1}
          ref={(el) => {
            stepHeading.current[0] = el
          }}
        >
          {form.steps[0]}
        </legend>
        <div className={styles.row}>
          {field('name', 'text', 'name')}
          {field('email', 'email', 'email')}
        </div>
        <div className={styles.row}>
          {field('company', 'text', 'organization')}
          {field('phone', 'tel', 'tel')}
        </div>
        <div className={styles.nav}>
          <button
            type="button"
            className={shared.button}
            onClick={() => check(STEP_FIELDS[0] ?? []) && goTo(1)}
          >
            {form.next}
            <Arrow className={shared.arrow} />
          </button>
        </div>
      </fieldset>

      <fieldset className={styles.step} data-current={step === 1 || undefined}>
        <legend
          className={styles.legend}
          tabIndex={-1}
          ref={(el) => {
            stepHeading.current[1] = el
          }}
        >
          {form.steps[1]}
        </legend>
        {choices('services', form.servicesLabel, form.services, true)}
        {choices('budget', form.budgetLabel, form.budgets)}
        {choices('deadline', form.deadlineLabel, form.deadlines)}
        <div className={styles.nav}>
          <button
            type="button"
            className={`${shared.link} ${styles.back}`}
            onClick={() => goTo(0)}
          >
            {form.back}
          </button>
          <button type="button" className={shared.button} onClick={() => goTo(2)}>
            {form.next}
            <Arrow className={shared.arrow} />
          </button>
        </div>
      </fieldset>

      <fieldset className={styles.step} data-current={step === 2 || undefined}>
        <legend
          className={styles.legend}
          tabIndex={-1}
          ref={(el) => {
            stepHeading.current[2] = el
          }}
        >
          {form.steps[2]}
        </legend>
        <div className={styles.field}>
          <label htmlFor={`${uid}-message`} className={styles.fieldLabel}>
            {form.fields.message.label}
            <span className={styles.req}> *</span>
          </label>
          <textarea
            id={`${uid}-message`}
            name="message"
            rows={6}
            placeholder={form.fields.message.placeholder}
            value={values.message}
            aria-invalid={errorOf('message') ? true : undefined}
            aria-describedby={`${uid}-message-hint${errorOf('message') ? ` ${uid}-message-err` : ''}`}
            onChange={(e) => set('message', e.target.value)}
          />
          <p id={`${uid}-message-hint`} className={styles.help}>
            {typo(form.messageHint)}
          </p>
          {errorOf('message') && (
            <p id={`${uid}-message-err`} className={styles.error}>
              {errorOf('message')}
            </p>
          )}
        </div>
        <div className={styles.field}>
          <label className={styles.consent}>
            <input
              type="checkbox"
              name="consent"
              checked={values.consent}
              aria-invalid={errorOf('consent') ? true : undefined}
              aria-describedby={errorOf('consent') ? `${uid}-consent-err` : undefined}
              onChange={(e) => set('consent', e.target.checked)}
            />
            <span>
              {form.consent} (<Link href="/ochrana-osobnich-udaju">{form.consentLink}</Link>)
            </span>
          </label>
          {errorOf('consent') && (
            <p id={`${uid}-consent-err`} className={styles.error}>
              {errorOf('consent')}
            </p>
          )}
        </div>

        {/* bots fill everything; people never see this */}
        <div className={styles.trap} aria-hidden="true">
          <label>
            Web <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="t" defaultValue="0" />
        <input type="hidden" name="no" defaultValue="0" />

        {state.status === 'failed' && (
          <p className={styles.error} role="alert">
            {form.failed} <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
          </p>
        )}

        <div className={styles.nav}>
          <button
            type="button"
            className={`${shared.link} ${styles.back}`}
            onClick={() => goTo(1)}
          >
            {form.back}
          </button>
          <button
            type="submit"
            className={shared.button}
            disabled={pending}
            aria-busy={pending || undefined}
          >
            {pending ? form.pending : form.submit}
            {!pending && <Arrow className={shared.arrow} />}
          </button>
        </div>
      </fieldset>
    </form>
  )
}
