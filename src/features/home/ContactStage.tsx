'use client'

import { useCallback, useRef, useState } from 'react'
import { Slot3D } from '@/three/site/Slot3D'
import { ContactForm } from './ContactForm'
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
      <Slot3D object="plane" className={styles.plane} scale={1.4} launch={launch} />
      <div className={styles.card}>
        <ContactForm key={round} onSent={onSent} onAgain={onAgain} />
      </div>
    </div>
  )
}
