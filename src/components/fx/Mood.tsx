'use client'

import { useEffect } from 'react'
import styles from './Mood.module.css'

/** The light of each section: warm at the start and the end, cold for the work, violet between. */
const MOODS: Record<string, Mood> = {
  video: 'warm',
  'co-delam': 'cold',
  'jak-to-probiha': 'cold',
  prace: 'violet',
  'o-mne': 'ember',
  cenik: 'violet',
  kontakt: 'warm',
}

type Mood = 'warm' | 'cold' | 'violet' | 'ember' | 'green'

/** A card's own light (Showcase data-hue) takes over the page while the card is in view. */
const HUE_MOOD: Record<string, Mood> = { warm: 'warm', cold: 'cold', violet: 'violet', green: 'green' }

/**
 * The page's background light changes with what you are looking at: the card in the middle of
 * the screen (its own colour), or else the section. Five lights are drawn once,
 * fixed behind everything; only their opacity changes (a cross-fade on the compositor), so the
 * mood shifts slowly as you scroll without repainting anything.
 */
export function MoodLight() {
  useEffect(() => {
    const html = document.documentElement
    const sections = Array.from(document.querySelectorAll<HTMLElement>('main > section'))
    const cards = Array.from(document.querySelectorAll<HTMLElement>('main [data-hue]'))
    let section: Mood = 'warm'
    let card: Mood | null = null
    const apply = () => {
      const mood = card ?? section
      if (html.dataset.mood !== mood) html.dataset.mood = mood
    }
    // the element crossing the middle of the screen sets the light: a card if there is one, else its section
    const band = { rootMargin: '-45% 0px -45% 0px' }
    const sectionIo = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) section = MOODS[(e.target as HTMLElement).id] ?? 'warm'
      apply()
    }, band)
    const visible = new Set<HTMLElement>()
    const cardIo = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement
        if (e.isIntersecting) visible.add(el)
        else visible.delete(el)
      }
      // two cards side by side: the one that comes first on the page
      const first = cards.find((c) => visible.has(c))
      card = first ? (HUE_MOOD[first.dataset.hue ?? ''] ?? null) : null
      apply()
    }, band)
    for (const s of sections) sectionIo.observe(s)
    for (const c of cards) cardIo.observe(c)
    html.dataset.mood = 'warm'
    return () => {
      sectionIo.disconnect()
      cardIo.disconnect()
      delete html.dataset.mood
    }
  }, [])

  return (
    <div className={styles.mood} aria-hidden="true">
      <span className={styles.warm} />
      <span className={styles.cold} />
      <span className={styles.violet} />
      <span className={styles.ember} />
      <span className={styles.green} />
    </div>
  )
}
