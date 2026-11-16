// Usage: node scripts/logo-cutout.mjs <source> <out-basename> [rotate=-90] [scale=3]
// Cuts a chrome logo out of its black background, keeping the dark reflections inside the metal:
//   - background = near-black pixels connected to the image border, plus enclosed near-black
//     areas big enough to be the holes of letters (A, P …) rather than reflections,
//   - the edge of the metal gets a soft alpha from its brightness (it was antialiased against
//     black), and its colour is un-premultiplied so no dark fringe is left,
//   - then it is turned upright, trimmed, upscaled (Lanczos + a light sharpen) and saved as a
//     transparent PNG and WebP.
import sharp from 'sharp'

const [src, out = 'public/brand/logo', rot = '-90', up = '3'] = process.argv.slice(2)
if (!src) throw new Error('usage: node scripts/logo-cutout.mjs <source> <out-basename>')

const img = sharp(src).rotate(Number(rot))
const { data, info } = await img.removeAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H } = info
const lum = new Float32Array(W * H)
for (let i = 0; i < W * H; i++) lum[i] = Math.max(data[i * 3], data[i * 3 + 1], data[i * 3 + 2])

const DARK = 22 // brighter than this is metal for sure
const bg = new Uint8Array(W * H) // 1 = background

// flood the near-black from the border
const stack = []
const push = (i) => {
  if (!bg[i] && lum[i] < DARK) {
    bg[i] = 1
    stack.push(i)
  }
}
for (let x = 0; x < W; x++) {
  push(x)
  push((H - 1) * W + x)
}
for (let y = 0; y < H; y++) {
  push(y * W)
  push(y * W + W - 1)
}
while (stack.length) {
  const i = stack.pop()
  const x = i % W
  if (x > 0) push(i - 1)
  if (x < W - 1) push(i + 1)
  if (i >= W) push(i - W)
  if (i < W * (H - 1)) push(i + W)
}

// enclosed dark areas: big ones are letter holes (background), small ones are reflections (metal)
const seen = new Uint8Array(W * H)
const HOLE = Math.round(W * H * 0.0004)
for (let s = 0; s < W * H; s++) {
  if (bg[s] || seen[s] || lum[s] >= DARK) continue
  const region = [s]
  seen[s] = 1
  for (let k = 0; k < region.length; k++) {
    const i = region[k]
    const x = i % W
    for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i - W, i + W]) {
      if (j < 0 || j >= W * H || seen[j] || bg[j] || lum[j] >= DARK) continue
      seen[j] = 1
      region.push(j)
    }
  }
  if (region.length > HOLE) for (const i of region) bg[i] = 1
}

// alpha: 0 in the background; a soft ramp on the metal's edge; 1 inside
const rgba = Buffer.alloc(W * H * 4)
const nearBg = (i) => {
  const x = i % W
  for (let dy = -2; dy <= 2; dy++)
    for (let dx = -2; dx <= 2; dx++) {
      const xx = x + dx
      const j = i + dy * W + dx
      if (xx >= 0 && xx < W && j >= 0 && j < W * H && bg[j]) return true
    }
  return false
}
for (let i = 0; i < W * H; i++) {
  if (bg[i]) continue
  let a = 1
  if (nearBg(i)) a = Math.min(1, lum[i] / 110)
  const un = a > 0.02 ? 1 / a : 0
  rgba[i * 4] = Math.min(255, data[i * 3] * un)
  rgba[i * 4 + 1] = Math.min(255, data[i * 3 + 1] * un)
  rgba[i * 4 + 2] = Math.min(255, data[i * 3 + 2] * un)
  rgba[i * 4 + 3] = Math.round(a * 255)
}

const cut = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer()
const trimmed = await sharp(cut).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true })
const scale = Number(up)
const big = await sharp(trimmed.data)
  .resize(Math.round(trimmed.info.width * scale), null, { kernel: 'lanczos3' })
  .sharpen({ sigma: 0.8, m1: 0.6, m2: 1.2 })
  .png()
  .toBuffer({ resolveWithObject: true })
await sharp(big.data).png({ compressionLevel: 9 }).toFile(`${out}.png`)
await sharp(big.data).webp({ quality: 92, alphaQuality: 100 }).toFile(`${out}.webp`)
console.log(`${out}: ${big.info.width}×${big.info.height}`)
