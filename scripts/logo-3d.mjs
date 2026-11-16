// Usage: node scripts/logo-3d.mjs [yaw=-16] [pitch=8]
// Renders the logotype as a real 3D chrome object:
//   1. the letters' shape is read from the cut-out logo (public/brand/logo-fajlajp.png, alpha),
//   2. a distance transform turns it into an inflated "balloon" — rounded on both faces, closed at
//      the edges — built as a mesh (front + back height fields),
//   3. three.js renders it in a studio: an environment of soft boxes and a dark horizon (PMREM),
//      polished chrome (metalness 1, low roughness), turned a little in perspective,
//   4. the render is trimmed and saved with a transparent background.
// Output: public/brand/logo-fajlajp-3d.png / .webp, logo-fajlajp-3d-nav.webp, .shots/logo-3d.png
import { chromium } from '@playwright/test'
import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { join, extname } from 'node:path'
import sharp from 'sharp'

const [yaw = '-16', pitch = '8'] = process.argv.slice(2)
const ROOT = process.cwd()
const TYPES = { '.js': 'text/javascript', '.png': 'image/png', '.html': 'text/html' }

const page = /* html */ `<!doctype html><html><head><script type="importmap">
{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}
</script></head><body style="margin:0;background:transparent"><canvas id="c" style="display:block"></canvas>
<script type="module">
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

const W = 3000, H = 760
const img = new Image(); img.src = '/public/brand/logo-fajlajp.png'; await img.decode()

// the mask, on a grid ~1500 cells wide
const GX = 2600, GY = Math.round(GX * img.height / img.width)
const cv = new OffscreenCanvas(GX, GY); const cx = cv.getContext('2d')
cx.drawImage(img, 0, 0, GX, GY)
const px = cx.getImageData(0, 0, GX, GY).data
const inside = new Uint8Array(GX * GY)
for (let i = 0; i < GX * GY; i++) inside[i] = px[i * 4 + 3] > 120 ? 1 : 0

// exact distance transform (Felzenszwalb)
function edt1d(f, n, d, v, z) { let k = 0; v[0] = 0; z[0] = -Infinity; z[1] = Infinity
  for (let q = 1; q < n; q++) { let s = (f[q] + q*q - (f[v[k]] + v[k]*v[k])) / (2*q - 2*v[k])
    while (s <= z[k]) { k--; s = (f[q] + q*q - (f[v[k]] + v[k]*v[k])) / (2*q - 2*v[k]) }
    k++; v[k] = q; z[k] = s; z[k+1] = Infinity }
  k = 0; for (let q = 0; q < n; q++) { while (z[k+1] < q) k++; d[q] = (q - v[k])**2 + f[v[k]] } }
const g = new Float64Array(GX * GY); for (let i = 0; i < GX*GY; i++) g[i] = inside[i] ? 1e20 : 0
{ const n = Math.max(GX, GY), f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n+1)
  for (let x = 0; x < GX; x++) { for (let y = 0; y < GY; y++) f[y] = g[y*GX+x]; edt1d(f, GY, d, v, z); for (let y = 0; y < GY; y++) g[y*GX+x] = d[y] }
  for (let y = 0; y < GY; y++) { for (let x = 0; x < GX; x++) f[x] = g[y*GX+x]; edt1d(f, GX, d, v, z); for (let x = 0; x < GX; x++) g[y*GX+x] = Math.sqrt(d[x]) } }

// inflate from a smooth field: the mask blurred (3 box passes ≈ gaussian) is continuous, so its
// iso-line at 0.5 is the outline and the height grows smoothly inside — no stepped rings
let maxD = 0; for (let i = 0; i < GX*GY; i++) maxD = Math.max(maxD, g[i])
const rad = Math.max(2, Math.round(maxD * 0.32))
function boxBlur(src, r) {
  const tmp = new Float32Array(GX*GY), out = new Float32Array(GX*GY), n = 2*r+1
  for (let y = 0; y < GY; y++) { let acc = 0
    for (let x = -r; x <= r; x++) acc += src[y*GX + Math.min(GX-1, Math.max(0, x))]
    for (let x = 0; x < GX; x++) { tmp[y*GX+x] = acc/n; acc += src[y*GX + Math.min(GX-1, x+r+1)] - src[y*GX + Math.max(0, x-r)] } }
  for (let x = 0; x < GX; x++) { let acc = 0
    for (let y = -r; y <= r; y++) acc += tmp[Math.min(GY-1, Math.max(0, y))*GX + x]
    for (let y = 0; y < GY; y++) { out[y*GX+x] = acc/n; acc += tmp[Math.min(GY-1, y+r+1)*GX + x] - tmp[Math.max(0, y-r)*GX + x] } }
  return out }
let field = new Float32Array(GX*GY); for (let i = 0; i < GX*GY; i++) field[i] = inside[i]
for (let k = 0; k < 3; k++) field = boxBlur(field, rad)
// a thin stroke never reaches 1 when blurred: normalise by the local stroke (the distance field)
const sm = new Float32Array(GX*GY)
// the outline stays exactly the logo's; the height comes from the smooth field, eased to zero
// over the last few cells so front and back meet cleanly at the edge
const ease = (x) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t) }
for (let i = 0; i < GX*GY; i++) {
  if (!inside[i]) continue
  // the blurred field is ~0.5 on the outline: the height starts there, so the edge is smooth
  const t = Math.min(1, Math.max(0, (field[i] - 0.4) / 0.6))
  sm[i] = maxD * 0.85 * Math.sqrt(ease(t * 1.4) * t)
}
// a final light smoothing of the heights
for (let pass = 0; pass < 4; pass++) { const c = sm.slice()
  for (let y = 1; y < GY-1; y++) for (let x = 1; x < GX-1; x++) { const i = y*GX+x; if (!inside[i]) continue
    sm[i] = (c[i]*4 + c[i-1] + c[i+1] + c[i-GX] + c[i+GX]) / 8 } }
// the mesh: front and back height fields sharing the outline
const S = 1 / GX * 10 // world units per cell (the word is 10 units wide)
const pos = new Float32Array(GX * GY * 2 * 3)
for (let side = 0; side < 2; side++) for (let y = 0; y < GY; y++) for (let x = 0; x < GX; x++) {
  const i = y*GX+x, o = (side*GX*GY + i) * 3
  pos[o] = (x - GX/2) * S; pos[o+1] = (GY/2 - y) * S; pos[o+2] = (side ? -1 : 1) * sm[i] * S }
const idx = []
for (let y = 0; y < GY-1; y++) for (let x = 0; x < GX-1; x++) {
  const a = y*GX+x, b = a+1, c = a+GX, d = c+1
  if (!(inside[a] || inside[b] || inside[c] || inside[d])) continue
  if (!(inside[a] && inside[b] && inside[c] && inside[d]) && (inside[a]+inside[b]+inside[c]+inside[d]) < 3) continue
  idx.push(a, c, b, b, c, d)
  const o = GX*GY; idx.push(o+a, o+b, o+c, o+b, o+d, o+c) }
const geo = new THREE.BufferGeometry()
geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
geo.setIndex(idx); geo.computeVertexNormals()

// renderer, studio, chrome
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: true, alpha: true, preserveDrawingBuffer: true })
renderer.setPixelRatio(1); renderer.setSize(W * 2, H * 2, false)
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05
renderer.outputColorSpace = THREE.SRGBColorSpace
const scene = new THREE.Scene()
// a studio: the room environment plus long soft boxes and a dark floor band, for crisp chrome
const studio = new RoomEnvironment()
const box = (w, h, x, y, z, ry, intensity) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(intensity, intensity, intensity), side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.y = ry; m.lookAt(0, 0, 0); studio.add(m) }
box(14, 1.2, 0, 6, 4, 0, 6); box(1.4, 9, -7, 1, 3, 0, 5); box(1.2, 9, 7, 2, -1, 0, 4); box(12, 0.6, 0, -1.2, 7, 0, 3)
const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ color: 0x050505 })); floor.rotation.x = -Math.PI/2; floor.position.y = -3.5; studio.add(floor)
const pmrem = new THREE.PMREMGenerator(renderer)
scene.environment = pmrem.fromScene(studio, 0.02).texture
const mat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.06, envMapIntensity: 1.25, clearcoat: 0.6, clearcoatRoughness: 0.05 })
const mesh = new THREE.Mesh(geo, mat)
mesh.rotation.set(${Number(pitch)} * Math.PI/180, ${Number(yaw)} * Math.PI/180, 0)
scene.add(mesh)
const cam = new THREE.PerspectiveCamera(22, W / H, 0.1, 100); cam.position.set(0, 0, 11.2); cam.lookAt(0, 0, 0)
renderer.render(scene, cam)
window.__done = true
</script></body></html>`

const server = createServer((req, res) => {
  if (req.url === '/') return res.writeHead(200, { 'content-type': 'text/html' }).end(page)
  try {
    const file = join(ROOT, decodeURIComponent(req.url.split('?')[0]))
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file))
  } catch {
    res.writeHead(404).end()
  }
}).listen(0)
const port = server.address().port

const b = await chromium.launch({ args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport: { width: 6000, height: 1520 } })
p.on('pageerror', (e) => console.log('page error', e.message))
await p.goto(`http://localhost:${port}/`)
await p.waitForFunction(() => window.__done === true, null, { timeout: 120000 })
const shot = await p.locator('#c').screenshot({ omitBackground: true })
await b.close()
server.close()

const half = await sharp(shot).resize(3000, 760, { kernel: 'lanczos3' }).png().toBuffer()
const trimmed = await sharp(half).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true })
await sharp(trimmed.data).png({ compressionLevel: 9 }).toFile('public/brand/logo-fajlajp-3d.png')
await sharp(trimmed.data).webp({ quality: 92, alphaQuality: 100 }).toFile('public/brand/logo-fajlajp-3d.webp')
await sharp(trimmed.data).resize(760).webp({ quality: 90, alphaQuality: 100 }).toFile('public/brand/logo-fajlajp-3d-nav.webp')
const { width, height } = trimmed.info
const prev = await sharp({ create: { width: width + 120, height: height + 120, channels: 3, background: '#0b0b0e' } })
  .composite([{ input: trimmed.data, left: 60, top: 60 }])
  .png()
  .toBuffer()
await sharp(prev).resize(1600).toFile('.shots/logo-3d.png')
console.log(`logo-fajlajp-3d: ${width}×${height}`)
