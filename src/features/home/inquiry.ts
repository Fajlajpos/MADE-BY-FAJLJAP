import { home } from '@/content/home'

/**
 * The inquiry printed on the receipt: one shape, one validator, shared by the form (on blur and
 * before submit) and the server action (always).
 */

const { form } = home.contact

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
export function validateInquiry(v: Inquiry): InquiryErrors {
  const errors: InquiryErrors = {}
  if (!v.name.trim()) errors.name = form.errors.name
  if (!v.email.trim()) errors.email = form.errors.email
  else if (!EMAIL.test(v.email.trim())) errors.email = form.errors.emailFormat
  if (v.phone.trim() && !PHONE.test(v.phone.trim())) errors.phone = form.errors.phone
  if (v.message.trim().length < 10) errors.message = form.errors.message
  if (!v.consent) errors.consent = form.errors.consent
  return errors
}

/** Reads FormData into an Inquiry, trimming lengths and dropping options that are not offered. */
export function readInquiry(data: FormData): Inquiry {
  const text = (key: string, max: number) => String(data.get(key) ?? '').slice(0, max)
  const pick = (key: string, options: readonly string[]) => {
    const value = text(key, 80)
    return options.includes(value) ? value : ''
  }
  return {
    name: text('name', 120),
    email: text('email', 200),
    company: text('company', 160),
    phone: text('phone', 30),
    services: data
      .getAll('services')
      .map(String)
      .filter((s) => form.services.includes(s)),
    budget: pick('budget', form.budgets),
    deadline: pick('deadline', form.deadlines),
    message: text('message', 5000),
    consent: data.get('consent') === 'on',
  }
}
