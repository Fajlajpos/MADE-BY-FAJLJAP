'use client'

import Image from 'next/image'
import { useEffect, useRef, type RefObject } from 'react'
import styles from './Hero.module.css'

const SRC = '/brand/made-by-fajlajp.webp'

/**
 * „MADE BY FAJLAJP“ in chrome: it floats gently by itself and flashes white now and then. With
 * the cursor over it, the letters' edges catch the cursor like a lamp: a thin bright rim on the
 * edges that face it, with a soft glow, fading with distance — nothing else changes. Done in a
 * small WebGL overlay: the edge directions are computed once from the image's alpha.
 */
export function ArchTitle() {
  const ref = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useChromeRim(ref, canvasRef, SRC)

  return (
    <div ref={ref} className={styles.archScene}>
      <div className={styles.archFloat}>
        <div className={styles.archTilt}>
          <Image src={SRC} alt="" width={2400} height={693} priority unoptimized className={styles.archImg} />
          {/* a white flash running across now and then */}
          <span className={styles.archGlint} aria-hidden="true" />
          {/* the edges catching the cursor's light */}
          <canvas ref={canvasRef} className={styles.archRim} aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

/**
 * The cursor-lamp rim on a cut-out chrome image: `canvas` lies exactly over the image `src`,
 * pointer moves are read on `rootRef`. Used by the MADE BY FAJLAJP title and the PROCESS title.
 */
export function useChromeRim(
  rootRef: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  SRC: string,
  gain = 1,
) {
  useEffect(() => {
    const ref = rootRef
    const root = ref.current
    const canvas = canvasRef.current
    if (!root || !canvas) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false })
    if (!gl) return

    let disposed = false
    let raf = 0
    const state = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, on: 0, target: 0 }

    const vs = `attribute vec2 p; varying vec2 uv; void main(){ uv = p * 0.5 + 0.5; uv.y = 1.0 - uv.y; gl_Position = vec4(p, 0.0, 1.0); }`
    const fs = `precision mediump float;
      varying vec2 uv;
      uniform sampler2D map;
      uniform vec2 cursor;   // 0..1 over the title
      uniform float aspect;  // width / height
      uniform float on;      // 0..1 fade
      uniform float gain;    // 1 = the MADE BY FAJLAJP look, higher = brighter, wider, thicker
      void main() {
        vec4 t = texture2D(map, uv);
        float edge = t.b;
        if (edge < 0.01) { gl_FragColor = vec4(0.0); return; }
        vec2 n = normalize(t.rg * 2.0 - 1.0 + 1e-5);
        vec2 d = (cursor - uv) * vec2(aspect, 1.0);
        float dist = length(d);
        vec2 dir = d / max(dist, 1e-4);
        // only the edges that face the light, and a little of the others
        float facing = pow(max(dot(n, dir), 0.0), 1.6) * 0.9 + 0.1;
        // falloff around the cursor (in title heights)
        float fall = exp(-dist * dist / (0.09 * gain));
        float rim = pow(edge, 3.0 / gain);   // the thin bright core of the edge
        float glow = edge * 0.08 * gain;     // a hint of halo
        float i = min(1.0, (rim + glow) * facing * fall * on * 2.6 * gain);
        gl_FragColor = vec4(vec3(1.0, 0.97, 0.93) * i, i);
      }`
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs))
    gl.linkProgram(prog)
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uCursor = gl.getUniformLocation(prog, 'cursor')
    const uAspect = gl.getUniformLocation(prog, 'aspect')
    const uOn = gl.getUniformLocation(prog, 'on')
    gl.uniform1f(gl.getUniformLocation(prog, 'gain'), gain)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    // the edge map: from the image's alpha, its blurred gradient gives each edge pixel its outward
    // direction (rg) and how close it is to the edge (b)
    let aspect = 4
    const img = new window.Image()
    img.src = SRC
    void img.decode().then(() => {
      if (disposed) return
      const W = 2400
      const H = Math.round((W * img.height) / img.width)
      aspect = W / H
      const c = document.createElement('canvas')
      c.width = W
      c.height = H
      const cx = c.getContext('2d', { willReadFrequently: true })!
      cx.drawImage(img, 0, 0, W, H)
      const px = cx.getImageData(0, 0, W, H).data
      const a = new Float32Array(W * H)
      for (let i = 0; i < W * H; i++) a[i] = px[i * 4 + 3]! / 255
      const blur = (src: Float32Array, r: number) => {
        const tmp = new Float32Array(W * H)
        const out = new Float32Array(W * H)
        for (let y = 0; y < H; y++)
          for (let x = 0; x < W; x++) {
            let s = 0
            for (let k = -r; k <= r; k++) s += src[y * W + Math.min(W - 1, Math.max(0, x + k))]!
            tmp[y * W + x] = s / (2 * r + 1)
          }
        for (let y = 0; y < H; y++)
          for (let x = 0; x < W; x++) {
            let s = 0
            for (let k = -r; k <= r; k++) s += tmp[Math.min(H - 1, Math.max(0, y + k)) * W + x]!
            out[y * W + x] = s / (2 * r + 1)
          }
        return out
      }
      const b = blur(a, 1)
      const tex = new Uint8Array(W * H * 4)
      for (let y = 1; y < H - 1; y++)
        for (let x = 1; x < W - 1; x++) {
          const i = y * W + x
          // gradient of the blurred alpha points inward; the outward normal is its negative
          const gx = b[i + 1]! - b[i - 1]!
          const gy = b[i + W]! - b[i - W]!
          const len = Math.hypot(gx, gy)
          // edge: strong where the alpha changes, only on the metal side
          const e = Math.min(1, len * 1.6)
          const nx = len > 1e-5 ? -gx / len : 0
          const ny = len > 1e-5 ? -gy / len : 0 // y down, like the shader's uv and the cursor
          tex[i * 4] = Math.round((nx * 0.5 + 0.5) * 255)
          tex[i * 4 + 1] = Math.round((ny * 0.5 + 0.5) * 255)
          tex[i * 4 + 2] = Math.round(e * 255)
          tex[i * 4 + 3] = 255
        }
      const t = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, tex)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    })

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.max(1, Math.round(r.width * dpr))
      canvas.height = Math.max(1, Math.round(r.height * dpr))
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const frame = () => {
      raf = 0
      state.x += (state.tx - state.x) * 0.25
      state.y += (state.ty - state.y) * 0.25
      state.on += (state.target - state.on) * 0.12
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform2f(uCursor, state.x, state.y)
      gl.uniform1f(uAspect, aspect)
      gl.uniform1f(uOn, state.on)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      const moving = Math.abs(state.tx - state.x) + Math.abs(state.ty - state.y) > 0.0005
      if (moving || Math.abs(state.target - state.on) > 0.003) raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      state.tx = (e.clientX - r.left) / r.width
      state.ty = (e.clientY - r.top) / r.height
      if (state.target === 0) {
        state.x = state.tx
        state.y = state.ty
      }
      state.target = 1
      kick()
    }
    const onLeave = () => {
      state.target = 0
      kick()
    }
    root.addEventListener('pointermove', onMove, { passive: true })
    root.addEventListener('pointerleave', onLeave)
    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
    }
  }, [rootRef, canvasRef, SRC, gain])
}

/**
 * Any other cut-out chrome title (PRICES …) with the same cursor-lit edges and the gentle float
 * as the hero's, without the hero's arch flash.
 */
export function ChromeTitle({ src, width, height }: { src: string; width: number; height: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useChromeRim(ref, canvasRef, src)
  return (
    <div ref={ref} className={styles.archScene}>
      <div className={styles.archFloat}>
        <div className={styles.archTilt}>
          <Image src={src} alt="" width={width} height={height} unoptimized className={styles.archImg} />
          <canvas ref={canvasRef} className={styles.archRim} aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
