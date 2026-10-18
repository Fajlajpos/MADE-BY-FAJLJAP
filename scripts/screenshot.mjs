// Usage: node scripts/screenshot.mjs <path without leading slash, e.g. prace> [widths=375,1440] [--reduced] [--full] [--cpu] [--scroll=<px>]
// Saves .shots/<slug>-<width>[-reduced][-cpu].png and prints console errors + horizontal overflow.
// Runs on the real GPU by default (the asciify fields need it); --cpu forces software WebGL,
// which the fields treat as "no GPU", so the CPU character renderer takes over.
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const [rawPath = '/', widthsArg = '375,1440', ...flags] = process.argv.slice(2)
// Git Bash rewrites "/x" into "C:/Program Files/Git/x" — undo that, then normalise.
const path = '/' + rawPath.replace(/^[A-Za-z]:\/.*?\/Git\//, '').replace(/^\/+/, '')
const reduced = flags.includes('--reduced')
const fullPage = flags.includes('--full')
const cpu = flags.includes('--cpu')
const scroll = Number(flags.find((f) => f.startsWith('--scroll='))?.split('=')[1] ?? 0)
const base = process.env.BASE_URL ?? 'http://localhost:3000'
const slug = path.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'

mkdirSync('.shots', { recursive: true })
const browser = await chromium.launch({
  args: cpu
    ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
    : ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
})

for (const width of widthsArg.split(',').map(Number)) {
  const page = await browser.newPage({
    viewport: { width, height: width < 768 ? 812 : 900 },
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  })
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(base + path, { waitUntil: 'networkidle' })
  if (scroll) {
    await page.evaluate((y) => window.scrollTo(0, y), scroll)
    await page.waitForTimeout(600)
  }
  // sweep the cursor across so the trails show
  for (let i = 0; i <= 12; i++) {
    await page.mouse.move(width * (0.2 + i * 0.05), 380 + Math.sin(i) * 60)
    await page.waitForTimeout(30)
  }
  await page.waitForTimeout(1500)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  const modes = await page.evaluate(() =>
    [...document.querySelectorAll('[data-ascii]')]
      .map((el) => el.getAttribute('data-ascii'))
      .join(','),
  )
  const file = `.shots/${slug}-${width}${scroll ? `-y${scroll}` : ''}${reduced ? '-reduced' : ''}${cpu ? '-cpu' : ''}.png`
  await page.screenshot({ path: file, fullPage })
  console.log(`${file}  overflowX=${overflow}px  errors=${errors.length}  fields=[${modes}]`)
  for (const e of errors) console.log('   x', e)
  await page.close()
}
await browser.close()
