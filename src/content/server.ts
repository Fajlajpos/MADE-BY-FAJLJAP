import { lang as rootLang } from 'next/root-params'
import { getContent, isLang, type Content, type Lang } from '.'

/** The language of the page being rendered (Server Components only), from the `[lang]` root segment. */
export async function getLang(): Promise<Lang> {
  const value = await rootLang()
  return isLang(value) ? value : 'cs'
}

/** All the copy in the language of the page being rendered (Server Components only). */
export async function content(): Promise<Content> {
  return getContent(await getLang())
}
