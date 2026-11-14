/**
 * How much 3D this device gets.
 *  - none: no WebGL2, or a software renderer (SwiftShader, llvmpipe) — the poster stays
 *  - low:  phones, touch screens, ≤ 4 cores or ≤ 4 GB — DPR 1, no shadows, no bloom
 *  - high: the rest — DPR up to 2, a shadow from the lamp, bloom on what glows
 * A software renderer counts as no GPU: it would draw, but slowly and on the CPU.
 * drei's PerformanceMonitor may still step `high` down to `low` while running.
 */

export type Tier = 'none' | 'low' | 'high'

let cached: Tier | null = null

export function detectTier(): Tier {
  if (cached) return cached
  cached = measure()
  return cached
}

function measure(): Tier {
  if (typeof window === 'undefined') return 'none'
  const forced = new URLSearchParams(window.location.search).get('tier')
  if (forced === 'none' || forced === 'low' || forced === 'high') return forced

  let renderer = ''
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true })
    if (!gl) return 'none'
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    return 'none'
  }
  if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) return 'none'

  const nav = navigator as Navigator & { deviceMemory?: number }
  const memory = nav.deviceMemory ?? 8
  const cores = nav.hardwareConcurrency ?? 8
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const small = window.innerWidth < 768
  if (memory <= 4 || cores <= 4 || coarse || small) return 'low'
  return 'high'
}
