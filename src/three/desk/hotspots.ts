import type { HotspotId } from '@/content/desk'

/**
 * The DOM labels pinned to objects in the scene. The stage registers each button here; the
 * scene projects the anchors every frame and moves the buttons — no React state involved.
 */
export const hotspotEls = new Map<HotspotId, HTMLElement>()

/** True when a DOM event started on a label, so the 3D object under it does not react twice. */
export function fromHotspot(event: Event): boolean {
  const target = event.target
  return target instanceof Element && target.closest('[data-hotspot]') !== null
}
