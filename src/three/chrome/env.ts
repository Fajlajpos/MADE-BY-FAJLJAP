import {
  BackSide,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SphereGeometry,
  type Texture,
  type WebGLRenderer,
} from 'three'

/**
 * The studio chrome is photographed in on the night desk: a dark room with two long light strips, one signal
 * orange and one ultramarine, a thin white softbox above and a faint bounce from below. Built in
 * code and baked once with PMREM — no HDR file to download. Every chrome surface reflects it, so
 * the site's two colours run along every edge.
 */
export function createChromeEnvironment(
  renderer: WebGLRenderer,
  { warm, cold }: { warm: Color; cold: Color },
): Texture {
  const scene = new Scene()
  scene.background = new Color('#06070b')

  const strip = (color: Color, intensity: number, w: number, h: number, pos: [number, number, number]) => {
    const mesh = new Mesh(
      new PlaneGeometry(w, h),
      new MeshBasicMaterial({ color: color.clone().multiplyScalar(intensity), side: DoubleSide }),
    )
    mesh.position.set(...pos)
    mesh.lookAt(0, 0, 0)
    scene.add(mesh)
  }

  strip(warm, 5, 2.2, 9, [-6, 1, 3]) // warm strip, left
  strip(cold, 6, 2.2, 9, [6, 0, 2.5]) // cold strip, right
  strip(new Color('#ffffff'), 3.2, 8, 1, [0, 7, 1]) // softbox above
  strip(cold, 1.6, 12, 3, [0, -1, -8]) // cold wash behind
  strip(warm, 0.9, 14, 2, [0, -6, 2]) // warm bounce from below
  strip(new Color('#ffffff'), 2, 1, 5, [-2, 2, 7]) // a narrow key light in front

  const pmrem = new PMREMGenerator(renderer)
  const target = pmrem.fromScene(scene, 0.035)
  pmrem.dispose()
  scene.traverse((o) => {
    const m = o as Mesh
    if (m.isMesh) {
      m.geometry.dispose()
      ;(m.material as MeshBasicMaterial).dispose()
    }
  })
  return target.texture
}

/**
 * The studio for the page, where chrome stands on black stock: it has to read as bright metal
 * there, not as a silhouette. So the room is not black — a warm grey dome, darker under the
 * floor — and in front of the objects (what their faces mirror) hangs a large card that fades
 * from light at the top to dark at the bottom, the way a product shot keeps flat chrome alive.
 * The two inks run along the edges as tall strips, a warm softbox (the lamp's colour) sits above
 * left, thin white rims behind. The lamp itself is a real light that follows the cursor.
 */
export function createPageEnvironment(
  renderer: WebGLRenderer,
  { warm, cold, lamp }: { warm: Color; cold: Color; lamp: Color },
): Texture {
  const scene = new Scene()
  const disposables: { dispose(): void }[] = []

  // the dome: vertex colours from the floor (near black) to the ceiling (warm grey)
  const domeGeo = new SphereGeometry(30, 32, 16)
  const top = new Color('#5c544a')
  const horizon = new Color('#332e28')
  const floor = new Color('#16130f')
  const pos = domeGeo.getAttribute('position')
  const colors: number[] = []
  const c = new Color()
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 30
    if (y > 0) c.lerpColors(horizon, top, Math.pow(y, 0.8))
    else c.lerpColors(horizon, floor, Math.min(1, -y * 2.2))
    colors.push(c.r, c.g, c.b)
  }
  domeGeo.setAttribute('color', new Float32BufferAttribute(colors, 3))
  const domeMat = new MeshBasicMaterial({ vertexColors: true, side: BackSide })
  scene.add(new Mesh(domeGeo, domeMat))
  disposables.push(domeGeo, domeMat)

  const card = (w: number, h: number, pos3: [number, number, number], from: Color, to: Color) => {
    const geo = new PlaneGeometry(w, h, 1, 8)
    const p = geo.getAttribute('position')
    const col: number[] = []
    for (let i = 0; i < p.count; i++) {
      const t = p.getY(i) / h + 0.5 // 0 bottom … 1 top
      c.lerpColors(to, from, t)
      col.push(c.r, c.g, c.b)
    }
    geo.setAttribute('color', new Float32BufferAttribute(col, 3))
    const mat = new MeshBasicMaterial({ vertexColors: true, side: DoubleSide })
    const mesh = new Mesh(geo, mat)
    mesh.position.set(...pos3)
    mesh.lookAt(0, 0, 0)
    scene.add(mesh)
    disposables.push(geo, mat)
  }
  const strip = (color: Color, intensity: number, w: number, h: number, pos3: [number, number, number]) =>
    card(w, h, pos3, color.clone().multiplyScalar(intensity), color.clone().multiplyScalar(intensity))

  // the big card in front: light grey at the top, gone by the bottom
  card(22, 14, [0, 2, 9], new Color('#e2dccf').multiplyScalar(1.25), new Color('#221f1b'))
  // the lit desk under the objects, bouncing a little warm light back up into their bellies
  card(14, 10, [0, -7, 3], new Color('#4a3a2a'), new Color('#4a3a2a'))
  strip(warm, 4.5, 1.6, 10, [-7, 0.5, 3.5]) // orange ink, a tall strip on the left
  strip(cold, 5, 1.6, 10, [7, 0, 3]) // blue ink on the right
  strip(lamp, 3.2, 6, 2.4, [-3, 7, 4]) // the warm softbox above left
  strip(new Color('#ffffff'), 2.6, 9, 0.6, [0, 6, -4]) // a white rim behind, above
  strip(new Color('#ffffff'), 1.8, 0.5, 8, [-5, 1, -5]) // and one behind on the left
  strip(cold, 1.4, 14, 2, [0, -4, -6]) // a cold wash low behind

  const pmrem = new PMREMGenerator(renderer)
  const target = pmrem.fromScene(scene, 0.03)
  pmrem.dispose()
  for (const d of disposables) d.dispose()
  return target.texture
}
