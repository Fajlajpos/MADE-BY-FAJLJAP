'use client'

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { useContent } from '@/content/client'
import styles from './IpodVoice.module.css'

/** Your headphones render to lie by the iPod (a cut-out in /public/photos). Empty: nothing there yet. */
const HEADPHONES_ART = ''

type Props = {
  /** The recording (e.g. '/audio/hlas.m4a'). Empty: the iPod waits for it. */
  src?: string
  title: string
  sub: string
  soon: string
  /** The little "album cover" on the screen. */
  cover: string
}

/** The display glass's four corners in the render, as shares of its width / height (TL, TR, BR, BL). */
const GLASS = [
  [0.217, 0.0935],
  [0.7913, 0.0995],
  [0.8446, 0.4145],
  [0.2548, 0.42],
] as const
/** The screen is laid out at this size, then warped onto the glass. */
const SCREEN_W = 460
const SCREEN_H = 400

/** The CSS matrix3d that maps the SCREEN_W × SCREEN_H box onto four points (a homography). */
function warp(pts: readonly (readonly [number, number])[]): string {
  const src: [number, number][] = [[0, 0], [SCREEN_W, 0], [SCREEN_W, SCREEN_H], [0, SCREEN_H]]
  const A: number[][] = []
  const b: number[] = []
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i]!
    const [u, v] = pts[i]!
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y])
    b.push(u)
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y])
    b.push(v)
  }
  // Gaussian elimination
  for (let c = 0; c < 8; c++) {
    let m = c
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r]![c]!) > Math.abs(A[m]![c]!)) m = r
    ;[A[c], A[m]] = [A[m]!, A[c]!]
    ;[b[c], b[m]] = [b[m]!, b[c]!]
    for (let r = 0; r < 8; r++) {
      if (r === c) continue
      const f = A[r]![c]! / A[c]![c]!
      for (let k = c; k < 8; k++) A[r]![k]! -= f * A[c]![k]!
      b[r]! -= f * b[c]!
    }
  }
  const h = b.map((v, i) => v / A[i]![i]!)
  const [a, bb, c, d, e, f, g, k] = h as [number, number, number, number, number, number, number, number]
  return `matrix3d(${[a, d, 0, g, bb, e, 0, k, 0, 0, 1, 0, c, f, 0, 1].map((n) => n.toFixed(8)).join(',')})`
}

const time = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

/**
 * My voice note on a liquid-chrome iPod (public/photos/ipod.webp, cut out from his render, 2× upscaled): a Now Playing
 * screen drawn over its display, and a click wheel that works — the centre and ▶❚❚ play and
 * pause, ⏮ / ⏭ jump 5 s back / forward, MENU starts over. Lit like an object: a glass glare on
 * the screen, a sheen across the metal that moves as the pointer tilts it a little in 3D.
 */
export function IpodVoice({ src, title, sub, soon, cover }: Props) {
  const t = useContent().ui.voice
  const audio = useRef<HTMLAudioElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [now, setNow] = useState(0)
  const [dur, setDur] = useState(30)
  const ready = Boolean(src)

  const nowRef = useRef(0)

  // while playing, the progress follows the audio — or, until there is a recording, a clock
  // runs the timeline on its own, so the player already plays, pauses and skips
  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    const tick = (t: number) => {
      const a = audio.current
      if (a) setNow(a.currentTime)
      else {
        const next = nowRef.current + (t - last) / 1000
        last = t
        if (next >= dur) {
          nowRef.current = 0
          setNow(0)
          setPlaying(false)
          return
        }
        nowRef.current = next
        setNow(next)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, dur])

  const seekTo = (to: number) => {
    const v = Math.max(0, Math.min(dur, to))
    const a = audio.current
    if (a) a.currentTime = v
    nowRef.current = v
    setNow(v)
  }
  const toggle = () => {
    const a = audio.current
    if (!a) {
      setPlaying((p) => !p)
      return
    }
    if (a.paused) void a.play()
    else a.pause()
  }
  const jump = (by: number) => seekTo((audio.current?.currentTime ?? nowRef.current) + by)
  const restart = () => {
    seekTo(0)
    const a = audio.current
    if (a) void a.play()
    else setPlaying(true)
  }

  // a small 3D tilt toward the pointer (not on touch, not under reduced motion)
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const r = e.currentTarget.getBoundingClientRect()
    root.current?.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
    root.current?.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
  }
  const onLeave = () => {
    root.current?.style.setProperty('--mx', '0')
    root.current?.style.setProperty('--my', '0')
  }

  // lay the screen onto the glass for the iPod's current size
  const screen = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = root.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const w = el.offsetWidth
      const h = el.offsetHeight
      if (!screen.current || !w) return
      screen.current.style.transform = warp(GLASS.map(([x, y]) => [x * w, y * h] as const))
      screen.current.style.opacity = '1'
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const p = dur ? Math.min(1, now / dur) : 0

  return (
    <div className={styles.stage} onPointerMove={onMove} onPointerLeave={onLeave}>
      {HEADPHONES_ART && (
        // eslint-disable-next-line @next/next/no-img-element -- his headphones render beside the iPod
        <img className={styles.headphones} src={HEADPHONES_ART} alt="" aria-hidden="true" loading="lazy" />
      )}

      <div ref={root} className={styles.ipod} data-playing={playing || undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a cut-out photo of the player */}
        <img className={styles.body} src="/photos/ipod.webp" alt="" width={1198} height={1874} loading="lazy" />

        {/* the Now Playing screen over the display */}
        <div ref={screen} className={styles.screen} aria-live="polite">
          <div className={styles.bar}>
            <svg viewBox="0 0 10 10" aria-hidden="true">
              {playing ? <path d="M2 1.5h2v7H2zM6 1.5h2v7H6z" /> : <path d="M2 1.5v7l6.5-3.5z" />}
            </svg>
            <span>Now Playing</span>
            <span className={styles.battery} aria-hidden="true" />
          </div>
          <div className={styles.track}>
            {/* eslint-disable-next-line @next/next/no-img-element -- the album cover: me */}
            <img className={styles.cover} src={cover} alt="" loading="lazy" />
            <div className={styles.info}>
              <p className={styles.song}>{title}</p>
              <p className={styles.artist}>FAJLAJP</p>
              <p className={styles.album}>{ready ? sub : soon}</p>
            </div>
          </div>
          <div className={styles.progress}>
            <span className={styles.rail}>
              <span className={styles.fill} style={{ '--p': p } as CSSProperties} />
            </span>
            <span className={styles.times} aria-hidden="true">
              <span>{time(now)}</span>
              <span>-{time(Math.max(0, dur - now))}</span>
            </span>
          </div>
          {/* the glass over the display */}
          <span className={styles.glare} aria-hidden="true" />
        </div>

        {/* the click wheel */}
        <div className={styles.wheel}>
          <button type="button" className={`${styles.key} ${styles.menu}`} onClick={restart} aria-label={t.restart} />
          <button type="button" className={`${styles.key} ${styles.prev}`} onClick={() => jump(-5)} aria-label={t.back} />
          <button type="button" className={`${styles.key} ${styles.next}`} onClick={() => jump(5)} aria-label={t.forward} />
          <button type="button" className={`${styles.key} ${styles.playKey}`} onClick={toggle} tabIndex={-1} aria-hidden="true" />
          <button
            type="button"
            className={styles.center}
            onClick={toggle}
           
            aria-label={playing ? t.pause : `${t.play} ${title}`}
          />
        </div>

        {/* light on the metal, masked by the player's own outline */}
        <span className={styles.sheen} aria-hidden="true" />
      </div>

      {ready && (
        <audio
          ref={audio}
          src={src}
          preload="metadata"
          onLoadedMetadata={(e) => setDur(e.currentTarget.duration || 30)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false)
            setNow(0)
          }}
        />
      )}
    </div>
  )
}
