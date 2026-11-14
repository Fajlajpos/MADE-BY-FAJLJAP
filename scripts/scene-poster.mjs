// Usage: node scripts/scene-poster.mjs   (with `npm run dev` running)
// Renders the stills shown before the 3D is up, without JS, and on devices that get no 3D:
//  - public/objects/<kind>.webp — every chrome object, on a transparent background
// Re-run after changing a scene or an object.
import { chromium } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'

const base = process.env.BASE_URL ?? 'http://localhost:3000'
mkdirSync('public/objects', { recursive: true })
const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] })

/** PNG → WebP in the browser (keeps alpha), no image library needed. */
async function toWebp(page, png, quality = 0.82) {
  const b64 = await page.evaluate(
    async ([data, q]) => {
      const img = new Image()
      img.src = `data:image/png;base64,${data}`
      await img.decode()
      const c = document.createElement('canvas')
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      c.getContext('2d').drawImage(img, 0, 0)
      return c.toDataURL('image/webp', q).split(',')[1]
    },
    [png.toString('base64'), quality],
  )
  return Buffer.from(b64, 'base64')
}

function save(file, buf) {
  writeFileSync(file, buf)
  console.log(file, Math.round(buf.length / 1024) + ' kB')
}

/* ── the objects, each alone on a transparent ground ─────────────── */
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 })
await page.goto(`${base}/?tier=high`, { waitUntil: 'load', timeout: 120000 })
await page.waitForTimeout(3000)
// only the shared 3D canvas stays visible; the slots keep their boxes, so the views still track them
await page.addStyleTag({
  content: `html, body { background: transparent !important; }
    body * { visibility: hidden !important; }
    canvas { visibility: visible !important; }
    main > section:first-child canvas { visibility: hidden !important; }`,
})
const kinds = ['browser', 'parcel', 'pen', 'phone', 'mug', 'plane', 'play', 'tag', 'wordmark']
for (const kind of kinds) {
  const slot = page.locator(`[data-object="${kind}"]`).first()
  if ((await slot.count()) === 0) {
    console.log(`skip ${kind}: no slot on the page at this width`)
    continue
  }
  await slot.scrollIntoViewIfNeeded()
  await page.evaluate(() => window.scrollBy(0, -80))
  await page.waitForTimeout(1800)
  const box = await slot.boundingBox()
  if (!box) continue
  const png = await page.screenshot({ clip: box, omitBackground: true })
  save(`public/objects/${kind}.webp`, await toWebp(page, png))
}
await page.close()

await browser.close()
