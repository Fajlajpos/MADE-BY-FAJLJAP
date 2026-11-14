'use client'

import { useGLTF } from '@react-three/drei'
import { Component, Suspense, useMemo, type ReactNode } from 'react'
import type { Mesh } from 'three'
import { getModel, type ModelKey } from '@/content/models'

/**
 * A replaceable object. With a `src` in src/content/models.ts the .glb is loaded (shadows on for
 * every mesh); until then — and while it loads, or if it fails — the procedural stand-in
 * (`children`) is drawn. Swapping a model is one line in models.ts, nothing here.
 */
export function ModelSlot({ slot, children }: { slot: ModelKey; children: ReactNode }) {
  const model = getModel(slot)
  if (!model.src) return <>{children}</>
  return (
    <Fallback fallback={children}>
      <Suspense fallback={children}>
        <Gltf src={model.src} scale={model.scale} position={model.position} rotation={model.rotation} />
      </Suspense>
    </Fallback>
  )
}

function Gltf({
  src,
  scale = 1,
  position,
  rotation,
}: {
  src: string
  scale?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  const { scene } = useGLTF(src)
  const object = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      const mesh = child as Mesh
      if (mesh.isMesh) {
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
    return clone
  }, [scene])
  return <primitive object={object} scale={scale} position={position} rotation={rotation} />
}

/** A model that fails to load falls back to its stand-in instead of taking the scene down. */
class Fallback extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.warn('[three] model failed to load, using the stand-in', error)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
