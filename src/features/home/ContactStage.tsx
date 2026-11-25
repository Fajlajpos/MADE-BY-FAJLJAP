'use client'

import { useCallback, useRef, useState } from 'react'
import { ContactForm } from './ContactForm'
import { ChatInquiry } from './ChatInquiry'
import styles from './Contact.module.css'

/** The form on a raised panel; over its corner the chrome paper plane that takes off once it is sent. */
export function ContactStage() {
  const launch = useRef(0)
  const [round, setRound] = useState(0)
  const onSent = useCallback(() => {
    launch.current = 1
  }, [])
  const onAgain = useCallback(() => {
    launch.current = 0
    setRound((r) => r + 1)
  }, [])
  return (
    <div className={styles.stage}>
      {/* the form as a DM on a phone: the screen (chat header, my first message, the form) under the frame */}
      {/* on a phone: the inquiry is the DM itself */}
      <div className={styles.mobileChat}>
        <ChatInquiry />
      </div>
      <div className={styles.phone} data-phone="">
        <div className={styles.screen}>
          <div className={styles.chatHead} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- small avatar */}
            <img src="/photos/profilovka.webp" alt="" width={36} height={36} />
            <span>
              <b>fajlajpos</b>
              <small>aktivní teď</small>
            </span>
          </div>
          <div className={styles.chatBody} data-lenis-prevent="">
            <p className={styles.bubble}>Čau 👋 napiš mi, co potřebuješ. Odpovím do dvou dnů.</p>
            <div className={styles.card}>
              <ContactForm key={round} onSent={onSent} onAgain={onAgain} />
            </div>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- the phone's frame over the screen */}
        <img className={styles.phoneFrame} src="/brand/phone-frame.webp" alt="" aria-hidden="true" width={388} height={800} />
      </div>
    </div>
  )
}
