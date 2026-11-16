'use client'

import { useEffect } from 'react'

/**
 * For whoever opens the browser's developer tools: the logo in chrome-grey letters and a line
 * from me. Once per page load.
 */
export function ConsoleHello() {
  useEffect(() => {
    const w = window as Window & { __fajlajpHello?: boolean }
    if (w.__fajlajpHello) return
    w.__fajlajpHello = true
    const logo = [
      '███████  █████       ██ ██       █████       ██ ██████ ',
      '██      ██   ██      ██ ██      ██   ██      ██ ██   ██',
      '█████   ███████      ██ ██      ███████      ██ ██████ ',
      '██      ██   ██ ██   ██ ██      ██   ██ ██   ██ ██     ',
      '██      ██   ██  █████  ███████ ██   ██  █████  ██     ',
    ].join('\n')
    console.log(
      `%c${logo}`,
      'font-family: monospace; font-size: 10px; line-height: 1.1; color: #c9ccd3; text-shadow: 0 1px 0 #fff, 0 -1px 0 #3a3c43;',
    )
    console.log(
      '%cHledáš, jak je to udělané? %cNapiš mi → filipmayer7@gmail.com · instagram.com/fajlajpos',
      'font: 600 13px system-ui, sans-serif; color: #f4f4f2;',
      'font: 13px system-ui, sans-serif; color: #ff6a2b;',
    )
  }, [])
  return null
}
