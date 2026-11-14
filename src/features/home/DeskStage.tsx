'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { desk, type HotspotId } from '@/content/desk'
import { typo } from '@/lib/typo/czech'
import { hotspotEls } from '@/three/desk/hotspots'
import { detectTier, type Tier } from '@/three/quality'
import { deskProgress, scrollToTarget } from '@/three/scroll'
import styles from './DeskStage.module.css'

const DeskCanvas = dynamic(() => import('@/three/desk/DeskCanvas'), { ssr: false })

const LAMP_KEY = 'fajlajp:lamp'
function readLamp(): boolean {
  try {
    return typeof window === 'undefined' || window.localStorage.getItem(LAMP_KEY) !== 'off'
  } catch {
    return true
  }
}

/** Where the labels are in full view; focusing one from elsewhere scrolls here. */
const LABELS_AT = 0.3
/** The one frame shown with reduced motion: wide enough to leave the copy room. */
const STILL_AT = 0.18
/** The take the timecode runs through over the whole hero, in seconds at 24 fps. */
const TAKE_S = 42
const FPS = 24

const pad = (n: number) => String(n).padStart(2, '0')
function timecode(p: number): string {
  const frames = Math.round(p * TAKE_S * FPS)
  const s = Math.floor(frames / FPS)
  return `00:${pad(Math.floor(s / 60))}:${pad(s % 60)}:${pad(frames % FPS)}`
}

/**
 * Runs the night desk: picks the 3D tier, turns the scroll into the hero's progress (damped,
 * written to `--p` and `data-beat` on the section — no React renders while scrolling), pins the
 * labels to the objects, and keeps the poster underneath until the first frame is drawn.
 * Without JS, without WebGL and on a software renderer the poster and the HTML copy remain.
 */
export function DeskStage() {
  const root = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLElement | null>(null)
  const [tier, setTier] = useState<Tier | null>(null)
  const [still, setStill] = useState(false)
  const [ready, setReady] = useState(false)
  const [running, setRunning] = useState(false)
  // nothing that depends on the lamp is in the server HTML, so reading storage here is safe
  const [lampOn, setLampOn] = useState(readLamp)
  const [hover, setHover] = useState<HotspotId | null>(null)
  const active = hover

  useEffect(() => {
    const section = root.current?.closest<HTMLElement>('[data-desk-hero]')
    stage.current = root.current?.parentElement ?? null
    if (!section) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let cancelled = false
    void (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (cancelled) return
      setStill(reduced)
      setTier(detectTier())
    })

    if (reduced) {
      deskProgress.target = deskProgress.value = STILL_AT
      section.dataset.mode = 'still'
      return () => {
        cancelled = true
      }
    }

    section.dataset.mode = 'live'
    gsap.registerPlugin(ScrollTrigger)
    const headerHeight = () => document.querySelector('header')?.getBoundingClientRect().height ?? 0
    const st = ScrollTrigger.create({
      trigger: section,
      start: () => `top top+=${headerHeight()}`,
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        deskProgress.target = self.progress
      },
    })
    deskProgress.target = deskProgress.value = st.progress

    let beat = -1
    let shown = ''
    const tc = section.querySelector<HTMLElement>('[data-timecode]')
    const tick = (_time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs / 1000, 0.1)
      const { target } = deskProgress
      let value = deskProgress.value + (target - deskProgress.value) * (1 - Math.exp(-6 * dt))
      if (Math.abs(target - value) < 0.0002) value = target
      deskProgress.value = value
      section.style.setProperty('--p', value.toFixed(4))
      const code = timecode(value)
      if (tc && code !== shown) tc.textContent = shown = code
      const next = value < 0.18 ? 0 : value < 0.56 ? 1 : value < 0.88 ? 2 : 3
      if (next !== beat) {
        beat = next
        section.dataset.beat = String(next)
      }
    }
    gsap.ticker.add(tick)

    const io = new IntersectionObserver(([entry]) => setRunning(entry?.isIntersecting ?? false), {
      rootMargin: '120px 0px',
    })
    io.observe(section)

    // keyboard: focusing a link or a label that is not on screen yet scrolls the hero to it
    const onFocus = (event: FocusEvent) => {
      const el = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-beat-at]') : null
      if (!el) return
      const at = Number(el.dataset.beatAt)
      if (Math.abs(deskProgress.target - at) < 0.14) return
      scrollToTarget(st.start + (st.end - st.start) * at)
    }
    section.addEventListener('focusin', onFocus)

    return () => {
      cancelled = true
      gsap.ticker.remove(tick)
      st.kill()
      io.disconnect()
      section.removeEventListener('focusin', onFocus)
      section.style.removeProperty('--p')
      delete section.dataset.mode
      delete section.dataset.beat
    }
  }, [])

  // the stage shows a hand over anything that reacts
  useEffect(() => {
    if (stage.current) stage.current.style.cursor = hover ? 'pointer' : ''
  }, [hover])

  const select = useCallback((id: HotspotId) => {
    if (id === 'lamp') {
      setLampOn((on) => {
        try {
          window.localStorage.setItem(LAMP_KEY, on ? 'off' : 'on')
        } catch {}
        return !on
      })
      return
    }
    // a service: go to it in the services section
    const target = document.getElementById(`sluzba-${id}`)
    if (target) scrollToTarget(target)
  }, [])

  const onReady = useCallback(() => setReady(true), [])
  const live = tier === 'low' || tier === 'high'

  return (
    <div ref={root} className={styles.scene} data-ready={ready || undefined} data-tier={tier ?? undefined}>
      <picture className={styles.poster}>
        <source media="(max-width: 767px)" srcSet="/scene/desk-poster-mobile.webp" />
        <img src="/scene/desk-poster-desktop.webp" alt="" width={1600} height={1000} decoding="async" fetchPriority="high" />
      </picture>

      {live && (
        <DeskCanvas
          className={styles.canvas}
          tier={tier}
          still={still}
          running={running}
          eventSource={stage}
          lampOn={lampOn}
          active={active}
          onHover={setHover}
          onSelect={select}
          onReady={onReady}
        />
      )}

      <p className="visually-hidden">{desk.description}</p>

      {live && (
        <ul className={styles.hotspots} aria-label="Věci na stole">
          {desk.hotspots.map((spot) => {
            const isLamp = spot.id === 'lamp'
            const common = {
              'data-hotspot': '',
              'data-beat-at': LABELS_AT,
              'data-active': active === spot.id || undefined,
              'data-kind': isLamp ? 'switch' : 'service',
              className: styles.spot,
              ref: (el: HTMLElement | null) => {
                if (el) hotspotEls.set(spot.id, el)
                else hotspotEls.delete(spot.id)
              },
              onPointerEnter: () => setHover(spot.id),
              onPointerLeave: () => setHover(null),
              onFocus: () => setHover(spot.id),
              onBlur: () => setHover(null),
            }
            const inner = (
              <>
                <span className={styles.dot} aria-hidden="true" />
                <span className={styles.string} aria-hidden="true" />
                <span className={styles.tag}>
                  <span className={styles.index} aria-hidden={isLamp || undefined}>
                    {isLamp ? <span className={styles.bulb} /> : spot.index}
                  </span>
                  <span className={styles.label}>
                    {spot.label}
                    {isLamp && <span className="visually-hidden">{lampOn ? ' (svítí)' : ' (zhasnutá)'}</span>}
                  </span>
                </span>
                <span className={styles.note}>
                  {isLamp ? (lampOn ? desk.lamp.on : desk.lamp.off) + '. ' : ''}
                  {typo(spot.note)}
                </span>
              </>
            )
            return (
              <li key={spot.id}>
                {isLamp ? (
                  <button type="button" aria-pressed={lampOn} onClick={() => select(spot.id)} {...common}>
                    {inner}
                  </button>
                ) : (
                  <a
                    href={`#sluzba-${spot.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      select(spot.id)
                    }}
                    {...common}
                  >
                    {inner}
                  </a>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
