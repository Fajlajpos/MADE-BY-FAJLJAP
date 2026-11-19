// Usage: node scripts/title-even.mjs <in.png> <out.png> <factor,factor,…>
// Evens out the words of a cut-out title: splits it at the empty columns between letter groups
// and scales each group by its factor (1 = as is), centred on the line's middle, keeping the
// gaps. For a source shot in slight perspective, where the first words came out smaller.
import sharp from 'sharp'

const [src, out, list] = process.argv.slice(2)
if (!src || !out || !list) throw new Error('usage: node scripts/title-even.mjs <in.png> <out.png> <f1,f2,…>')
const factors = list.split(',').map(Number)

const img = sharp(src).ensureAlpha()
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H } = info
const solid = (x) => {
  for (let y = 0; y < H; y++) if (data[(y * W + x) * 4 + 3] > 40) return true
  return false
}
// groups of letters: runs of columns with ink
const groups = []
let s = -1
for (let x = 0; x <= W; x++) {
  const ink = x < W && solid(x)
  if (ink && s < 0) s = x
  if (!ink && s >= 0) {
    if (x - s > 20) groups.push([s, x - 1])
    s = -1
  }
}
if (groups.length !== factors.length) throw new Error(`found ${groups.length} groups, got ${factors.length} factors`)

const mid = H / 2
const parts = []
let cursor = 0
let prevEnd = null
let outH = H
for (const [i, [a, b]] of groups.entries()) {
  const f = factors[i]
  const w = b - a + 1
  const piece = await sharp(src).extract({ left: a, top: 0, width: w, height: H }).png().toBuffer()
  const sw = Math.round(w * f), sh = Math.round(H * f)
  const scaled = f === 1 ? piece : await sharp(piece).resize(sw, sh, { kernel: 'lanczos3' }).png().toBuffer()
  if (prevEnd !== null) cursor += a - prevEnd - 1
  parts.push({ input: scaled, left: cursor, top: Math.round(mid - sh / 2) })
  cursor += sw
  prevEnd = b
  outH = Math.max(outH, sh)
}
const pad = Math.ceil((outH - H) / 2)
for (const p of parts) p.top += pad
await sharp({ create: { width: cursor, height: H + pad * 2, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite(parts)
  .trim({ threshold: 1 })
  .png({ compressionLevel: 9 })
  .toFile(out)
console.log(`${out}: ${groups.length} groups scaled by ${factors.join(', ')}`)
