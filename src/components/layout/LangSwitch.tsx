'use client'

import { LANGS, rootOf } from '@/content'
import { useLang } from '@/content/client'
import styles from './LangSwitch.module.css'

const SHORT = { cs: 'CZ', en: 'EN' } as const
const NAME = { cs: 'Čeština', en: 'English' } as const

/**
 * CZ | EN in the bar: the current language marked, the other one a link to the same page in it
 * (a full load: the language is the root of the site). Keeps the section you are on (#hash).
 */
export function LangSwitch({ className }: { className?: string }) {
  const lang = useLang()
  return (
    <ul className={[styles.switch, className].filter(Boolean).join(' ')} role="list" aria-label="Jazyk / Language">
      {LANGS.map((l) => (
        <li key={l}>
          {l === lang ? (
            <span className={styles.item} aria-current="true" title={NAME[l]}>
              {SHORT[l]}
            </span>
          ) : (
            <a
              className={styles.item}
              href={rootOf(l)}
              hrefLang={l}
              lang={l}
              title={NAME[l]}
              aria-label={NAME[l]}
              onClick={(e) => {
                // stay on the same section in the other language
                if (window.location.hash) e.currentTarget.href = `${rootOf(l)}${window.location.hash}`
              }}
            >
              {SHORT[l]}
            </a>
          )}
        </li>
      ))}
    </ul>
  )
}
