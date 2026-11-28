'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useContent } from '@/content/client'
import { prefersReducedMotion } from '@/lib/dom'
import { Words } from '@/components/fx/Words'
import { typo } from '@/lib/typo/czech'
import { Slot3D } from '@/three/site/Slot3D'
import shared from './home.module.css'
import styles from './Reel.module.css'
import { useChromeRim } from './ArchTitle'

const PROCESS_SRC = '/brand/process.webp'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeOut = (t: number) => 1 - (1 - t) ** 3

/**
 * 01 Video — the reel right after the hero. One large 16:9 frame that opens from about 70 % of
 * the content width to all of it as it scrolls in (scale driven by `--e` on the frame's own
 * wrapper). Until the film exists: a dark plate with the chrome play button and a short note.
 * With the film: muted autoplay only while on screen, a play button over the paused film, and
 * quiet controls for sound and pause. Reduced motion: full width from the start, no autoplay.
 */

export function Reel() {
  const { home, getSlot } = useContent()
  const { reel } = home
  const media = getSlot('home.reel')
  const stage = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const userPaused = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const processRef = useRef<HTMLDivElement>(null)
  const processRim = useRef<HTMLCanvasElement>(null)
  useChromeRim(processRef, processRim, PROCESS_SRC, 1.6)

  // scroll → --e on the stage (0 = top just entering, 1 = frame settled in view)
  useEffect(() => {
    const el = stage.current
    if (!el || prefersReducedMotion()) return
    let raf = 0
    const measure = () => {
      raf = 0
      const vh = window.innerHeight
      const top = el.getBoundingClientRect().top
      el.style.setProperty('--e', easeOut(clamp01((vh - top) / (vh * 0.8))).toFixed(4))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // the film plays only while it is on screen (muted, so the browser allows it)
  useEffect(() => {
    const v = video.current
    const el = stage.current
    if (!v || !el || prefersReducedMotion()) return
    v.muted = true
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !userPaused.current) v.play().catch(() => {})
        else if (!entry?.isIntersecting) v.pause()
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // the viewfinder's timecode follows the film, frame by frame, without re-rendering
  const timecode = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!playing) return
    let raf = 0
    const tick = () => {
      const v = video.current
      const el = timecode.current
      if (v && el) {
        const t = v.currentTime
        const p = (n: number) => String(Math.floor(n)).padStart(2, '0')
        el.textContent = `${p(t / 3600)}:${p((t / 60) % 60)}:${p(t % 60)}:${p((t % 1) * 25)}`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  const togglePlay = () => {
    const v = video.current
    if (!v) return
    if (v.paused) {
      userPaused.current = false
      v.play().catch(() => {})
    } else {
      userPaused.current = true
      v.pause()
    }
  }

  const toggleSound = () => {
    const v = video.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
    // turning the sound on is a clear wish to watch
    if (!v.muted && v.paused) {
      userPaused.current = false
      v.play().catch(() => {})
    }
  }

  return (
    <section id="video" className={shared.section} aria-labelledby="video-title">
      <header className={styles.head}>
        <p className={`${shared.label} ${styles.label}`} data-reveal="">
          <b>{reel.index}</b> {reel.label}
        </p>
        <h2
          id="video-title"
          className="visually-hidden"
          data-reveal=""
          style={{ '--reveal-i': 1 } as CSSProperties}
        >
          <Words text={reel.heading} />
        </h2>
      </header>

      {/* the liquid chrome PROCESS title over the video (public/brand/process.webp) */}
      {/* eslint-disable-next-line @next/next/no-img-element -- a cut-out chrome title */}
      <div ref={processRef} className={styles.processTitle}>
        <img className={styles.processImg} src={PROCESS_SRC} alt="" width={2000} height={429} loading="lazy" />
        {/* the edges catching the cursor's light, like MADE BY FAJLAJP */}
        <canvas ref={processRim} className={styles.processRim} aria-hidden="true" />
      </div>
      {/* the film on a camcorder's flip-out screen: the screen swings open on its hinge as the
          section scrolls in; over the picture a viewfinder (REC / STBY, timecode, battery) */}
      <div ref={stage} className={styles.stage}>
        <div className={styles.cam}>
          {/* eslint-disable-next-line @next/next/no-img-element -- the camera's body, a cut-out */}
          <img className={styles.camBody} src="/brand/cam-body.webp" alt="" aria-hidden="true" width={651} height={1395} />
          <div className={styles.camPanel}>
            <div className={styles.frame} data-playing={playing || undefined}>
              {media.video ? (
                <>
                  <video
                    ref={video}
                    className={styles.video}
                    src={media.video}
                    poster={media.src || undefined}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={media.alt}
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                  />
                  <button
                    type="button"
                    className={styles.bigPlay}
                    onClick={togglePlay}
                    hidden={playing}
                    aria-label={reel.play}
                  >
                    <Slot3D object="play" className={styles.chrome} />
                  </button>
                </>
              ) : (
                <div className={styles.soon} role="img" aria-label={`${media.alt}. ${reel.soon}`}>
                  <Slot3D object="play" className={styles.chrome} />
                  <p className={styles.note} aria-hidden="true">
                    {typo(reel.soon)}
                  </p>
                </div>
              )}

              {/* the viewfinder over the picture */}
              <div className={styles.hud} aria-hidden="true">
                <span className={styles.rec}>
                  <i />
                  {playing ? 'REC' : 'STBY'}
                </span>
                <span className={styles.spec}>4K · 25p</span>
                <span ref={timecode} className={styles.tc}>
                  00:00:00:00
                </span>
                <span className={styles.battery}>
                  <i />
                </span>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- the flip-out screen's bezel, a cut-out over the film */}
            <img className={styles.camPanelImg} src="/brand/cam-panel.webp" alt="" aria-hidden="true" width={1557} height={1395} />
          </div>
        </div>

        {media.video && (
          <div className={styles.controls}>
            <button type="button" className={styles.control} onClick={togglePlay}>
              <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
                {playing ? <path d="M8 5v14M16 5v14" /> : <path d="M7 4.5v15l12-7.5z" />}
              </svg>
              {playing ? reel.pause : reel.play}
            </button>
            <button type="button" className={styles.control} onClick={toggleSound}>
              <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
                <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
                {muted ? (
                  <path d="M16 9.5l5 5M21 9.5l-5 5" />
                ) : (
                  <path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" />
                )}
              </svg>
              {muted ? reel.soundOn : reel.soundOff}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
