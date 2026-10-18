import type { Pointer } from './scenes'

/** Follows the cursor relative to `host` (0–1 on each axis), for scenes that answer it. */
export function trackPointer(host: HTMLElement): { pointer: Pointer; destroy(): void } {
  const pointer: Pointer = { x: 0.5, y: 0.5, inside: false }
  const onMove = (event: PointerEvent) => {
    const rect = host.getBoundingClientRect()
    pointer.x = (event.clientX - rect.left) / rect.width
    pointer.y = (event.clientY - rect.top) / rect.height
    pointer.inside = pointer.x >= 0 && pointer.x <= 1 && pointer.y >= 0 && pointer.y <= 1
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  return { pointer, destroy: () => window.removeEventListener('pointermove', onMove) }
}
