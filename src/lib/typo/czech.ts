/**
 * Czech typography at render time (public site, e-mails, admin content).
 * - non-breaking space after one-letter prepositions/conjunctions (v k s z o u a i)
 * - non-breaking space between a number and its unit / % / Kč, and in thousands (25 000)
 * - "..." → …, " - " → " – "
 */
const NBSP = ' '

export function typo(input: string): string {
  return (
    input
      .replace(/\.\.\./g, '…')
      .replace(/ - /g, ` – `)
      // one-letter words (run twice so "a v" chains both get bound)
      .replace(/(^|[\s(„])([vkszouaiVKSZOUAI]) /g, `$1$2${NBSP}`)
      .replace(/(^|[\s(„])([vkszouaiVKSZOUAI]) /g, `$1$2${NBSP}`)
      // thousands separator and number + unit
      .replace(/(\d) (?=\d{3}\b)/g, `$1${NBSP}`)
      .replace(/(\d) (?=(?:%|Kč|€|px|ks|h|min|dní|let|lidí)(?![\p{L}\d]))/gu, `$1${NBSP}`)
      // en dash between numbers in ranges keeps them together
      .replace(/(\d) – (\d)/g, `$1${NBSP}–${NBSP}$2`)
  )
}
