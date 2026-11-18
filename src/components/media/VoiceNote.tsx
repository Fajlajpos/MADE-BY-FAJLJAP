'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useContent } from '@/content/client'
import styles from './VoiceNote.module.css'

type Props = {
  /** The recording (e.g. '/audio/hlas.m4a'). Empty: the player waits for it. */
  src?: string
  title: string
  /** Under the title while there is a recording, e.g. "30 s, můj hlas". */
  sub: string
  /** Shown instead of `sub` until the recording exists. */
  soon: string
  /** What I say, for anyone who cannot or does not want to listen. */
  transcript?: string[]
}

/** 44 bars of a waveform, the same on every visit (a seeded shape that rises and falls like speech). */
const BARS = (() => {
  let s = 7
  const r = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
  return Array.from({ length: 44 }, (_, i) => {
    const phrase = Math.sin((i / 44) * Math.PI * 3.2) * 0.35 + 0.55
    return Math.max(0.12, Math.min(1, phrase * (0.45 + r() * 0.75)))
  })
})()

const time = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

/**
 * A short voice note from me: a round play button, a waveform that fills as it plays, the time,
 * and the transcript to read. Until the recording is there, the player stands ready but quiet.
 */
export function VoiceNote({ src, title, sub, soon, transcript }: Props) {
  const t = useContent().ui.voice
  const audio = useRef<HTMLAudioElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [left, setLeft] = useState<number | null>(null)
  const ready = Boolean(src)

  // while playing, the waveform fills (a CSS variable, set once a frame, no re-renders)
  useEffect(() => {
    if (!playing) return
    let raf = 0
    const tick = () => {
      const a = audio.current
      if (a && a.duration) {
        root.current?.style.setProperty('--p', (a.currentTime / a.duration).toFixed(4))
        const l = Math.max(0, a.duration - a.currentTime)
        setLeft((prev) => (prev === null || Math.floor(prev) !== Math.floor(l) ? l : prev))
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  const toggle = () => {
    const a = audio.current
    if (!a) return
    if (a.paused) void a.play()
    else a.pause()
  }

  // clicking on the waveform jumps there
  const seek = (e: React.MouseEvent<HTMLSpanElement>) => {
    const a = audio.current
    if (!a || !a.duration) return
    const r = e.currentTarget.getBoundingClientRect()
    a.currentTime = ((e.clientX - r.left) / r.width) * a.duration
    root.current?.style.setProperty('--p', (a.currentTime / a.duration).toFixed(4))
    if (a.paused) void a.play()
  }

  return (
    <div ref={root} className={`${styles.note} glow-card`} data-playing={playing || undefined} data-ready={ready || undefined}>
      <button
        type="button"
        className={styles.play}
        onClick={toggle}
        disabled={!ready}
        aria-label={playing ? t.pause : `${t.play} ${title}`}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13l11-6.5z" />}
        </svg>
      </button>

      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        <p className={styles.sub}>{ready ? (left !== null ? `${time(left)} ${t.left}` : sub) : soon}</p>
      </div>

      <span className={styles.wave} onClick={ready ? seek : undefined} aria-hidden="true">
        {[styles.bars, styles.fill].map((cls) => (
          <span key={cls} className={cls}>
            {BARS.map((h, i) => (
              <i key={i} style={{ '--h': h, '--i': i / BARS.length } as CSSProperties} />
            ))}
          </span>
        ))}
      </span>

      {transcript && transcript.length > 0 && (
        <details className={styles.transcript}>
          <summary>{t.transcript}</summary>
          {transcript.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </details>
      )}

      {ready && (
        <audio
          ref={audio}
          src={src}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false)
            setLeft(null)
            root.current?.style.setProperty('--p', '0')
          }}
        />
      )}
    </div>
  )
}
