'use server'

import { readInquiry, validateInquiry, type InquiryState } from './inquiry'

/** Faster than this from opening the page to submit is a bot, not a person typing. */
const MIN_FILL_MS = 3000

export async function sendInquiry(_prev: InquiryState, data: FormData): Promise<InquiryState> {
  const no = String(data.get('no') ?? '')
    .replace(/\D/g, '')
    .slice(0, 6)
    .padStart(6, '0')

  // Honeypot filled or the form flown through: look sent, keep nothing.
  // `t` is the time the page was open before submit, measured in the browser (clock skew-proof).
  const elapsed = Number(data.get('t'))
  if (data.get('website') || (elapsed > 0 && elapsed < MIN_FILL_MS)) {
    return { status: 'sent', no }
  }

  const inquiry = readInquiry(data)
  const errors = validateInquiry(inquiry)
  if (Object.keys(errors).length > 0) return { status: 'invalid', errors }

  try {
    // TODO (fáze 2): uložit do DB (Inquiry) a poslat oba e-maily přes frontu.
    // Do té doby poptávka skončí jen v logu serveru.
    console.info('[poptavka]', no, JSON.stringify(inquiry))
    return { status: 'sent', no }
  } catch {
    return { status: 'failed' }
  }
}
