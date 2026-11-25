import type { CSSProperties } from 'react'
import { Arrow } from '@/components/ui/Arrow'
import { content } from '@/content/server'
import { typo } from '@/lib/typo/czech'
import { FaqList } from './FaqList'
import { PriceNote } from './PriceNote'
import { ChromeTitle } from './ArchTitle'
import shared from './home.module.css'
import styles from './Pricing.module.css'

/** "od 25 000 Kč" → a small "od", the amount set large, the currency small. */
function Price({ value }: { value: string }) {
  const m = /^(od|do|cca|from|up to|about)\s+(.+?)(\s+Kč)?$/i.exec(value.trim())
  if (!m) return <>{typo(value)}</>
  return (
    <>
      <span className={styles.from}>{m[1]}</span> <span className={styles.amount}>{typo(m[2] ?? '')}</span>
      {m[3] && <span className={styles.currency}> Kč</span>}
    </>
  )
}

/**
 * Kolik to stojí — heading and lead beside the chrome price tag, the price list as ruled rows
 * (job left, price large right), the small print, then the common questions as a plain list you
 * open one question at a time (FaqList).
 */
/**
 * Your banknotes, in the order of the price list (Web, E-shop, Redesign, Úpravy): the id of the
 * frames in /public/prices/<id>-1…5.webp. Empty: a dashed slot until the note exists.
 */
const NOTES = ['web', 'eshop', '', '']

/** The inquiry form's option each note picks (index into contact.form.services: Web, E-shop, Redesign webu, Úprava webu). */
const SERVICE_OF = [0, 1, 2, 3]

/** Your photo or texture under the notes (e.g. '/photos/desk.webp'). Empty: the plain page. */
const DESK_ART = ''

export async function Pricing() {
  const { home, ui } = await content()
  const { pricing } = home
  return (
    <section id="cenik" className={shared.section} aria-labelledby="cenik-title">
      <p className={shared.label} data-reveal="">
        <b>{pricing.index}</b> {pricing.label}
      </p>

      <div className={styles.top}>
        <div className={styles.intro}>
          <h2 id="cenik-title" className="visually-hidden">
            {pricing.heading}
          </h2>
          {/* the liquid chrome PRICES title (public/brand/prices-v3.webp), lit by the cursor like the hero's */}
          <div className={styles.titleArt} aria-hidden="true">
            <ChromeTitle src="/brand/prices-v3.webp" width={2000} height={528} />
          </div>
          <p className={shared.lead} data-reveal="" style={{ '--reveal-i': 1 } as CSSProperties}>
            {typo(pricing.lead)}
          </p>
        </div>
      </div>

      {/* the desk the notes lie on: your own photo/texture goes in DESK_ART (empty: plain page) */}
      <div className={styles.desk} style={DESK_ART ? ({ '--desk-art': `url(${DESK_ART})` } as CSSProperties) : undefined}>
        <ul className={styles.items} role="list">
          {pricing.items.map((item, i) => (
            <li key={item.title} className={styles.item} data-reveal="" style={{ '--reveal-i': i } as CSSProperties}>
              <div className={styles.label}>
                <h3 className={styles.itemTitle}>{typo(item.title)}</h3>
                <p className={styles.price}>
                  <Price value={item.from} />
                </p>
              </div>
              {NOTES[i] ? (
                <PriceNote id={NOTES[i]} service={SERVICE_OF[i]} label={`${typo(item.title)} ${item.from}: zmačkat bankovku a napsat poptávku`} />
              ) : (
                <div className={styles.noteSlot} aria-hidden="true">
                  bankovka sem
                </div>
              )}
              <p className={styles.itemBody}>{typo(item.body)}</p>
            </li>
          ))}
        </ul>
      </div>
      <p className={styles.note}>{typo(pricing.note)}</p>

      <FaqList
        head={
          <>
            <h3 className={styles.faqTitle}>{typo(pricing.faqLabel)}</h3>
            <a className={shared.button} href="#kontakt" data-magnetic="">
              {ui.pricing.ask}
              <Arrow className={shared.arrow} />
            </a>
          </>
        }
        faq={pricing.faq.map((qa) => ({ q: typo(qa.q), a: typo(qa.a) }))}
      />
    </section>
  )
}
