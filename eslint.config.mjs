import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const config = [
  ...nextVitals,
  ...nextTs,
  {
    // React Three Fiber: three.js objects (cameras, materials, uniforms, vectors) are meant to be
    // mutated inside useFrame every frame, outside React's render — the library's core pattern.
    files: ['src/three/**/*.{ts,tsx}'],
    rules: { 'react-hooks/immutability': 'off' },
  },
  // .backup holds earlier directions, outside git and outside the app
  { ignores: ['.next/**', 'node_modules/**', '.backup/**', 'next-env.d.ts'] },
]

export default config
