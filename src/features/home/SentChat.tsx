'use client'

import { useEffect, useState } from 'react'
import { typo } from '@/lib/typo/czech'
import styles from './Contact.module.css'

/**
 * After the form is sent: a little DM thread, like Instagram. The visitor's message on the
 * right (the start of what they wrote), then me „typing…“, then my reply on the left, with my
 * name and a „seen“ under it. Reduced motion: everything at once.
 */
export function SentChat({ name, message, reply, no }: { name: string; message: string; reply: string[]; no: string }) {
  // 0: only their message · 1: me typing · 2+: my lines, one by one
  // with reduced motion, everything is there from the start (this mounts only after a send, on
  // the client, so reading the setting here is safe)
  const [stage, setStage] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 2 + reply.length : 0,
  )

  useEffect(() => {
    if (stage > 0) return
    const times = [700, 2100, ...reply.map((_, i) => 2100 + (i + 1) * 1100)]
    const ids = times.map((t, i) => window.setTimeout(() => setStage(i + 1), t))
    return () => ids.forEach((id) => window.clearTimeout(id))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once, on mount
  }, [])

  const first = name.trim().split(/\s+/)[0] ?? ''
  const excerpt = message.trim().length > 90 ? `${message.trim().slice(0, 88).trimEnd()}…` : message.trim()
  const shown = Math.max(0, stage - 1)

  return (
    <div className={styles.chat}>
      <div className={styles.chatHead}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a 240 px avatar */}
        <img className={styles.chatAvatar} src="/photos/profilovka.webp" alt="" width={36} height={36} />
        <span>
          <b>fajlajpos</b>
          <small>poptávka č. {no}</small>
        </span>
      </div>

      <ol className={styles.chatThread} role="log" aria-live="polite">
        {excerpt && (
          <li className={styles.msgMe} data-in="">
            {typo(excerpt)}
          </li>
        )}
        {stage === 1 && (
          <li className={styles.typing} aria-label="píše…">
            <i />
            <i />
            <i />
          </li>
        )}
        {reply.slice(0, stage >= 2 ? shown : 0).map((line, i) => (
          <li key={i} className={styles.msgThem} data-in="">
            {typo(i === 0 && first ? line.replace('{name}', first) : line.replace(' {name}', '').replace('{name}', ''))}
          </li>
        ))}
      </ol>
      {stage >= 1 + reply.length && <p className={styles.seen}>Zobrazeno</p>}
    </div>
  )
}
