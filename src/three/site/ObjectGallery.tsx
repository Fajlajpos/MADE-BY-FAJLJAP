'use client'

import type { ObjectKind } from './ChromeObject'
import { Slot3D } from './Slot3D'

/**
 * Development only (`/?gallery=play,tag,wordmark`): the given objects in slots of their own on a
 * black sheet over the page, for scripts/scene-poster.mjs to photograph objects no section uses
 * yet, and for looking at them under the lamp.
 */
export default function ObjectGallery({ kinds }: { kinds: ObjectKind[] }) {
  return (
    <div
      data-gallery
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 49,
        background: 'var(--c-paper)',
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: 24,
      }}
    >
      {kinds.map((kind) => (
        <Slot3D
          key={kind}
          object={kind}
          tone="dusk"
          style={{ width: kind === 'wordmark' ? 'min(92vw, 900px)' : 360, aspectRatio: kind === 'wordmark' ? '3 / 1' : '1 / 1' }}
        />
      ))}
    </div>
  )
}
