'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { ShaderMaterial, Vector2 } from 'three'
import type { ScenePalette } from '../tokens'
import { DESK, WALL_Z, WINDOW } from './layout'
import { woodTexture } from './textures'

/**
 * The room: the desk, the wall with the window, and what is outside it — a city at night far
 * below, out of focus: soft discs of light, warm and cold, a few cars crawling along a street.
 */

export function Desk({ palette, shadows }: { palette: ScenePalette; shadows: boolean }) {
  const wood = useMemo(() => woodTexture(`#${palette.wood.getHexString()}`), [palette.wood])
  useEffect(() => () => disposeAll(wood.map, wood.bump), [wood])
  const legX = DESK.width / 2 - 0.05
  const legZ = DESK.depth / 2 - 0.05
  return (
    <group>
      <mesh position={[0, DESK.top - DESK.thickness / 2, 0]} receiveShadow={shadows} castShadow={shadows}>
        <boxGeometry args={[DESK.width, DESK.thickness, DESK.depth]} />
        <meshStandardMaterial map={wood.map} bumpMap={wood.bump} bumpScale={0.6} roughness={0.58} />
      </mesh>
      {(
        [
          [-legX, -legZ],
          [legX, -legZ],
          [-legX, legZ],
          [legX, legZ],
        ] as const
      ).map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, (DESK.top - DESK.thickness) / 2, z]}>
          <boxGeometry args={[0.045, DESK.top - DESK.thickness, 0.045]} />
          <meshStandardMaterial color="#15161a" roughness={0.6} metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function Room({ palette }: { palette: ScenePalette }) {
  const t = 0.16 // wall thickness
  const z = WALL_Z - t / 2
  const { x0, x1, y0, y1 } = WINDOW
  const wall = <meshStandardMaterial color={palette.wall} roughness={0.95} />
  const frame = <meshStandardMaterial color="#b9b4aa" roughness={0.7} />
  const fw = 0.045 // frame width
  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#0c0d10" roughness={0.9} />
      </mesh>
      {/* back wall, built around the window opening */}
      <mesh position={[(x0 - 4) / 2, 2, z]}>
        <boxGeometry args={[x0 + 4, 4, t]} />
        {wall}
      </mesh>
      <mesh position={[(x1 + 4) / 2, 2, z]}>
        <boxGeometry args={[4 - x1, 4, t]} />
        {wall}
      </mesh>
      <mesh position={[(x0 + x1) / 2, y0 / 2, z]}>
        <boxGeometry args={[x1 - x0, y0, t]} />
        {wall}
      </mesh>
      <mesh position={[(x0 + x1) / 2, (y1 + 4) / 2, z]}>
        <boxGeometry args={[x1 - x0, 4 - y1, t]} />
        {wall}
      </mesh>
      {/* left wall */}
      <mesh position={[-1.25, 2, 1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3.2, 4]} />
        {wall}
      </mesh>
      {/* window frame: outer frame, a mullion, a transom, the sill */}
      <group position={[0, 0, WALL_Z - t + 0.04]}>
        <mesh position={[(x0 + x1) / 2, y1 - fw / 2, 0]}>
          <boxGeometry args={[x1 - x0, fw, 0.06]} />
          {frame}
        </mesh>
        <mesh position={[(x0 + x1) / 2, y0 + fw / 2, 0]}>
          <boxGeometry args={[x1 - x0, fw, 0.06]} />
          {frame}
        </mesh>
        <mesh position={[x0 + fw / 2, (y0 + y1) / 2, 0]}>
          <boxGeometry args={[fw, y1 - y0, 0.06]} />
          {frame}
        </mesh>
        <mesh position={[x1 - fw / 2, (y0 + y1) / 2, 0]}>
          <boxGeometry args={[fw, y1 - y0, 0.06]} />
          {frame}
        </mesh>
        <mesh position={[(x0 + x1) / 2, (y0 + y1) / 2, 0]}>
          <boxGeometry args={[0.035, y1 - y0, 0.05]} />
          {frame}
        </mesh>
        <mesh position={[(x0 + x1) / 2, y1 - 0.28, 0]}>
          <boxGeometry args={[x1 - x0, 0.035, 0.05]} />
          {frame}
        </mesh>
        {/* the glass: barely there, catching the lamp */}
        <mesh position={[(x0 + x1) / 2, (y0 + y1) / 2, -0.005]}>
          <planeGeometry args={[x1 - x0, y1 - y0]} />
          <meshStandardMaterial color="#9fb6d6" transparent opacity={0.07} roughness={0.08} metalness={0.2} />
        </mesh>
      </group>
      <mesh position={[(x0 + x1) / 2, y0 - 0.015, WALL_Z + 0.04]}>
        <boxGeometry args={[x1 - x0 + 0.12, 0.03, 0.2]} />
        <meshStandardMaterial color="#c9c4ba" roughness={0.6} />
      </mesh>
    </group>
  )
}

const outsideVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/*
 * A distant city at night, seen out of focus from a high floor. Coordinates are metres on a plane
 * 50 m away; the horizon is at y = 0. Below it: layers of soft bokeh discs, small and dense near
 * the horizon, bigger and sparser further down; a street far below with a few cars crawling
 * along it. Above it: a dark sky lit orange from underneath, and a slow haze over everything.
 */
const outsideFragment = /* glsl */ `
  uniform float uTime;
  uniform vec2 uSize;
  uniform vec3 uSky;
  uniform vec3 uSodium;
  uniform vec3 uWarm;
  uniform vec3 uCold;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float hash1(float n) { return fract(sin(n * 91.7) * 43758.5453); }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  // one out-of-focus light: a flat disc, a little brighter at its rim, soft at the edge
  float disc(vec2 d, float r) {
    float l = length(d);
    float body = 1.0 - smoothstep(r * 0.86, r, l);
    float rim = smoothstep(r * 0.55, r * 0.92, l) * body;
    return body * (0.7 + 0.45 * rim);
  }

  vec3 tint(float h) {
    // mostly sodium orange and warm white; some cold LED; rarely a red or a green signal
    if (h < 0.42) return uSodium;
    if (h < 0.72) return uWarm;
    if (h < 0.92) return uCold;
    if (h < 0.96) return vec3(1.0, 0.2, 0.12);
    return vec3(0.35, 1.0, 0.55);
  }

  // a layer of lights on a grid of square cells, one candidate light per cell
  vec3 lights(vec2 p, float cell, float density, float size, float seed) {
    vec3 acc = vec3(0.0);
    vec2 g = p / cell;
    vec2 id = floor(g);
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 c = id + vec2(float(i), float(j));
        float h = hash(c + seed);
        // denser towards the horizon (cell centre in metres below it)
        float depth = clamp(-(c.y + 0.5) * cell / 26.0, 0.0, 1.0);
        float keep = density * mix(1.0, 0.35, depth);
        if (c.y * cell > -0.6 || h > keep) continue;
        float h2 = hash(c + seed + 7.1);
        float h3 = hash(c + seed + 13.7);
        vec2 at = (c + 0.5 + (vec2(h2, h3) - 0.5) * 0.7) * cell;
        float r = cell * size * (0.55 + 0.6 * hash(c + seed + 3.3));
        // a slow breathing, as if heat or a passing tree were in the way
        float breathe = 0.85 + 0.15 * sin(uTime * (0.2 + h2 * 0.5) + h3 * 30.0);
        float level = (0.35 + 1.4 * h3 * h3) * breathe;
        acc += tint(hash(c + seed + 5.9)) * disc(p - at, r) * level;
      }
    }
    return acc;
  }

  // a lane of cars far below: pairs of lights sliding along, slowly
  vec3 lane(vec2 p, float y, float speed, vec3 col, float seed) {
    float spacing = 9.0;
    float x = p.x - uTime * speed;
    float id = floor(x / spacing);
    float h = hash1(id + seed);
    if (h > 0.4) return vec3(0.0);
    float cx = (id + 0.5 + (hash1(id + seed + 2.0) - 0.5) * 0.5) * spacing;
    float r = 0.42;
    vec3 c = col * (disc(vec2(x - cx + 0.5, p.y - y), r) + disc(vec2(x - cx - 0.5, p.y - y), r));
    return c * (0.9 + 0.8 * h);
  }

  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    p.y -= 6.0; // the horizon (world y = 0, about eye level) is 6 m above the plane's centre

    // the sky: near black up high, the city's orange glow pressing up from the horizon
    float up = clamp(p.y / 30.0, 0.0, 1.0);
    vec3 col = mix(uSky * 0.55, uSky * 0.18, smoothstep(0.0, 1.0, up));
    col += uSodium * 0.22 * exp(-max(p.y, 0.0) / 5.5);
    // below the horizon: the dark mass of the city, warmer the closer to the horizon
    float down = clamp(-p.y / 34.0, 0.0, 1.0);
    col = mix(col, mix(uSodium * 0.08 + uSky * 0.2, vec3(0.006, 0.005, 0.006), smoothstep(0.0, 0.8, down)), step(p.y, 0.0));

    // the lights: three depths of field, far to near
    col += lights(p, 1.6, 0.55, 0.42, 1.0) * 0.8;
    col += lights(p + vec2(31.0, 0.0), 3.4, 0.38, 0.4, 2.0);
    col += lights(p + vec2(7.0, 0.0), 6.5, 0.22, 0.36, 3.0) * 1.15;
    // the street far below: cars in both directions, white one way, red the other
    col += lane(p, -9.0, 1.4, uWarm * 1.2, 11.0);
    col += lane(p, -10.4, -1.1, vec3(1.0, 0.16, 0.08) * 0.9, 23.0);

    // haze drifting over it all, lit warm from the city
    float haze = fbm(p * vec2(0.05, 0.11) + vec2(uTime * 0.01, 0.0));
    float band = exp(-abs(p.y - 2.0) / 9.0);
    col = mix(col, uSodium * 0.18 + uSky * 0.25, haze * band * 0.55);

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

export function Outside({ palette, still }: { palette: ScenePalette; still: boolean }) {
  const city = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: outsideVertex,
        fragmentShader: outsideFragment,
        uniforms: {
          uTime: { value: 37 },
          uSize: { value: new Vector2(240, 120) },
          uSky: { value: palette.sky },
          uSodium: { value: palette.sodium },
          uWarm: { value: palette.windowWarm },
          uCold: { value: palette.windowCold },
        },
      }),
    [palette],
  )
  useEffect(() => () => disposeAll(city), [city])
  useFrame((_, delta) => {
    const time = city.uniforms.uTime
    if (!still && time) time.value += delta
  })
  return (
    // the city, 50 m out; far enough that it barely shifts as the camera moves
    <mesh position={[0, -6, -50]} material={city}>
      <planeGeometry args={[240, 120]} />
    </mesh>
  )
}

function disposeAll(...items: { dispose: () => void }[]) {
  for (const item of items) item.dispose()
}

