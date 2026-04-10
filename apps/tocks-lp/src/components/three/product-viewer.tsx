'use client'

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF, ContactShadows } from '@react-three/drei'
import type { Group } from 'three'

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  const ref = useRef<Group>(null)

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.15
  })

  return <primitive ref={ref} object={scene} scale={1} />
}

interface ProductViewerProps {
  modelUrl: string
  className?: string
}

export default function ProductViewer({ modelUrl, className = '' }: ProductViewerProps) {
  return (
    <div className={`w-full aspect-square ${className}`}>
      <Canvas camera={{ position: [3, 2, 5], fov: 45 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Model url={modelUrl} />
          <ContactShadows position={[0, -1, 0]} opacity={0.4} blur={2} />
          <Environment preset="studio" />
        </Suspense>
        <OrbitControls enableZoom={true} enablePan={false} minDistance={3} maxDistance={8} />
      </Canvas>
    </div>
  )
}
