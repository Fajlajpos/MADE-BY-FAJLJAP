import { chromium } from '@playwright/test'
const b = await chromium.launch({ args: ['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('http://localhost:3000/', { waitUntil: 'load' }); await p.waitForTimeout(3500)
const shots = process.argv.slice(2)
for (const s of shots) { const [n, sel, off] = s.split('|')
  await p.evaluate(([sel,off]) => { const el=document.querySelector(sel); if(sel==='bottom') return scrollTo(0, 1e6); scrollTo(0, el.getBoundingClientRect().top+scrollY+Number(off)) }, [sel,off])
  await p.waitForTimeout(1600); await p.screenshot({ path: `.shots/t-${n}.png` }) }
await b.close()
