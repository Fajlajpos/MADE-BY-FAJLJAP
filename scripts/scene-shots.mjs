// Usage: node scripts/scene-shots.mjs [widths=375,1440] [progress=0,0.3,0.6,0.95] [--reduced] [--cpu]
// Screenshots the homepage hero (the night desk) at points of its scroll progress.
// Saves .shots/desk-<width>-p<progress>[-reduced][-cpu].png, prints console errors and overflow.
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const [widthsArg = '375,1440', progressArg = '0,0.3,0.6,0.95', ...flags] = process.argv.slice(2)
const reduced = flags.includes('--reduced')
const cpu = flags.includes('--cpu')
const base = process.env.BASE_URL ?? 'http://localhost:3000'

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
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(`${m.type()}: ${m.text()}`))
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(base + '/', { waitUntil: 'load', timeout: 120000 })
  await page.waitForTimeout(3500)
  for (const p of progressArg.split(',').map(Number)) {
    await page.evaluate((p) => {
      const hero = document.querySelector('[data-desk-hero]')
      if (!hero) return
      const top = hero.getBoundingClientRect().top + window.scrollY
      const run = hero.offsetHeight - window.innerHeight
      window.scrollTo(0, top + run * p)
    }, p)
    await page.mouse.move(width * 0.55, 420)
    await page.waitForTimeout(2200)
    const info = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      tier: document.querySelector('[data-desk-hero]')?.getAttribute('data-tier') ?? '-',
    }))
    const file = `.shots/desk-${width}-p${p}${reduced ? '-reduced' : ''}${cpu ? '-cpu' : ''}.png`
    await page.screenshot({ path: file })
    console.log(`${file}  overflowX=${info.overflow}px  tier=${info.tier}`)
  }
  console.log(`  errors/warnings: ${errors.length}`)
  for (const e of [...new Set(errors)].slice(0, 15)) console.log('   x', e.slice(0, 300))
  await page.close()
}
await browser.close()
