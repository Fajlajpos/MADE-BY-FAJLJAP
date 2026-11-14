'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, type ReactNode } from 'react'
import { detectTier, type Tier } from '../quality'
import type { ObjectKind } from './ChromeObject'
import { ThreeContext } from './context'

const SiteCanvas = dynamic(() => import('./SiteCanvas'), { ssr: false })
const ObjectGallery = dynamic(() => import('./ObjectGallery'), { ssr: false })

/** `?gallery=play,tag` in development: those objects alone over the page (see ObjectGallery). */
function galleryKinds(): ObjectKind[] | null {
  if (process.env.NODE_ENV === 'production') return null
  const list = new URLSearchParams(window.location.search).get('gallery')
  return list ? (list.split(',').filter(Boolean) as ObjectKind[]) : null
}

/**
 * Decides once, after the first paint, whether this device gets 3D. If it does, the shared
 * canvas is loaded (three.js stays out of the first bundle) and every <Slot3D/> swaps its
 * still image for a live object.
 */
export function ThreeRoot({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<Tier | null>(null)
  const [gallery, setGallery] = useState<ObjectKind[] | null>(null)
  useEffect(() => {
    // after fonts: the canvas measures text-sized slots
    let cancelled = false
    void (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (cancelled) return
      setTier(detectTier())
      setGallery(galleryKinds())
    })
    return () => {
      cancelled = true
    }
  }, [])
  const enabled = tier === 'low' || tier === 'high'
  return (
    <ThreeContext value={{ enabled, tier }}>
      {children}
      {gallery && <ObjectGallery kinds={gallery} />}
      {enabled && <SiteCanvas tier={tier} />}
    </ThreeContext>
  )
}
