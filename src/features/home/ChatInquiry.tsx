'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useContent } from '@/content/client'
import { PICK_SERVICE } from './PriceNote'
import { sendInquiry } from './sendInquiry'
import styles from './ChatInquiry.module.css'

type Step = 'services' | 'budget' | 'deadline' | 'message' | 'details' | 'done'
type Msg = { from: 'me' | 'you'; text: string }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** How long the chat was open (spam check) and the inquiry's number. */
function stamp(data: FormData, openedAt: number) {
  data.set('t', String(Date.now() - openedAt))
  data.set('no', String(Math.floor(1000 + Math.random() * 9000)))
}

/**
 * The inquiry on a phone, as an Instagram DM. I write, the customer mostly just taps: service,
 * budget and deadline are highlighted buttons under my message; then one sentence about what they
 * do, typed in the bar at the bottom; then a normal little form for name and e-mail. Sent through
 * the same server action as the desktop form.
 */
export function ChatInquiry() {
  const { home, lang } = useContent()
  const f = home.contact.form
  const cz = lang === 'cs'
  const ask: Record<Exclude<Step, 'done'>, string> = {
    services: cz ? 'Čau 👋 s čím ti můžu pomoct? Klikni na jedno:' : 'Hey 👋 what can I help you with? Tap one:',
    budget: cz ? 'Super! Kolik do toho chceš zhruba dát?' : 'Great! Roughly what budget do you have?',
    deadline: cz ? 'A kdy by to mělo být hotové?' : 'And when should it be done?',
    message: cz ? 'Napiš mi pár vět, co děláš a co si představuješ 🙂' : 'Write me a few sentences about what you do and what you have in mind 🙂',
    details: cz ? 'Paráda, díky! Už jen kam ti mám odpovědět:' : 'Perfect, thanks! Just tell me where to reply:',
  }

  const [step, setStep] = useState<Step>('services')
  const [msgs, setMsgs] = useState<Msg[]>([{ from: 'me', text: ask.services }])
  const [typing, setTyping] = useState(false)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [values, setValues] = useState({ services: [] as string[], budget: '', deadline: '', message: '' })
  const [sending, startSending] = useTransition()
  const openedAt = useRef(0)
  const log = useRef<HTMLDivElement>(null)

  useEffect(() => {
    openedAt.current = Date.now()
  }, [])

  // a crumpled banknote picks its service up front
  useEffect(() => {
    const onPick = (e: Event) => {
      const label = f.services[(e as CustomEvent<number>).detail]
      if (label) setValues((v) => ({ ...v, services: [label] }))
    }
    window.addEventListener(PICK_SERVICE, onPick)
    return () => window.removeEventListener(PICK_SERVICE, onPick)
  }, [f.services])

  // keep the newest message in view: the chat scrolls inside itself, not the page
  useEffect(() => {
    const el = log.current
    if (el && msgs.length > 1) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [msgs, typing, step])

  // the answer goes out, I "type" for a moment, then the next question
  const next = (answer: string, to: Exclude<Step, 'done'>) => {
    setError('')
    setText('')
    setMsgs((m) => [...m, { from: 'you', text: answer }])
    setStep('done')
    setTyping(true)
    window.setTimeout(() => {
      setTyping(false)
      setMsgs((m) => [...m, { from: 'me', text: ask[to] }])
      setStep(to)
    }, 700)
  }

  const pick = (o: string) => {
    if (step === 'services') {
      setValues((v) => ({ ...v, services: [o] }))
      next(o, 'budget')
    } else if (step === 'budget') {
      setValues((v) => ({ ...v, budget: o }))
      next(o, 'deadline')
    } else if (step === 'deadline') {
      setValues((v) => ({ ...v, deadline: o }))
      next(o, 'message')
    }
  }

  const sendMessage = () => {
    const v = text.trim()
    if (v.length < 10) return setError(f.errors.message)
    setValues((s) => ({ ...s, message: v }))
    next(v, 'details')
  }

  const sendDetails = (form: HTMLFormElement) => {
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const errs: Record<string, string> = {}
    if (!name) errs.name = f.errors.name
    if (!EMAIL.test(email)) errs.email = email ? f.errors.emailFormat : f.errors.email
    if (!data.get('consent')) errs.consent = f.errors.consent
    setFieldErrors(errs)
    if (Object.keys(errs).length) return
    values.services.forEach((s) => data.append('services', s))
    data.set('budget', values.budget)
    data.set('deadline', values.deadline)
    data.set('message', values.message)
    data.set('lang', lang)
    stamp(data, openedAt.current)
    setMsgs((m) => [...m, { from: 'you', text: `${name} · ${email}` }])
    setStep('done')
    startSending(async () => {
      const res = await sendInquiry({ status: 'idle' }, data)
      const first = name.split(' ')[0] ?? ''
      setMsgs((m) => [
        ...m,
        ...(res.status === 'sent'
          ? f.sent.chat.map((t) => ({ from: 'me' as const, text: t.replace('{name}', first) }))
          : [{ from: 'me' as const, text: f.failed }]),
      ])
    })
  }

  const lists: Partial<Record<Step, string[]>> = { services: f.services, budget: f.budgets, deadline: f.deadlines }
  const list = lists[step]
  const lastYou = msgs.findLastIndex((m) => m.from === 'you')

  return (
    <div className={styles.chat} data-phone="">
      <div className={styles.head}>
        <span className={styles.avatar}>
          {/* eslint-disable-next-line @next/next/no-img-element -- small avatar */}
          <img src="/photos/profilovka.webp" alt="" width={40} height={40} />
        </span>
        <span className={styles.who}>
          <b>fajlajpos</b>
          <small>{cz ? 'Aktivní teď' : 'Active now'}</small>
        </span>
      </div>

      <div className={styles.log} ref={log} aria-live="polite" data-lenis-prevent="">
        <div className={styles.intro}>
          {/* eslint-disable-next-line @next/next/no-img-element -- profile photo */}
          <img src="/photos/profilovka.webp" alt="" width={88} height={88} />
          <b>FAJLAJP</b>
          <small>fajlajpos · {cz ? 'weby, e-shopy, aplikace' : 'websites, e-shops, apps'}</small>
        </div>
        <p className={styles.day}>{cz ? 'Dnes' : 'Today'}</p>

        {msgs.map((m, i) => {
          const tail = msgs[i + 1]?.from !== m.from
          return (
            <div key={i} className={styles.row} data-from={m.from}>
              {m.from === 'me' && <span className={styles.mini} data-show={tail || undefined} aria-hidden="true" />}
              <p className={styles.msg} data-tail={tail || undefined}>
                {m.text}
              </p>
              {i === lastYou && i === msgs.length - 1 && !typing && <small className={styles.seen}>{cz ? 'Zobrazeno' : 'Seen'}</small>}
            </div>
          )
        })}

        {list && (
          <div className={styles.options} role="group" aria-label={ask[step as Exclude<Step, 'done'>]}>
            {list.map((o) => (
              <button key={o} type="button" className={styles.option} data-picked={values.services.includes(o) || undefined} onClick={() => pick(o)}>
                {o}
              </button>
            ))}
          </div>
        )}

        {step === 'details' && (
          <form
            className={styles.card}
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              sendDetails(e.currentTarget)
            }}
          >
            <div className={styles.field}>
              <label htmlFor="chat-name">{f.fields.name.label}</label>
              <input id="chat-name" name="name" autoComplete="name" placeholder={f.fields.name.placeholder} aria-invalid={!!fieldErrors.name} />
              {fieldErrors.name && <small className={styles.error}>{fieldErrors.name}</small>}
            </div>
            <div className={styles.field}>
              <label htmlFor="chat-email">{f.fields.email.label}</label>
              <input id="chat-email" name="email" type="email" autoComplete="email" inputMode="email" placeholder={f.fields.email.placeholder} aria-invalid={!!fieldErrors.email} />
              {fieldErrors.email && <small className={styles.error}>{fieldErrors.email}</small>}
            </div>
            <div className={styles.field}>
              <label htmlFor="chat-phone">
                {f.fields.phone.label} <span>({f.fields.phone.placeholder})</span>
              </label>
              <input id="chat-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" />
            </div>
            <label className={styles.consent}>
              <input type="checkbox" name="consent" />
              <span>
                {f.consent} (<Link href="/ochrana-osobnich-udaju">{f.consentLink}</Link>)
              </span>
            </label>
            {fieldErrors.consent && <small className={styles.error}>{fieldErrors.consent}</small>}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className={styles.trap} aria-hidden="true" />
            <button type="submit" className={styles.submit}>
              {f.submit}
            </button>
          </form>
        )}

        {(typing || sending) && (
          <div className={styles.row} data-from="me">
            <span className={styles.mini} data-show="" aria-hidden="true" />
            <p className={styles.msg} data-tail="" aria-label={cz ? 'píše…' : 'typing…'}>
              <span className={styles.dots}>
                <i />
                <i />
                <i />
              </span>
            </p>
          </div>
        )}
      </div>

      {step === 'message' && (
        <form
          className={styles.reply}
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
        >
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.input}>
            <label className="visually-hidden" htmlFor="chat-answer">
              {ask.message}
            </label>
            <textarea
              id="chat-answer"
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={cz ? 'Napiš zprávu…' : 'Message…'}
            />
            <button type="submit" className={styles.sendBtn} aria-label={cz ? 'Odeslat' : 'Send'} disabled={!text.trim()}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2z" />
              </svg>
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
