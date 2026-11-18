'use client'

import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/dom'

type Mote = { x: number; y: number; z: number; vx: number; vy: number; phase: number }

/** How many motes for this screen: fewer on a phone. */
const countFor = (w: number) => (w < 640 ? 28 : w < 1200 ? 46 : 64)

/**
 * Dust in the light: a few dozen tiny warm specks drifting through the air of the background,
 * behind the content (the cards cover it), so the backdrop reads as a room and not a flat fog. Each mote has a depth (z):
 * near ones are bigger, softer and faster, far ones small and sharp. They show where the light
 * is (upper part of the screen, the lamp's side) and fade in the dark; scrolling stirs them for a
 * moment. One small 2D canvas, never catches the pointer, stops in a hidden tab, off with
 * reduced motion.
 */
export function Dust() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || prefersReducedMotion()) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    let motes: Mote[] = []
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    const spawn = (anywhere: boolean): Mote => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      z: 0.25 + Math.random() * 0.75,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -(0.04 + Math.random() * 0.1),
      phase: Math.random() * Math.PI * 2,
    })

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = countFor(w)
      motes = Array.from({ length: n }, (_, i) => motes[i] ?? spawn(true))
    }
    resize()

    // scrolling stirs the air: the motes drift against it a little and settle again
    let lastY = window.scrollY
    let stir = 0
    let raf = 0
    let last = performance.now()

    const frame = (now: number) => {
      const dt = Math.min(50, now - last) / 16.7
      last = now
      const y = window.scrollY
      stir = stir * 0.92 + (y - lastY) * 0.08
      lastY = y

      ctx.clearRect(0, 0, w, h)
      const t = now / 1000
      for (const m of motes) {
        // slow drift, a gentle sway, pushed by the scroll (near motes more)
        m.x += (m.vx + Math.sin(t * 0.4 + m.phase) * 0.06) * dt * m.z
        m.y += (m.vy - stir * 0.05) * dt * m.z
        if (m.y < -10 || m.y > h + 20) Object.assign(m, spawn(false), m.y < -10 ? {} : { y: -8 })
        if (m.x < -10) m.x = w + 10
        if (m.x > w + 10) m.x = -10

        // the light: strongest high up and toward the lamp's side, fading into the dark below
        const lit = Math.max(0, 1 - m.y / (h * 0.95)) * (0.55 + 0.45 * (1 - m.x / w))
        const twinkle = 0.75 + 0.25 * Math.sin(t * 1.3 + m.phase * 3)
        const alpha = lit * twinkle * (0.18 + m.z * 0.42)
        if (alpha < 0.02) continue

        const r = 0.5 + m.z * 1.4
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, r * 2.4)
        g.addColorStop(0, `rgba(255, 228, 196, ${alpha})`)
        g.addColorStop(1, 'rgba(255, 228, 196, 0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(m.x, m.y, r * 2.4, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      cancelAnimationFrame(raf)
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const onVisibility = () => (document.hidden ? cancelAnimationFrame(raf) : start())

    start()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }}
    />
  )
}
