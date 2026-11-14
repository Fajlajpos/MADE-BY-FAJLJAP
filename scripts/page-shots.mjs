// Usage: node scripts/page-shots.mjs [widths=1440] [--reduced] [--cpu]   (with `npm run dev` running)
// Walks the homepage — the hero at points of its progress, then every section — and saves a
// viewport screenshot of each stop: .shots/page-<width>-<nn>-<stop>.png. Prints console errors,
// horizontal overflow and the 3D tier per width.
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const [widthsArg = '1440', ...flags] = process.argv.slice(2)
const reduced = flags.includes('--reduced')
const cpu = flags.includes('--cpu')
const base = process.env.BASE_URL ?? 'http://localhost:3000'

const stops = [
  ['hero-0', { hero: 0 }],
  ['hero-30', { hero: 0.3 }],
  ['hero-70', { hero: 0.7 }],
  ['hero-90', { hero: 0.9 }],
  ['sluzby', { id: 'co-delam', offset: 0 }],
  ['sluzba-1', { id: 'sluzba-weby', offset: -200 }],
  ['sluzba-3', { id: 'sluzba-grafika', offset: -200 }],
  ['prace', { id: 'prace', offset: 0 }],
  ['prace-2', { id: 'prace', offset: 700 }],
  ['o-mne', { id: 'o-mne', offset: 0 }],
  ['mimo', { id: 'mimo-title', offset: -150 }],
  ['kontakt', { id: 'kontakt', offset: 0 }],
  ['pata', { bottom: true }],
]

mkdirSync('.shots', { recursive: true })
const browser = await chromium.launch({
  args: cpu ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
})

for (const width of widthsArg.split(',').map(Number)) {
  const page = await browser.newPage({
    viewport: { width, height: width < 768 ? 812 : 900 },
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  })
  const errors = []
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(`${m.type()}: ${m.text()}`))
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(base + '/', { waitUntil: 'load', timeout: 120000 })
  await page.waitForTimeout(4000)
  let n = 0
  for (const [name, stop] of stops) {
    await page.evaluate((stop) => {
      let y = 0
      if ('hero' in stop) {
        const h = document.querySelector('main section')
        const top = h.getBoundingClientRect().top + scrollY
        y = top + h.offsetHeight * stop.hero
      } else if (stop.bottom) {
        y = document.documentElement.scrollHeight
      } else {
        const el = document.getElementById(stop.id)
        y = el ? el.getBoundingClientRect().top + scrollY - 64 + stop.offset : 0
      }
      window.scrollTo(0, y)
    }, stop)
    await page.waitForTimeout(2200)
    const file = `.shots/page-${width}-${String(n++).padStart(2, '0')}-${name}${reduced ? '-reduced' : ''}${cpu ? '-cpu' : ''}.png`
    await page.screenshot({ path: file })
  }
  const info = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    tier: document.querySelector('[data-tier]')?.getAttribute('data-tier') ?? '-',
    canvases: document.querySelectorAll('canvas').length,
  }))
  console.log(`${width}px  overflowX=${info.overflow}  tier=${info.tier}  canvases=${info.canvases}  errors/warnings=${errors.length}`)
  for (const e of [...new Set(errors)].slice(0, 12)) console.log('   x', e.slice(0, 260))
  await page.close()
}
await browser.close()
