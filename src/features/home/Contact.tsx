import type { CSSProperties } from 'react'
import { Arrow } from '@/components/ui/Arrow'
import { content } from '@/content/server'
import { Words } from '@/components/fx/Words'
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
  return (
    <section id="kontakt" className={`${shared.section} ${styles.section}`} aria-labelledby="kontakt-title">
      <p className={shared.label} data-reveal="">
        <b>{contact.index}</b> {contact.label}
      </p>

      <h2 id="kontakt-title" className={`${shared.h2} ${styles.title}`} data-reveal="" style={{ '--reveal-i': 1 } as CSSProperties}>
        <Words text={contact.heading} />
      </h2>

      <div className={styles.layout}>
        <div className={styles.copy}>
          <p className={styles.body} data-reveal="" style={{ '--reveal-i': 1 } as CSSProperties}>
            {/* the first sentence in chrome, the rest quieter */}
            <span className={styles.bodyLead}>{typo(contact.body.slice(0, contact.body.indexOf('. ') + 1))}</span>{' '}
            {typo(contact.body.slice(contact.body.indexOf('. ') + 2))}
          </p>

          {/* the ways to me, as rows on one matte glass panel */}
          <div className={styles.channels} data-reveal="" style={{ '--reveal-i': 2 } as CSSProperties}>
            <p className={styles.panelLabel}>{contact.channelsLabel}</p>
            <div className={styles.channel}>
              <span className={styles.chIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="5" width="18" height="14" rx="3" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </span>
              <span className={styles.chText}>
                <span className={styles.chName}>
                  {contact.channels.mail} <small>· {typo(contact.channels.mailNote)}</small>
                </span>
                <a className={styles.mail} href={`mailto:${site.contact.email}`}>
                  {site.contact.email}
                </a>
              </span>
              <CopyEmail email={site.contact.email} label={contact.copyLabel} copied={contact.copied} />
            </div>
            <a className={styles.channel} href="https://ig.me/m/fajlajpos" target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element -- a 240 px avatar */}
              <img className={styles.igAvatar} src="/photos/profilovka.webp" alt="" width={40} height={40} />
              <span className={styles.chText}>
                <span className={styles.chName}>
                  {contact.channels.ig} <small>· {typo(contact.channels.igNote)}</small>
                </span>
                <span className={styles.chValue}>@fajlajpos</span>
              </span>
              <Arrow className={styles.chArrow} />
              <span className="visually-hidden">
                {' – '}
                {ui.contact.igSr} {ui.newWindow}
              </span>
            </a>
          </div>

          {/* what to put in the message */}
          <div className={styles.tips} data-reveal="" style={{ '--reveal-i': 3 } as CSSProperties}>
            <p className={styles.panelLabel}>{contact.tipsLabel}</p>
            <ol className={styles.tipList} role="list">
              {contact.tips.map((t, i) => (
                <li key={i}>
                  <span className={styles.tipNo} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {typo(t)}
                </li>
              ))}
            </ol>
          </div>
        </div>
        <ContactStage />
      </div>
    </section>
  )
}
