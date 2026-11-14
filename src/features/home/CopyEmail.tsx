'use client'

import { useState } from 'react'
import styles from './Contact.module.css'

/** Copies the address; the button says so and a live region announces it. */
export function CopyEmail({
  email,
  label,
  copied,
}: {
  email: string
  label: string
  copied: string
}) {
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle')

  return (
    <>
      <button
        type="button"
        className={styles.copyButton}
        data-state={state}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(email)
            setState('done')
          } catch {
            setState('failed')
          }
          window.setTimeout(() => setState('idle'), 2400)
        }}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          {state === 'done' ? (
            <path
              d="M5 12.5l4.2 4.2L19 7"
              stroke="currentColor"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <>
              <rect
                x="8"
                y="8"
                width="12"
                height="12"
                rx="2.5"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </>
          )}
        </svg>
        {state === 'done' ? copied : state === 'failed' ? 'Nejde to, zkopíruj ručně' : label}
      </button>
      <span className="visually-hidden" role="status">
        {state === 'done' ? `${copied}: ${email}` : ''}
      </span>
    </>
  )
}
