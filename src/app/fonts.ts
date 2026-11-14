import { Instrument_Sans } from 'next/font/google'

// One family for everything: Instrument Sans. Quiet, precise, a little narrow when it is set
// large (the wdth axis), so the chrome and the work carry the page, not the type.
export const instrument = Instrument_Sans({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  display: 'swap',
  variable: '--font-instrument',
})

/** All font variables, for the className on <html>. */
export const fontVariables = instrument.variable
