import { home } from '@/content/home'
import { home as homeEn } from '@/content/en/home'
import type { Lang } from '@/content'

/**
 * The inquiry printed on the receipt: one shape, one validator, shared by the form (on blur and
 * before submit) and the server action (always).
 */

const { form } = home.contact
const forms = { cs: form, en: homeEn.contact.form }

/**
 * An option as the Czech label, whichever language the form was in: the lists have the same
 * order in both, so a choice is matched by its position. Anything not offered is dropped.
 */
function toCzech(value: string, list: 'services' | 'budgets' | 'deadlines'): string {
  for (const f of Object.values(forms)) {
    const i = (f[list] as string[]).indexOf(value)
    if (i >= 0) return form[list][i] ?? ''
  }
  return ''
}

export type Inquiry = {
  name: string
  email: string
  company: string
  phone: string
  services: string[]
  budget: string
  deadline: string
  message: string
  consent: boolean
}

export type InquiryField = 'name' | 'email' | 'phone' | 'message' | 'consent'
export type InquiryErrors = Partial<Record<InquiryField, string>>

export type InquiryState =
  | { status: 'idle' }
  | { status: 'invalid'; errors: InquiryErrors }
  | { status: 'sent'; no: string }
  | { status: 'failed' }

export const emptyInquiry: Inquiry = {
  name: '',
  email: '',
  company: '',
  phone: '',
  services: [],
  budget: '',
  deadline: '',
  message: '',
  consent: false,
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE = /^\+?[\d\s()-]{6,20}$/

/** Errors for the fields that are wrong; an empty object means it can be sent. */
export function validateInquiry(v: Inquiry, lang: Lang = 'cs'): InquiryErrors {
  const { errors: e } = forms[lang]
  const errors: InquiryErrors = {}
  if (!v.name.trim()) errors.name = e.name
  if (!v.email.trim()) errors.email = e.email
  else if (!EMAIL.test(v.email.trim())) errors.email = e.emailFormat
  if (v.phone.trim() && !PHONE.test(v.phone.trim())) errors.phone = e.phone
  if (v.message.trim().length < 10) errors.message = e.message
  if (!v.consent) errors.consent = e.consent
  return errors
}

/**
 * Reads FormData into an Inquiry, trimming lengths and keeping only offered options (stored as
 * their Czech labels, so every inquiry reads the same whichever language it came in).
 */
export function readInquiry(data: FormData): Inquiry {
  const text = (key: string, max: number) => String(data.get(key) ?? '').slice(0, max)
  return {
    name: text('name', 120),
    email: text('email', 200),
    company: text('company', 160),
    phone: text('phone', 30),
    services: data
      .getAll('services')
      .map(String)
      .map((s) => toCzech(s, 'services'))
      .filter(Boolean),
    budget: toCzech(text('budget', 80), 'budgets'),
    deadline: toCzech(text('deadline', 80), 'deadlines'),
    message: text('message', 5000),
    consent: data.get('consent') === 'on',
  }
}
