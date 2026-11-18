import type { CSSProperties } from 'react'
import { content } from '@/content/server'
import { typo } from '@/lib/typo/czech'
import { ContactStage } from './ContactStage'
import { CopyEmail } from './CopyEmail'
import shared from './home.module.css'
import styles from './Contact.module.css'

/**
 * Kontakt — „Napiš mi“ across the page, then the address to copy on the left and the inquiry
 * form on the right. The chrome paper plane takes off once it is sent.
 */
export async function Contact() {
  const { home, site, ui } = await content()
  const { contact } = home
  const heading = typo(contact.heading)
  const ends = /[.!?…]$/.test(heading)
  return (
    <section id="kontakt" className={`${shared.section} ${styles.section}`} aria-labelledby="kontakt-title">
      <p className={shared.label} data-reveal="">
        <b>{contact.index}</b> {contact.label}
      </p>

      <h2 id="kontakt-title" className={styles.heading} data-reveal="">
        {heading}
        {!ends && (
          <span className={styles.dot} aria-hidden="true">
            .
          </span>
        )}
      </h2>

      <div className={styles.layout}>
        <div className={styles.copy}>
          <p className={styles.body} data-reveal="">
            {typo(contact.body)}
          </p>
          <div className={styles.mailBlock} data-reveal="" style={{ '--reveal-i': 1 } as CSSProperties}>
            <p className={styles.mailLabel}>{ui.contact.mailLabel}</p>
            <a className={styles.mail} href={`mailto:${site.contact.email}`}>
              {site.contact.email}
            </a>
            <CopyEmail email={site.contact.email} label={contact.copyLabel} copied={contact.copied} />
          </div>
          <div className={styles.igBlock} data-reveal="" style={{ '--reveal-i': 2 } as CSSProperties}>
            <p className={styles.mailLabel}>{ui.contact.igLabel}</p>
            <a
              className={styles.igButton}
              href="https://ig.me/m/fajlajpos"
              target="_blank"
              rel="noopener noreferrer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- a 240 px avatar */}
              <img className={styles.igAvatar} src="/photos/profilovka.webp" alt="" width={32} height={32} />
              @fajlajpos
              <span className="visually-hidden"> – {ui.contact.igSr} {ui.newWindow}</span>
            </a>
          </div>
        </div>
        <ContactStage />
      </div>
    </section>
  )
}
