import { chromium } from '@playwright/test'
const b = await chromium.launch({ args: ['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist'] })
for (const [w,h] of [[1440,900],[375,812]]) {
const p = await b.newPage({ viewport: { width: w, height: h } })
const errs=[]; p.on('pageerror', e=>errs.push(e.message)); p.on('console', m=>m.type()==='error'&&errs.push(m.text().slice(0,120)))
await p.goto('http://localhost:3000/', { waitUntil: 'load' }); await p.waitForTimeout(6000)
await p.mouse.move(5,h-5); await p.waitForTimeout(800)
await p.screenshot({ path: `.shots/arch-${w}.png` }); console.log(w, errs, await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth)); await p.close() }
await b.close()
