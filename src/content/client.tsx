'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { getContent, type Content, type Lang } from '.'

const LangContext = createContext<Lang>('cs')

/** Gives Client Components the page's language (set once in the root layout). */
export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext value={lang}>{children}</LangContext>
}

export function useLang(): Lang {
  return useContext(LangContext)
}

/** All the copy in the page's language (Client Components). */
export function useContent(): Content {
  return getContent(useContext(LangContext))
}
