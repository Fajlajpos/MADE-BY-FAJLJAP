import Link from 'next/link'
import { Glyphs } from '@/components/ascii/Glyphs'
import { Scramble } from '@/components/ascii/Scramble'
import { home } from '@/content/home'
import { site } from '@/content/site'
import { typo } from '@/lib/typo/czech'
import { CopyEmail } from './CopyEmail'
import shared from './home.module.css'
import styles from './Contact.module.css'

/** The close: „Napiš mi." drawn huge in characters, the address, and tonight's log. */
export function Contact() {
  const { contact } = home
  return (
    <section
      id="kontakt"
      data-ground="ripple"
      className={`${shared.section} ${styles.contact}`}
      aria-labelledby="kontakt-title"
    >
      <p className={shared.label}>
        <span>{contact.index}</span>
        <b>{contact.label}</b>
      </p>

      <div className={`${shared.veil} ${styles.copy}`} data-clear="">
        <Glyphs as="h2" id="kontakt-title" className={styles.heading} cellSize={8} duration={1100}>
          {contact.heading}
        </Glyphs>
        <p className={shared.lead}>{typo(contact.body)}</p>
        <a className={styles.mail} href={`mailto:${site.contact.email}`}>
          <Scramble text={site.contact.email} />
        </a>
        <div className={styles.actions}>
          <CopyEmail email={site.contact.email} label={contact.copyLabel} copied={contact.copied} />
          <Link className={`${shared.button} ${shared.ghost}`} href="/kontakt">
            {contact.formLabel}
            <span className={shared.arrow} aria-hidden="true">
              -&gt;
            </span>
          </Link>
        </div>
      </div>

      <ol className={`meta ${styles.now}`} role="list" aria-label="Na čem teď dělám">
        {contact.now.map((item) => (
          <li key={item.time}>
            <span className={styles.time}>[{item.time}]</span>
            {typo(item.text)}
          </li>
        ))}
      </ol>
    </section>
  )
}
