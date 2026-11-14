'use client'

import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { getSlot } from '@/content/media'

/**
 * A media slot (src/content/media.ts) as a texture for the 3D scene: the photo in colour,
 * cropped square around its focal point, once it has a `src`; until then a stand-in in the
 * site's two lights (orange, ultramarine), like the 2D <Media/> stand-in.
 */
export function useSlotTexture(key: string, size = 512): CanvasTexture {
  const media = getSlot(key)
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const t = new CanvasTexture(canvas)
    t.colorSpace = SRGBColorSpace
    return t
  }, [size])

  useEffect(() => {
    const canvas = texture.image as HTMLCanvasElement
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let cancelled = false

    // until there is a photo: the site's two lights on a dark print
    const paintPlaceholder = () => {
      ctx.fillStyle = '#12141b'
      ctx.fillRect(0, 0, size, size)
      const light = (x: number, y: number, r: number, color: string) => {
        const g = ctx.createRadialGradient(x * size, y * size, 0, x * size, y * size, r * size)
        g.addColorStop(0, color)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, size, size)
      }
      if (media.placeholder !== 'cold') light(0.32, 0.36, 0.6, 'rgba(255,90,31,0.75)')
      if (media.placeholder !== 'warm') light(0.7, 0.72, 0.62, 'rgba(61,90,254,0.8)')
      texture.needsUpdate = true
    }

    if (!media.src) {
      paintPlaceholder()
      return
    }
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      if (cancelled) return
      const [fx, fy] = media.focal ?? [0.5, 0.5]
      const side = Math.min(image.naturalWidth, image.naturalHeight)
      const sx = Math.min(image.naturalWidth - side, Math.max(0, image.naturalWidth * fx - side / 2))
      // focal y runs from the bottom
      const sy = Math.min(image.naturalHeight - side, Math.max(0, image.naturalHeight * (1 - fy) - side / 2))
      ctx.drawImage(image, sx, sy, side, side, 0, 0, size, size)
      texture.needsUpdate = true
    }
    image.onerror = () => !cancelled && paintPlaceholder()
    image.src = media.src
    return () => {
      cancelled = true
    }
  }, [texture, media.src, media.placeholder, media.focal, size])

  useEffect(() => () => texture.dispose(), [texture])
  return texture
}
