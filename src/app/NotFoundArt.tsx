'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { mountCpuField } from '@/lib/ascii/cpu'
import { loadKit, monoFamily } from '@/lib/ascii/env'
import { createTextScene } from '@/lib/ascii/scenes'

type Scatter = (from: Element) => Promise<void>
type ScatterSlot = { set(run: Scatter | null): void; get(): Scatter | null }
const ScatterContext = createContext<ScatterSlot | null>(null)

/** Shares the 404 art's scatter with the „back home" link anywhere inside. */
export function LostSignal({ children }: { children: ReactNode }) {
  const [scatter] = useState<ScatterSlot>(() => {
    let run: Scatter | null = null
    return { set: (next) => void (run = next), get: () => run }
  })
  return <ScatterContext.Provider value={scatter}>{children}</ScatterContext.Provider>
}

/**
 * „404" set large in characters that scatter under the cursor (asciify kit `fieldBackground`
 * notFound); the CPU renderer draws it without a GPU.
 */
export function LostArt({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const scatter = useContext(ScatterContext)

  useEffect(() => {
    const host = ref.current
    if (!host) return
    let cancelled = false
    let cleanup = () => {}
    void (async () => {
      const [kit] = await Promise.all([loadKit(), document.fonts?.ready])
      if (cancelled) return
      if (kit) {
        const handle = kit.fieldBackground(host, {
          preset: 'notFound',
          text: '404',
          label: 'Chyba 404 nakreslená znaky',
          ink: '--ascii-ink-strong',
          lazy: false,
          look: {
            font: monoFamily(),
            cellAspect: 0.62,
            highlight: kit.resolveColor('--ascii-wake', host) ?? 'auto',
          },
        })
        if (handle.supported) {
          scatter?.set((from) => handle.scatter(from))
          cleanup = () => handle.destroy()
          return
        }
        handle.destroy()
      }
      const cpu = mountCpuField({ host, paint: createTextScene('404', monoFamily()), cellSize: 10 })
      cleanup = () => cpu.destroy()
    })()
    return () => {
      cancelled = true
      scatter?.set(null)
      cleanup()
    }
  }, [scatter])

  return <div ref={ref} className={className} />
}

/** „Zpátky na úvod": the numerals break apart and re-form, then the home page loads. */
export function HomeLink({ className, children }: { className?: string; children: ReactNode }) {
  const router = useRouter()
  const scatter = useContext(ScatterContext)
  const busy = useRef(false)

  return (
    <Link
      href="/"
      className={className}
      onClick={async (event) => {
        const run = scatter?.get()
        if (!run || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
        event.preventDefault()
        if (busy.current) return
        busy.current = true
        await run(event.currentTarget)
        router.push('/')
      }}
    >
      {children}
    </Link>
  )
}
