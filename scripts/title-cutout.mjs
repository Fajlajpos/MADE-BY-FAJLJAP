// Usage: node scripts/title-cutout.mjs <source> <out.png> [scale=2] [lift=0]
// Cuts a chrome title out of a flat light-grey studio background (with its soft drop shadow):
//   - background = smooth, colourless, light-to-mid grey pixels reached from the image border
//     (the letters' dark outline stops the fill, so the shadow and the backdrop go, the metal stays),
//   - the holes of letters (A, B, D, O, P …) = enclosed regions of that same flat grey,
//   - the edge gets a soft alpha from how much darker than the backdrop it is, and its colour is
//     un-premultiplied from the grey, so no light fringe shows on a dark page,
//   - `lift` (0–1) brightens the metal: a curve that raises the dark and middle tones and leaves
//     the highlights, so dark chrome reads lighter without going flat,
//   - then it is trimmed and upscaled (Lanczos + a light sharpen) and saved as a transparent PNG.
import sharp from 'sharp'

const [src, out, up = '2', liftArg = '0'] = process.argv.slice(2)
const LIFT = Number(liftArg)
if (!src || !out) throw new Error('usage: node scripts/title-cutout.mjs <source> <out.png> [scale]')

const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H } = info
const N = W * H
const lum = new Float32Array(N)
const sat = new Float32Array(N)
for (let i = 0; i < N; i++) {
  const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2]
  lum[i] = (r + g + b) / 3
  sat[i] = Math.max(r, g, b) - Math.min(r, g, b)
}

// the backdrop's grey, from the border
let sum = 0, n = 0
for (let x = 0; x < W; x++) for (const y of [0, H - 1]) { sum += lum[y * W + x]; n++ }
const BG = sum / n

const flatGrey = (i) => sat[i] < 16 && lum[i] > 80
const bg = new Uint8Array(N)

// flood from the border through smooth grey (small steps only: an outline is a cliff)
const flood = (seeds, mark, ok) => {
  const stack = []
  for (const s of seeds) if (!mark[s] && ok(s)) { mark[s] = 1; stack.push(s) }
  while (stack.length) {
    const i = stack.pop()
    const x = i % W, y = (i / W) | 0
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
      const j = ny * W + nx
      if (mark[j] || !ok(j) || Math.abs(lum[j] - lum[i]) > 6) continue
      mark[j] = 1
      stack.push(j)
    }
  }
}
const border = []
for (let x = 0; x < W; x++) border.push(x, (H - 1) * W + x)
for (let y = 0; y < H; y++) border.push(y * W, y * W + W - 1)
flood(border, bg, flatGrey)

// the holes: enclosed flat regions of the backdrop's own grey
const seen = new Uint8Array(N)
for (let i = 0; i < N; i++) {
  if (bg[i] || seen[i] || !flatGrey(i) || Math.abs(lum[i] - BG) > 12) continue
  const region = new Uint8Array(N)
  flood([i], region, (j) => !bg[j] && flatGrey(j) && Math.abs(lum[j] - BG) < 16)
  let area = 0, m = 0, m2 = 0
  for (let j = 0; j < N; j++) if (region[j]) { seen[j] = 1; area++; m += lum[j]; m2 += lum[j] * lum[j] }
  const mean = m / area, sd = Math.sqrt(Math.max(0, m2 / area - mean * mean))
  // a real hole (inside A, B, P, R …) is big; small white patches are highlights on the metal
  if (area > N * 0.0025 && Math.abs(mean - BG) < 10 && sd < 6) for (let j = 0; j < N; j++) if (region[j]) bg[j] = 1
}

// alpha: metal 1, backdrop 0; the edge ring (next to the backdrop) by how much darker it is
const OUT = Buffer.alloc(N * 4)
const near = (i, r) => {
  const x = i % W, y = (i / W) | 0
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const nx = x + dx, ny = y + dy
    if (nx >= 0 && ny >= 0 && nx < W && ny < H && bg[ny * W + nx]) return true
  }
  return false
}
const INK = 40 // the outline's darkness
for (let i = 0; i < N; i++) {
  let a = bg[i] ? 0 : 1
  if (!bg[i] && near(i, 1)) a = Math.min(1, Math.max(0, (BG - lum[i]) / (BG - INK)))
  else if (bg[i] && near(i, 0)) a = 0
  for (let k = 0; k < 3; k++) {
    const c = data[i * 3 + k]
    let v = a > 0.02 ? Math.min(255, Math.max(0, (c - BG * (1 - a)) / a)) : 0
    // lift: gamma below 1 raises the darks and mids, then a little screen toward white
    if (LIFT > 0 && v > 0) {
      const t = v / 255
      const g = Math.pow(t, 1 - LIFT * 0.55)
      v = 255 * (g + (1 - g) * g * LIFT * 0.35)
    }
    OUT[i * 4 + k] = Math.round(v)
  }
  OUT[i * 4 + 3] = Math.round(a * 255)
}

const trimmed = await sharp(OUT, { raw: { width: W, height: H, channels: 4 } }).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true })
const s = Number(up)
await sharp(trimmed.data)
  .resize(Math.round(trimmed.info.width * s), null, { kernel: 'lanczos3' })
  .sharpen({ sigma: 0.8, m1: 0.6, m2: 1.2 })
  .png({ compressionLevel: 9 })
  .toFile(out)
console.log(`${out}: ${Math.round(trimmed.info.width * s)} wide (backdrop grey ${BG.toFixed(0)})`)
