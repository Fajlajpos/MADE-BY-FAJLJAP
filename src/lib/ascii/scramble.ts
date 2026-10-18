import { prefersReducedMotion, SCRAMBLE_GLYPHS } from './env'

const running = new WeakMap<HTMLElement, number>()

/**
 * Rolls `el`'s text through random characters and resolves it left to right. Spaces stay put,
 * so in a mono face the width never changes. No-op under reduced motion.
 */
export function scramble(el: HTMLElement, text: string, duration = 420): void {
  if (prefersReducedMotion()) {
    el.textContent = text
    return
  }
  cancelAnimationFrame(running.get(el) ?? 0)
  const chars = Array.from(text)
  const start = performance.now()
  const step = (now: number) => {
    const progress = Math.min(1, (now - start) / duration)
    const settled = Math.floor(progress * chars.length * 1.15 - chars.length * 0.15)
    el.textContent = chars
      .map((ch, i) =>
        i <= settled || ch === ' '
          ? ch
          : SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)],
      )
      .join('')
    if (progress < 1) running.set(el, requestAnimationFrame(step))
    else {
      el.textContent = text
      running.delete(el)
    }
  }
  running.set(el, requestAnimationFrame(step))
}
