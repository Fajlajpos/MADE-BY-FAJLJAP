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
        <span aria-hidden="true">{state === 'done' ? '[ok]' : '[cp]'}</span>
        {state === 'done' ? copied : state === 'failed' ? 'Nejde to, zkopíruj ručně' : label}
      </button>
      <span className="visually-hidden" role="status">
        {state === 'done' ? `${copied}: ${email}` : ''}
      </span>
    </>
  )
}
