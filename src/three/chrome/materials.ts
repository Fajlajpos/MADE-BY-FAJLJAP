import { useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { Color, MathUtils, MeshPhysicalMaterial, type Texture } from 'three'
import { readPalette } from '../tokens'
import { createPageEnvironment } from './env'

/**
 * The materials every object on the page is made of:
 *  - chrome:  polished metal, mirrors the page studio (warm grey room, orange + blue strips) and
 *             catches the lamp (cursor) as a warm highlight
 *  - orange / blue: glossy enamel in the two inks, for small parts (dots, tape, buttons)
 *  - dark:    black glass, for screens and insets
 *  - enamel:  white enamel (the mug, the parcel's label)
 * One set per canvas (the env map belongs to its renderer).
 */
export type ChromeKit = {
  env: Texture
  chrome: MeshPhysicalMaterial
  orange: MeshPhysicalMaterial
  blue: MeshPhysicalMaterial
  dark: MeshPhysicalMaterial
  enamel: MeshPhysicalMaterial
}

export function useChromeKit(): ChromeKit {
  const gl = useThree((s) => s.gl)
  const kit = useMemo(() => {
    const palette = readPalette()
    const env = createPageEnvironment(gl, { warm: palette.orange, cold: palette.blue, lamp: palette.cursorLamp })
    const physical = (params: ConstructorParameters<typeof MeshPhysicalMaterial>[0]) =>
      new MeshPhysicalMaterial({ envMap: env, ...params })
    const enamel = { metalness: 0.1, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1 }
    const chrome = physical({
      color: '#f1efea',
      metalness: 1,
      roughness: 0.14,
      envMapIntensity: 1.45,
      clearcoat: 0.5,
      clearcoatRoughness: 0.08,
      iridescence: 0.55,
      iridescenceIOR: 1.7,
      iridescenceThicknessMinimum: 180,
      iridescenceThicknessMaximum: 520,
    })
    return {
      env,
      // a thin oily film on the chrome: the highlights run from violet to teal as it turns
      chrome,
      orange: physical({ color: palette.orange, ...enamel }),
      blue: physical({ color: palette.blue, ...enamel }),
      dark: physical({ color: '#16130f', metalness: 0.4, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1 }),
      enamel: physical({ color: palette.ink, metalness: 0, roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 0.8 }),
    } satisfies ChromeKit
  }, [gl])
  useEffect(
    () => () => {
      kit.env.dispose()
      for (const m of [kit.chrome, kit.orange, kit.blue, kit.dark, kit.enamel]) m.dispose()
    },
    [kit],
  )
  return kit
}

/**
 * A material that turns from a real surface (cardboard, black plastic, brass) into chrome.
 * `setMorph(m, t)`: 0 = the thing on the desk, 1 = the chrome symbol of the service.
 */
export type Morph = { color: Color; metalness: number; roughness: number }

export function createMorphMaterial(env: Texture, real: Morph, chrome: Morph = CHROME): MeshPhysicalMaterial {
  const m = new MeshPhysicalMaterial({
    color: real.color.clone(),
    metalness: real.metalness,
    roughness: real.roughness,
    envMap: env,
    envMapIntensity: 0,
    clearcoat: 0.3,
    clearcoatRoughness: 0.2,
  })
  m.userData.morph = { real, chrome }
  return m
}

export const CHROME: Morph = { color: new Color('#e9ebf1'), metalness: 1, roughness: 0.14 }

export function setMorph(m: MeshPhysicalMaterial, t: number) {
  const { real, chrome } = m.userData.morph as { real: Morph; chrome: Morph }
  m.color.lerpColors(real.color, chrome.color, t)
  m.metalness = MathUtils.lerp(real.metalness, chrome.metalness, t)
  m.roughness = MathUtils.lerp(real.roughness, chrome.roughness, t)
  m.envMapIntensity = t * 1.3
}
