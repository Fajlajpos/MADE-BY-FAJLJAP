'use client'

import { useEffect, useState } from 'react'

const format = new Intl.DateTimeFormat('cs-CZ', { hour: '2-digit', minute: '2-digit', hour12: false })

/** The visitor's local time, HH:MM. Renders a stable "--:--" on the server, so hydration matches. */
export function Clock({ className }: { className?: string }) {
  const [now, setNow] = useState<string | null>(null)
  useEffect(() => {
    const tick = () => setNow(format.format(new Date()))
    const first = window.setTimeout(tick, 0)
    const id = window.setInterval(tick, 15_000)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(id)
    }
  }, [])
  return (
    <time className={className} suppressHydrationWarning>
      {now ?? '--:--'}
    </time>
  )
}
