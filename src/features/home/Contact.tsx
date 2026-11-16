import type { CSSProperties } from 'react'
import { home } from '@/content/home'
import { site } from '@/content/site'
import { typo } from '@/lib/typo/czech'
import { ContactStage } from './ContactStage'
import { CopyEmail } from './CopyEmail'
import shared from './home.module.css'
import styles from './Contact.module.css'

/**
 * Kontakt — „Napiš mi“ across the page, then the address to copy on the left and the inquiry
 * form on the right. The chrome paper plane takes off once it is sent.
 */
export function Contact() {
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
            <p className={styles.mailLabel}>Nebo rovnou na e-mail</p>
            <a className={styles.mail} href={`mailto:${site.contact.email}`}>
              {site.contact.email}
            </a>
            <CopyEmail email={site.contact.email} label={contact.copyLabel} copied={contact.copied} />
          </div>
          <div className={styles.igBlock} data-reveal="" style={{ '--reveal-i': 2 } as CSSProperties}>
            <p className={styles.mailLabel}>Nebo mi napiš na Instagram</p>
            <a
              className={styles.igButton}
              href="https://ig.me/m/fajlajpos"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4.2" />
                <circle cx="17.4" cy="6.6" r="1" className={styles.igDot} />
              </svg>
              @fajlajpos
              <span className="visually-hidden"> – napsat zprávu na Instagramu (otevře se v novém okně)</span>
            </a>
          </div>
        </div>
        <ContactStage />
      </div>
    </section>
  )
}
