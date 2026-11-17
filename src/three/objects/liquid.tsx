'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { MathUtils, Vector3, type Mesh, type MeshPhysicalMaterial } from 'three'

/**
 * Liquid chrome: a drop of mercury that never sits still. A sphere whose surface is pushed in and
 * out by slow 3D noise in the vertex shader (normals are rebuilt there from the field, so the
 * reflections run with the surface). Where the lamp (cursor) is, the surface swells toward it
 * and rings spread from that point; scrolling stirs it. One geometry, ~20k vertices.
 * `lamp` is the light's world position, `power` 0–1 how near it is (both read every frame).
 */
export type LampState = { position: Vector3; power: number }

/** 3D simplex noise in GLSL as `lq_noise(vec3)`; shared with the other liquid shapes. */
export const SIMPLEX = /* glsl */ `
// 3D simplex noise (Ashima Arts / Stefan Gustavson, MIT)
vec3 lq_mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 lq_mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 lq_perm(vec4 x) { return lq_mod289(((x * 34.0) + 10.0) * x); }
vec4 lq_tis(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float lq_noise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = lq_mod289(i);
  vec4 p = lq_perm(lq_perm(lq_perm(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = lq_tis(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`

const NOISE = /* glsl */ `
${SIMPLEX}
uniform float uTime;
uniform float uStir;
uniform vec3 uLampDir;
uniform float uLampPower;

// how far the surface stands out of the unit sphere in direction n
float lq_field(vec3 n) {
  float f = 0.1 * lq_noise(n * 0.95 + vec3(0.0, uTime * 0.14, uTime * 0.06));
  f += (0.022 + 0.05 * uStir) * lq_noise(n * 2.1 - vec3(uTime * 0.27, 0.0, uTime * 0.1));
  // the lamp: a swell toward it and rings running out from that point
  float d = dot(n, uLampDir);
  float near = smoothstep(0.15, 1.0, d) * uLampPower;
  f += 0.11 * near * near;
  f += 0.014 * sin(acos(clamp(d, -1.0, 1.0)) * 13.0 - uTime * 3.6) * smoothstep(-0.2, 0.75, d) * uLampPower;
  return f;
}
`

export function LiquidShape({ chrome, lamp, radius = 0.7 }: { chrome: MeshPhysicalMaterial; lamp?: LampState; radius?: number }) {
  const mesh = useRef<Mesh>(null)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uStir: { value: 0 },
      uLampDir: { value: new Vector3(-0.5, 0.6, 0.6).normalize() },
      uLampPower: { value: 0.3 },
    }),
    [],
  )
  const material = useMemo(() => {
    const m = chrome.clone()
    m.roughness = 0.08
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms)
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${NOISE}`)
        .replace(
          '#include <beginnormal_vertex>',
          /* glsl */ `
          vec3 lqN = normalize(position);
          vec3 lqA = normalize(abs(lqN.y) < 0.99 ? cross(lqN, vec3(0.0, 1.0, 0.0)) : cross(lqN, vec3(1.0, 0.0, 0.0)));
          vec3 lqB = cross(lqN, lqA);
          vec3 lqNA = normalize(lqN + lqA * 0.012);
          vec3 lqNB = normalize(lqN + lqB * 0.012);
          vec3 lqP = lqN * (1.0 + lq_field(lqN));
          vec3 lqPA = lqNA * (1.0 + lq_field(lqNA));
          vec3 lqPB = lqNB * (1.0 + lq_field(lqNB));
          vec3 objectNormal = normalize(cross(lqPA - lqP, lqPB - lqP));
          if (dot(objectNormal, lqN) < 0.0) objectNormal = -objectNormal;
          `,
        )
        .replace('#include <begin_vertex>', `vec3 transformed = lqP * ${radius.toFixed(4)};`)
    }
    m.customProgramCacheKey = () => `liquid-chrome-${radius}`
    return m
  }, [chrome, uniforms, radius])
  useEffect(() => () => material.dispose(), [material])

  const scroll = useRef({ y: typeof window === 'undefined' ? 0 : window.scrollY, v: 0 })
  const local = useMemo(() => new Vector3(), [])
  useFrame((state, dt) => {
    const m = mesh.current
    if (!m) return
    uniforms.uTime.value = state.clock.elapsedTime
    // stirred by scrolling: speed in px per frame, eased off
    const y = window.scrollY
    const speed = Math.min(1, Math.abs(y - scroll.current.y) / 40)
    scroll.current.y = y
    scroll.current.v = Math.max(speed, MathUtils.damp(scroll.current.v, 0, 2.5, dt))
    uniforms.uStir.value = scroll.current.v
    if (lamp) {
      local.copy(lamp.position)
      m.worldToLocal(local)
      uniforms.uLampDir.value.lerp(local.normalize(), 1 - Math.exp(-8 * dt)).normalize()
      uniforms.uLampPower.value = MathUtils.damp(uniforms.uLampPower.value, lamp.power, 5, dt)
    }
  })

  return (
    <mesh ref={mesh} material={material}>
      <sphereGeometry args={[1, 160, 120]} />
    </mesh>
  )
}
