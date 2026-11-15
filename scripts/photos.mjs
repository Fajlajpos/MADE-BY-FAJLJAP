// Usage: npm run photos [-- <source folder or file> ...]   (default: "design obrazky")
// Turns every photo (JPG, PNG, HEIC-free formats sharp reads, WebP) into a light WebP in
// public/photos/: at most 2000 px on the long side, quality 78, colours kept, metadata (GPS,
// camera, date) stripped. The file name becomes a plain slug ("Moje Fotka 01.jpeg" →
// moje-fotka-01.webp). Prints the size before and after. Run it again after adding photos;
// it skips photos whose WebP is newer than the source.
// Next to each photo it also writes <name>-glow.webp: a tiny (48 px), heavily blurred copy, for
// the light a photo casts around itself on the page (stretched by CSS, so it costs ~1 kB and no
// runtime blur filter).
import { readdirSync, statSync, mkdirSync, existsSync } from 'node:fs'
import { join, extname, basename } from 'node:path'
import sharp from 'sharp'

const OUT = 'public/photos'
const MAX = 2000
const QUALITY = 78
const EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.avif'])

const sources = process.argv.slice(2)
if (sources.length === 0) sources.push('design obrazky')

const slug = (name) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const files = sources.flatMap((src) => {
  if (!existsSync(src)) {
    console.log(`skip ${src}: not found`)
    return []
  }
  if (statSync(src).isFile()) return [src]
  return readdirSync(src).map((f) => join(src, f))
})

mkdirSync(OUT, { recursive: true })
const kb = (n) => `${Math.round(n / 1024)} kB`

for (const file of files) {
  if (!EXT.has(extname(file).toLowerCase())) continue
  const out = join(OUT, `${slug(basename(file, extname(file)))}.webp`)
  if (existsSync(out) && statSync(out).mtimeMs > statSync(file).mtimeMs) {
    console.log(`up to date  ${out}`)
    continue
  }
  const info = await sharp(file)
    .rotate() // apply the camera's orientation, then drop it with the rest of the metadata
    .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6, smartSubsample: true })
    .toFile(out)
  console.log(`${kb(statSync(file).size).padStart(8)} → ${kb(info.size).padStart(7)}  ${info.width}×${info.height}  ${out}`)
  await sharp(file).rotate().resize({ width: 48, height: 48, fit: 'inside' }).blur(3).webp({ quality: 60 }).toFile(out.replace(/\.webp$/, '-glow.webp'))
}
