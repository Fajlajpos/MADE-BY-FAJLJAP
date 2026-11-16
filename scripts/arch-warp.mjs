// Usage: node scripts/arch-warp.mjs <in.png> <out-basename> [bend=0.22]
// Bends a flat (transparent) image into an arch: each column drops by a parabola (its ends
// lower than its middle) and leans along the curve's slope, sampled bilinearly, so the
// letters follow the arc without being cut. Writes PNG and WebP.
import sharp from 'sharp'
const [src, out, bendArg = '0.22'] = process.argv.slice(2)
// transparent room around it, so the leaning ends are not cut off
const meta = await sharp(src).metadata()
const pad = Math.round(meta.width * 0.08)
const { data, info } = await sharp(src).ensureAlpha()
  .extend({ left: pad, right: pad, top: pad, bottom: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h } = info
const bend = Number(bendArg) * w // how much the ends drop, in px
const H = Math.ceil(h + bend + 4)
const out4 = Buffer.alloc(w * H * 4)
const c = (w - 1) / 2
for (let x = 0; x < w; x++) {
  const u = (x - c) / c // -1 … 1
  const dy = bend * u * u // drop of this column
  const slope = (2 * bend * u) / c // d(dy)/dx
  for (let y = 0; y < H; y++) {
    // inverse map: lean the column with the slope around the line's middle
    const sy = y - dy
    const sx = x + (sy - h / 2) * slope * 0.75
    if (sx < 0 || sy < 0 || sx > w - 1 || sy > h - 1) continue
    const x0 = Math.floor(sx), y0 = Math.floor(sy), fx = sx - x0, fy = sy - y0
    const x1 = Math.min(w - 1, x0 + 1), y1 = Math.min(h - 1, y0 + 1)
    const o = (y * w + x) * 4
    for (let k = 0; k < 4; k++) {
      const a = data[(y0 * w + x0) * 4 + k], b = data[(y0 * w + x1) * 4 + k]
      const d = data[(y1 * w + x0) * 4 + k], e = data[(y1 * w + x1) * 4 + k]
      out4[o + k] = (a * (1 - fx) + b * fx) * (1 - fy) + (d * (1 - fx) + e * fx) * fy
    }
  }
}
const img = await sharp(out4, { raw: { width: w, height: H, channels: 4 } }).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true })
await sharp(img.data).png({ compressionLevel: 9 }).toFile(`${out}.png`)
await sharp(img.data).resize(2400).webp({ quality: 90, alphaQuality: 100 }).toFile(`${out}.webp`)
console.log(`${out}: ${img.info.width}×${img.info.height}`)
