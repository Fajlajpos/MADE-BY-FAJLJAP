// Usage: node scripts/cloud-cutout.mjs <in.jpg> <out.webp> [scale=1.6]
// Cuts me-on-the-cloud out of its black backdrop and grades it to the site:
//  - background = near-black reached from the border, plus enclosed near-black pockets
//    (between the legs, under the shoes) big enough not to be shadows on the clothes,
//  - a soft edge: the mask is feathered and the colour un-premultiplied from black, so no dark halo,
//  - graded: a little cooler and less saturated, a faint lilac-cyan rim on the edges, fine grain.
import sharp from 'sharp'

const [src, out, up = '1.6'] = process.argv.slice(2)
const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const W = info.width, H = info.height, N = W * H
const mx = (i) => Math.max(data[i * 3], data[i * 3 + 1], data[i * 3 + 2])
const dark = (i) => mx(i) < 13

const bg = new Uint8Array(N)
const fill = (seeds, mark) => {
  const st = []
  for (const s of seeds) if (!mark[s] && dark(s)) { mark[s] = 1; st.push(s) }
  let n = 0
  while (st.length) {
    const i = st.pop(); n++
    const x = i % W, y = (i / W) | 0
    for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1])
      if (j >= 0 && !mark[j] && dark(j)) { mark[j] = 1; st.push(j) }
  }
  return n
}
const border = []
for (let x = 0; x < W; x++) border.push(x, (H - 1) * W + x)
for (let y = 0; y < H; y++) border.push(y * W, y * W + W - 1)
fill(border, bg)
// enclosed pockets
const seen = new Uint8Array(N)
for (let i = 0; i < N; i++) {
  // only below the cloud (round the shoes) and only true black: shadows on the clothes stay
  if (bg[i] || seen[i] || !dark(i) || ((i / W) | 0) < H * 0.8 || mx(i) > 14) continue
  const region = new Uint8Array(N)
  const n = fill([i], region)
  for (let j = 0; j < N; j++) if (region[j]) seen[j] = 1
  if (n > N * 0.0015) for (let j = 0; j < N; j++) if (region[j]) bg[j] = 1
}

// feathered alpha: blur the hard mask a little
const hard = Buffer.alloc(N)
for (let i = 0; i < N; i++) hard[i] = bg[i] ? 0 : 255
const soft = await sharp(hard, { raw: { width: W, height: H, channels: 1 } }).blur(1.6).extractChannel(0).raw().toBuffer()

const o = Buffer.alloc(N * 4)
for (let i = 0; i < N; i++) {
  let a = soft[i] / 255
  // inside the edge band, the colour was mixed with black: take it back out
  const k = a > 0.02 ? 1 / Math.max(a, 0.35) : 0
  let r = Math.min(255, data[i * 3] * k), g = Math.min(255, data[i * 3 + 1] * k), b = Math.min(255, data[i * 3 + 2] * k)
  if (a < 1 && a > 0) a = Math.min(1, a * 1.15)
  // grade: a touch less saturated, cooler, lifted shadows
  const l = 0.3 * r + 0.59 * g + 0.11 * b
  r = l + (r - l) * 0.85; g = l + (g - l) * 0.85; b = l + (b - l) * 0.85
  r = r * 0.96 + 4; g = g * 0.98 + 5; b = Math.min(255, b * 1.04 + 10)
  // a faint cool rim where the edge is
  const rim = a > 0 && a < 1 ? (1 - a) * 0.9 : 0
  r += rim * 60; g += rim * 70; b += rim * 90
  // grain
  const n = (Math.random() - 0.5) * 10
  o[i * 4] = Math.max(0, Math.min(255, r + n))
  o[i * 4 + 1] = Math.max(0, Math.min(255, g + n))
  o[i * 4 + 2] = Math.max(0, Math.min(255, b + n))
  o[i * 4 + 3] = Math.round(a * 255)
}
const png = await sharp(o, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer()
const t = await sharp(png).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true })
await sharp(t.data)
  .resize({ width: Math.round(t.info.width * Number(up)), kernel: 'lanczos3' })
  .sharpen({ sigma: 0.9, m1: 0.7, m2: 1.4 })
  .webp({ quality: 92, alphaQuality: 100 })
  .toFile(out)
console.log(out)
